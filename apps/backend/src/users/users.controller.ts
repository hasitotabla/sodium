import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Post,
  Query,
  Response,
  UseGuards,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { AuthGuard } from './auth/auth.guard';
import {
  PermissionLevel,
  SharedUser,
  SharedUserWithFiles,
} from '$shared/types/User';
import { User } from './users.decorator';
import { PermissionGuard } from './permission/permission.guard';
import {
  UserDeleteQueryDTO,
  UsersSearchQueryDTO,
  UsersUpdateUploadLimitDTO,
} from './users.dto';
import { IRequest } from '$shared/requests';
import { Response as Res } from 'express';
import { setUserCSRFToken } from 'src/utilities/csrf';
import { UsersFilesService } from 'src/files/services/users.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersFilesService: UsersFilesService,
  ) {}

  @UseGuards(AuthGuard())
  @Get('/me')
  async getAll(
    @User() user: SharedUser,
    @Response({ passthrough: true }) res: Res,
  ): Promise<SharedUserWithFiles> {
    const csrfToken = setUserCSRFToken(user.id);
    res.setHeader('x-csrf-token', csrfToken);

    const { files, usedSpace } = await this.usersFilesService.getUserUsedSpace(
      user.id,
    );

    return {
      ...user,
      filesUploaded: files,
      filesUsedSpace: usedSpace,
    };
  }

  @UseGuards(AuthGuard(), PermissionGuard(PermissionLevel.ADMIN))
  @Get('/all')
  async getAllUsers(
    @Query() query: UsersSearchQueryDTO,
  ): Promise<IRequest['/users/all']> {
    return this.usersService.getAll(query);
  }

  @UseGuards(AuthGuard(), PermissionGuard(PermissionLevel.ADMIN))
  @Post('/updateUploadLimit')
  async updateUploadLimit(
    @Body() { userId, uploadLimit }: UsersUpdateUploadLimitDTO,
  ): Promise<IRequest['/users/updateUploadLimit']> {
    const updatedUser = this.usersService.update(userId, {
      uploadLimit,
    });

    return updatedUser !== null;
  }

  @UseGuards(AuthGuard(), PermissionGuard(PermissionLevel.ADMIN))
  @Delete('/delete')
  async deleteUser(
    @User() user: SharedUser,
    @Query() { userId }: UserDeleteQueryDTO,
  ): Promise<IRequest['/users/delete']> {
    if (user.id === userId) {
      throw new ForbiddenException('You cannot delete yourself');
    }

    return this.usersService.delete(userId);
  }
}
