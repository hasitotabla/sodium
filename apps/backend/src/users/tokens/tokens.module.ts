import { Module } from '@nestjs/common';

import { UserTokensService } from './tokens.service';

@Module({
  providers: [UserTokensService],
  exports: [UserTokensService],
})
export class UserTokensModule {}
