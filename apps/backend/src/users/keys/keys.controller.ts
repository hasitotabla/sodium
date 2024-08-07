import { Controller, Post, UseGuards } from '@nestjs/common';

import { AuthGuard } from '../auth/auth.guard';
import { UserKeysService } from './keys.service';
import { User } from '../users.decorator';
import { UserEntity } from '../users.entity';

@Controller('users/keys')
export class UserKeysController {
  constructor(private readonly userKeysService: UserKeysService) {}

  @UseGuards(AuthGuard())
  @Post('/create')
  async createKey(@User() user: UserEntity) {
    return this.userKeysService.create(user);
  }
}
