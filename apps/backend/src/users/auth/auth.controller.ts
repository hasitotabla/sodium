import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  NotFoundException,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { Request, Response } from 'express';

import { AuthService } from './auth.service';
import {
  AuthLoginDTO,
  AuthPasswordChangeDTO,
  AuthRefreshDTO,
  AuthRegisterDTO,
} from './auth.dto';
import { SharedUser } from '$shared/types/User';
import { SettingsService } from 'src/settings/settings.service';
import { IRequest } from '$shared/Requests';
import { AuthGuard } from './auth.guard';
import { User } from '../users.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private settingsService: SettingsService,
  ) {}

  @Post('login')
  async login(
    @Body() data: AuthLoginDTO,
    @Req() req: Request,
  ): Promise<IRequest['/auth/login']> {
    if (req.user) {
      throw new BadRequestException('Already logged in');
    }

    const validated = await this.authService.validateUser(data);
    if (!validated) {
      throw new NotFoundException('Invalid email or password');
    }

    const { accessToken, refreshToken, user } = validated;
    if (!accessToken || !refreshToken || !user) {
      throw new NotFoundException('Invalid email or password');
    }

    return { accessToken, refreshToken, user };
  }

  @Post('register')
  async register(
    @Body() { email, password, inviteCode }: AuthRegisterDTO,
    @Res() res: Response,
  ) {
    const { success, error } = await this.authService.register({
      email,
      password,
      inviteCode,
    });
    if (!success) {
      throw new HttpException(error, 400);
    }

    return res.status(201).send();
  }

  @UseGuards(AuthGuard())
  @Put('passwordChange')
  async passwordChange(
    @User() user: SharedUser,
    @Body() data: AuthPasswordChangeDTO,
  ): Promise<IRequest['/users/passwordChange']> {
    return this.authService.changePassword(
      user.id,
      data.newPassword,
      data.currentPassword,
    );
  }

  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Body() data: AuthRefreshDTO,
  ): Promise<IRequest['/auth/refresh']> {
    const newAccessToken = await this.authService.refreshToken(
      data.refreshToken,
    );
    if (!newAccessToken) {
      throw new NotFoundException('Invalid refresh token');
    }

    const oldAccessToken = req.headers.authorization?.split(' ')[1];
    if (oldAccessToken) {
      // TODO: store the old one for invalidation
    }

    return { accessToken: newAccessToken };
  }

  @CacheKey('auth/settings')
  @CacheTTL(10000)
  @Get('settings')
  async getAuthSettings(): Promise<IRequest['/auth/settings']> {
    const isInviteOnly = await this.settingsService.findOrInsert(
        'invite_only',
        false,
      ),
      isRegistrationOpen = await this.settingsService.findOrInsert(
        'is_registration_open',
        true,
      );

    return {
      inviteRequired: isInviteOnly,
      registrationOpen: isRegistrationOpen,
    };
  }
}
