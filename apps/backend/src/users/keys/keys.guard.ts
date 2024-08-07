import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

import { UserKeysService } from './keys.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class UserKeyGuard implements CanActivate {
  constructor(
    public usersService: UsersService,
    public keysService: UserKeysService,
    public jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<any> {
    const req = context.switchToHttp().getRequest() as Request;

    if (!req.headers.authorization) {
      throw new HttpException('unauthorized', 401);
    }

    try {
      const apiKey = await this.keysService.findOneBy({
        where: { key: req.headers.authorization },
        relations: ['user'],
      });
      if (!apiKey) {
        throw new HttpException('unauthorized', 401);
      }

      delete apiKey.user.salt;
      delete apiKey.user.password;

      req.user = apiKey.user;

      return true;
    } catch (error) {
      throw new HttpException('unauthorized', 401);
    }
  }
}
