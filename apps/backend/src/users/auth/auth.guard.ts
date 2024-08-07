import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
  mixin,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

import { TokenType } from '$shared/index';
import { UsersService } from 'src/users/users.service';

export const AuthGuard = (optional = false) => {
  @Injectable()
  class Guard implements CanActivate {
    constructor(
      public usersService: UsersService,
      public jwtService: JwtService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<any> {
      const req = context.switchToHttp().getRequest() as Request;

      if (!req.headers.authorization) {
        if (optional) return true;
        else throw new HttpException('unauthorized', 401);
      }

      const [type, token] = req.headers.authorization.split(' ');
      if (type.toLowerCase() !== 'bearer') {
        if (optional) return true;
        else throw new HttpException('unauthorized', 401);
      }

      try {
        const payload = this.jwtService.verify(token, {
          secret: process.env.SIGN_SECRET,
        });
        if (!payload?.id) {
          throw new HttpException('unauthorized', 401);
        }

        if (payload?.tokenType !== TokenType.ACCESS) {
          throw new HttpException('unauthorized', 401);
        }

        const user = await this.usersService.findOneBy({ id: payload.id });
        if (!user) {
          if (optional) return true;
          else throw new HttpException('unauthorized', 401);
        }

        delete user.password;
        delete user.salt;

        req.userToken = token;
        req.user = user;
        return true;
      } catch (error) {
        if (optional) return true;
        else throw new HttpException('unauthorized', 401);
      }
    }
  }

  return mixin(Guard);
};
