import {
  Body,
  Controller,
  Delete,
  Get,
  Ip,
  NotFoundException,
  Param,
  Post,
  Query,
  Res,
  StreamableFile,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

import { FilesService } from './files.service';
import { AuthGuard } from 'src/users/auth/auth.guard';
import { User } from 'src/users/users.decorator';
import { UserEntity } from 'src/users/users.entity';
import { ExtendedMulterFile } from './files.interface';
import { generateRandomString } from 'src/utilities/string';
import { UserFiles, type SharedFile } from '$shared/types/File';
import { IRequest } from '$shared/Requests';
import { PermissionLevel } from '$shared/types/User';
import { FileSearchParamsDTO, FileUploadDTO } from './files.dto';
import { generateFileChecksum } from './files.helper';
import { UserKeyGuard } from 'src/users/keys/keys.guard';
import { PermissionGuard } from 'src/users/permission/permission.guard';
import { CsrfGuard } from 'src/utilities/csrf';
import { SettingsService } from 'src/settings/settings.service';

const INVALIDATE_TEMP_SESSIONS_AFTER = 60000 * 60 * 6;
const INVALIDATE_FILE_ACCESS_AFTER = 60000 * 15;
const IGNORE_SAME_FILE_UPLOAD_FOR = 60000 * 15; // ennyi ideig ignoreolja a same checksumos fileokat

@Controller('files')
export class FilesController {
  private tempUploadSessions: {
    [key: string]: { userId: number; validUntil: number };
  } = {};
  private tempAccessTokens: {
    /**
     * @key Client IP address
     */
    [key: string]: {
      fileIds: { [key: string]: { validUntil: number } };
    };
  } = {};
  private recentFileUploads: {
    /**
     * @key File checksum
     * @value Timestamp
     */
    [key: string]: number;
  } = {};

  constructor(
    private readonly uploadService: FilesService,
    private readonly settingsService: SettingsService,
  ) {}

  @UseGuards(AuthGuard())
  @Get('/user/:userId')
  async getMyFiles(
    @User() user: UserEntity,
    @Ip() clientAddress: string,
    @Param('userId') userId: string,
    @Query() query: FileSearchParamsDTO,
  ): Promise<UserFiles> {
    const isAdmin = user.permission === PermissionLevel.ADMIN;

    const targetUserId = parseInt(userId);
    if (!isAdmin && (!targetUserId || targetUserId !== user.id))
      throw new UnauthorizedException(
        "You are not allowed to view this user's files",
      );

    const { files, totalNumOfFiles } = await this.uploadService.getUserFiles(
      targetUserId,
      {
        search: query.search,
        pageSize: query.pageSize,
        sortBy: query.sortBy,
        page: query.page,
      },
    );

    if (!this.tempAccessTokens[clientAddress])
      this.tempAccessTokens[clientAddress] = {
        fileIds: {},
      };

    for (const file of files)
      this.tempAccessTokens[clientAddress].fileIds[file.id] = {
        validUntil: Date.now() + INVALIDATE_FILE_ACCESS_AFTER,
      };

    return {
      files: files,
      totalNumOfFiles: totalNumOfFiles,
    };
  }

  @UseGuards(AuthGuard(true))
  @Get('/get/:id')
  async getFile(
    @User() user: UserEntity | null,
    @Res({ passthrough: true }) res: Response,
    @Ip() clientAddress: string,
    @Param('id') id: string,
    @Query('isView') isView?: string,
  ): Promise<StreamableFile | null> {
    const file = await this.uploadService.getFile(id, isView === 'true');
    if (!file) {
      throw new NotFoundException('File not found');
    }

    const isAdmin = user?.permission === PermissionLevel.ADMIN;
    const validUntil =
      this.tempAccessTokens?.[clientAddress]?.fileIds?.[id].validUntil;

    if (!isAdmin && (!validUntil || validUntil < Date.now())) {
      throw new UnauthorizedException('Access token is invalid or expired.');
    }

    res.set({
      'Content-Type': file.mimeType,
      'Content-Disposition': `attachment; filename="${file.fileName}"`,
    });

    return new StreamableFile(file.stream);
  }

  @UseGuards(AuthGuard(true))
  @Get('/metadata/:id')
  async getFileMetadata(
    @User() user: UserEntity | null,
    @Ip() clientAddress: string,
    @Param('id') id: string,
    @Query('password') password?: string,
  ): Promise<{ metadata: SharedFile; canDelete: boolean }> {
    const isAdmin = user?.permission === PermissionLevel.ADMIN;
    const [metadata] = await this.uploadService.getFilesMetadata(
      [id],
      isAdmin,
      { password: true, userId: true },
    );
    if (!metadata) {
      throw new NotFoundException('File not found');
    }

    const isUserUploader = metadata.userId === user?.id,
      correctPassword = !metadata.password || metadata.password === password;

    if (!isAdmin && !correctPassword && !isUserUploader) {
      throw new UnauthorizedException('Password is incorrect');
    }

    delete metadata.password;
    delete metadata.userId;

    if (!this.tempAccessTokens[clientAddress])
      this.tempAccessTokens[clientAddress] = {
        fileIds: {},
      };

    this.tempAccessTokens[clientAddress].fileIds[id] = {
      validUntil: Date.now() + INVALIDATE_FILE_ACCESS_AFTER,
    };

    return {
      metadata,
      canDelete: isAdmin || isUserUploader,
    };
  }

  @UseGuards(AuthGuard())
  @Get('/getFilesMetadata')
  async getFilesMetadata(
    @User() user: UserEntity | null,
    @Query('ids') ids: string,
  ): Promise<SharedFile[] | null> {
    const isAdmin = user?.permission === PermissionLevel.ADMIN;
    const metadatas = await this.uploadService.getFilesMetadata(
      ids.split(','),
      isAdmin,
    );
    if (!metadatas) {
      throw new NotFoundException('File not found');
    }

    return metadatas;
  }

  @UseGuards(
    AuthGuard(true),
    // new FileSizeGuard(1024 * 1024 * 1024), // 1GiB
    CsrfGuard,
  )
  @UseInterceptors(FileInterceptor('file'))
  @Post('/upload')
  async uploadFile(
    @User() user: UserEntity | null,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: FileUploadDTO,
    @Query('sessionToken') sessionToken?: string,
  ) {
    let asUserId: number;
    if (user) {
      asUserId = user.id;
    } else if (sessionToken && this.tempUploadSessions[sessionToken]) {
      if (this.tempUploadSessions[sessionToken].validUntil < Date.now())
        throw new UnauthorizedException('Session expired');

      asUserId = this.tempUploadSessions[sessionToken].userId;
      delete this.tempUploadSessions[sessionToken];
    }

    if (!asUserId)
      throw new UnauthorizedException(
        'You need to be logged in to upload files.',
      );

    const fileChecksum = generateFileChecksum(file);
    if (
      (await this.settingsService.findOrInsert('file_ignore_same_checksum')) &&
      this.recentFileUploads[fileChecksum] &&
      this.recentFileUploads[fileChecksum] > Date.now()
    )
      throw new UnauthorizedException(
        'The same file was uploaded recently. Please wait a bit before uploading again.',
      );

    this.recentFileUploads[fileChecksum] =
      Date.now() + IGNORE_SAME_FILE_UPLOAD_FOR;

    return this.uploadService.uploadFile(
      file as ExtendedMulterFile,
      asUserId,
      body.password,
      body.delete_timestamp,
    );
  }

  @UseGuards(UserKeyGuard, CsrfGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Post('/uploadViaKey')
  async uploadFileViaApiKey(
    @User() user: UserEntity | null,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: FileUploadDTO,
  ) {
    const fileChecksum = generateFileChecksum(file);
    if (
      this.recentFileUploads[fileChecksum] &&
      this.recentFileUploads[fileChecksum] > Date.now()
    )
      throw new UnauthorizedException(
        'The same file was uploaded recently. Please wait a bit before uploading again.',
      );

    this.recentFileUploads[fileChecksum] =
      Date.now() + IGNORE_SAME_FILE_UPLOAD_FOR;

    return this.uploadService.uploadFile(
      file as ExtendedMulterFile,
      user.id,
      body.password,
      body.delete_timestamp,
    );
  }

  @UseGuards(AuthGuard(), CsrfGuard)
  @Delete('/delete/:id')
  async deleteFile(@User() user: UserEntity, @Param('id') id: string) {
    return this.uploadService.deleteFile(id, user);
  }

  @UseGuards(AuthGuard(), PermissionGuard(PermissionLevel.ADMIN), CsrfGuard)
  @Delete('/purgeUserFiles/:userId')
  async purgeUserFiles(
    @Param('userId') userId: string,
  ): Promise<IRequest['/files/purgeUserFiles']> {
    const targetUserId = parseInt(userId);
    if (!targetUserId) throw new NotFoundException('User not found');

    return this.uploadService.purgeUserFiles(targetUserId);
  }

  @UseGuards(AuthGuard(), CsrfGuard)
  @Post('/createTempSession')
  async createTempSession(
    @User() user: UserEntity,
  ): Promise<IRequest['/files/createTempSession']> {
    const previousSessionToken = Object.keys(this.tempUploadSessions).find(
      (key) => this.tempUploadSessions[key].userId === user.id,
    );
    if (previousSessionToken)
      return {
        url: `${process.env.SHARED_APP_URL}/upload?session=${previousSessionToken}`,
      };

    const sessionToken = generateRandomString(24);
    this.tempUploadSessions[sessionToken] = {
      userId: user.id,
      validUntil: Date.now() + INVALIDATE_TEMP_SESSIONS_AFTER,
    };

    return {
      url: `${process.env.SHARED_APP_URL}/upload?session=${sessionToken}`,
    };
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async cleanup() {
    const now = Date.now();

    for (const key in this.tempUploadSessions)
      if (now > this.tempUploadSessions[key].validUntil)
        delete this.tempUploadSessions[key];

    for (const key in this.tempAccessTokens) {
      for (const file in this.tempAccessTokens[key].fileIds)
        if (this.tempAccessTokens[key].fileIds[file]?.validUntil < now)
          delete this.tempAccessTokens[key].fileIds[file];

      if (Object.keys(this.tempAccessTokens[key].fileIds).length === 0)
        delete this.tempAccessTokens[key];
    }

    for (const key in this.recentFileUploads)
      if (this.recentFileUploads[key] < now) delete this.recentFileUploads[key];
  }
}
