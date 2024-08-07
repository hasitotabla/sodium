import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { InviteService } from './invite.service';
import { AuthGuard } from 'src/users/auth/auth.guard';
import { InviteCreateDTO } from './invite.dto';
import { generateRandomString } from 'src/utilities/string';
import { User } from 'src/users/users.decorator';
import { UserEntity } from 'src/users/users.entity';
import { PermissionGuard } from 'src/users/permission/permission.guard';
import {
  PermissionLevel,
  InviteCreateResponse,
  InviteFetchResponse,
} from '$shared/index';

@Controller('invites')
export class InviteController {
  constructor(private readonly inviteService: InviteService) {}

  @UseGuards(AuthGuard(), PermissionGuard(PermissionLevel.ADMIN))
  @Get('/all')
  async getAll(@Query('page') page: any): Promise<InviteFetchResponse> {
    page = parseInt(page, 10) || 0;
    return this.inviteService.getAll(page);
  }

  @UseGuards(AuthGuard(), PermissionGuard(PermissionLevel.ADMIN))
  @Post('/create')
  async create(
    @User() user: UserEntity,
    @Body() body: InviteCreateDTO,
  ): Promise<InviteCreateResponse> {
    const inviteCode = body.code || generateRandomString(24);
    if (!inviteCode) {
      throw new Error('Invalid invite code');
    }

    const existingInvite = await this.inviteService.findByCode(inviteCode);
    if (existingInvite) {
      throw new Error('Invite code already exists');
    }

    return this.inviteService.create(user, inviteCode);
  }

  @UseGuards(AuthGuard(), PermissionGuard(PermissionLevel.ADMIN))
  @Delete(':id')
  async delete(@Param('id') id: any): Promise<void> {
    if (isNaN(id)) {
      throw new Error('Invalid ID');
    }

    return this.inviteService.deleteById(id);
  }
}
