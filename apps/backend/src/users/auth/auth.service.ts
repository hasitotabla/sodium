import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../users.service';
import { InviteService } from 'src/invite/invite.service';
import { InviteEntity } from 'src/invite/invite.entity';
import { SettingsService } from 'src/settings/settings.service';
import { TokenType } from '$shared/enums/Token';
import { IRequest } from '$shared/requests';

const ACCESS_TOKEN_EXPIRATION = '15m';
const REFRESH_TOKEN_EXPIRATION = '30d';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private inviteService: InviteService,
    private settingsService: SettingsService,
  ) {}

  async validateUser(data: {
    email: string;
    password: string;
  }): Promise<IRequest['/auth/login'] | null> {
    const { email, password } = data;

    let foundUser = await this.usersService.findOneBy({
      email,
    });
    if (!foundUser) {
      return null;
    }

    const hashed = this.hashPassword(password, foundUser.salt);
    if (!bcrypt.compareSync(password, hashed)) {
      return null;
    }

    delete foundUser.password;
    delete foundUser.salt;

    const accessToken = this.jwtService.sign(
      { id: foundUser.id, tokenType: TokenType.ACCESS },
      {
        secret: process.env.SIGN_SECRET,
        expiresIn: ACCESS_TOKEN_EXPIRATION,
      },
    );
    const refreshToken = this.jwtService.sign(
      { id: foundUser.id, tokenType: TokenType.REFRESH },
      {
        secret: process.env.SIGN_SECRET,
        expiresIn: REFRESH_TOKEN_EXPIRATION,
      },
    );

    return {
      refreshToken,
      accessToken,
      user: foundUser,
    };
  }

  async register({
    email,
    password,
    inviteCode,
  }: {
    email: string;
    password: string;
    inviteCode?: string;
  }): Promise<{ success: boolean; error?: string }> {
    const existingUser = await this.usersService.findOneBy({
      email,
    });
    if (existingUser) {
      return {
        success: false,
        error: 'User already exists',
      };
    }

    const isRegistrationOpen = await this.settingsService.findOrInsert(
      'is_registration_open',
      true,
    );
    if (!isRegistrationOpen) {
      return {
        success: false,
        error: 'Registration is closed',
      };
    }

    let usedInvite: InviteEntity | null = null;
    const inviteRequired = await this.settingsService.findOrInsert(
      'invite_only',
      false,
    );

    if (inviteRequired) {
      if (!inviteCode)
        return {
          success: false,
          error: 'Invite code required',
        };

      usedInvite = await this.inviteService.findByCode(inviteCode);
      if (!usedInvite)
        return {
          success: false,
          error: 'Invalid invite code',
        };

      if (usedInvite.used_by)
        return {
          success: false,
          error: 'Invite code already used',
        };
    }

    const salt = bcrypt.genSaltSync();
    const hashed = this.hashPassword(password, salt);

    const user = await this.usersService.create({
      email,
      password: hashed,
      salt,
    });

    if (usedInvite) {
      await this.inviteService.setUsedBy(usedInvite.code, user);
    }

    return {
      success: true,
    };
  }

  async changePassword(
    userId: number,
    newPassword: string,
    currentPassword: string,
  ) {
    const user = await this.usersService.findOneBy({
      id: userId,
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!bcrypt.compareSync(currentPassword, user.password)) {
      throw new UnauthorizedException('Invalid current password');
    }

    user.password = this.hashPassword(newPassword, user.salt);
    await user.save();

    return true;
  }

  async refreshToken(refreshToken: string): Promise<string | null> {
    try {
      const { id } = this.jwtService.verify(refreshToken, {
        secret: process.env.SIGN_SECRET,
      }) as { id: number };

      const user = await this.usersService.findOneBy({
        id,
      });
      if (!user) {
        return null;
      }

      const payload = { id: user.id, tokenType: TokenType.ACCESS },
        secret = process.env.SIGN_SECRET;

      return this.jwtService.sign(payload, {
        secret,
        expiresIn: ACCESS_TOKEN_EXPIRATION,
      });
    } catch (e) {
      return null;
    }
  }

  private hashPassword(password: string, salt: string): string {
    return bcrypt.hashSync(password, salt);
  }
}
