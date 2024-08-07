import {
  CanActivate,
  ExecutionContext,
  Injectable,
  mixin,
} from '@nestjs/common';
import { Request } from 'express';

import { PermissionLevel, SharedUser } from '$shared/index';
import { UsersService } from '../users.service';

export const PermissionGuard = (required = PermissionLevel.ADMIN) => {
  @Injectable()
  class Guard implements CanActivate {
    constructor(public usersService: UsersService) {}

    async canActivate(context: ExecutionContext): Promise<any> {
      const req = context.switchToHttp().getRequest() as Request;
      const user = req.user as unknown as SharedUser;

      if (!user?.permission) {
        return false;
      }

      return user.permission === required;
    }
  }

  return mixin(Guard);
};
