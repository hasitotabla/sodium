import { Injectable } from '@nestjs/common';

@Injectable()
export class UserTokensService {
  private invalidatedTokens: {
    [key: string]: boolean;
  } = {};

  constructor() {}

  invalidateToken(token: string) {
    this.invalidatedTokens[token] = true;
  }

  isTokenInvalid(token: string) {
    return !!this.invalidatedTokens[token];
  }
}
