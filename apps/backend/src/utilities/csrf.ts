import { Request, Response } from 'express';
import { generateRandomString } from './string';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

const CSRF_ROTATE_TOKEN_EVERY = 25; // Rotate token every x uses
const CSRF_TOKEN_VALID_FOR = 1000 * 60 * 60 * 24;

const userTokens: {
  [key: number]: {
    token: string;
    expiration: number;
    timesUsed: number;
  };
} = {};

export function setUserCSRFToken(userId: number) {
  if (userTokens[userId]) {
    const user = userTokens[userId];

    if (
      user.expiration > Date.now() &&
      user.timesUsed < CSRF_ROTATE_TOKEN_EVERY
    ) {
      userTokens[userId].expiration = Date.now() + CSRF_TOKEN_VALID_FOR;
      userTokens[userId].timesUsed++;

      return user.token;
    }

    delete userTokens[userId];
  }

  const token = generateRandomString(32);
  userTokens[userId] = {
    token,
    expiration: Date.now() + CSRF_TOKEN_VALID_FOR,
    timesUsed: 0,
  };

  return token;
}

@Injectable()
export class CsrfGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<any> {
    const request = context.switchToHttp().getRequest() as Request;

    const providedToken = request.headers['x-csrf-token'] as string;
    if (typeof providedToken !== 'string')
      throw new ForbiddenException('Invalid CSRF token');

    const user = request.user;
    if (!user?.id) throw new ForbiddenException('Invalid CSRF token');

    const userToken = userTokens[user.id];
    if (
      !userToken ||
      userToken.token !== providedToken ||
      userToken.expiration < Date.now()
    )
      throw new ForbiddenException('Invalid CSRF token');

    const response = context.switchToHttp().getResponse() as Response;
    response.setHeader('x-csrf-token', setUserCSRFToken(user.id));

    return true;
  }
}
