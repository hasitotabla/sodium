import {
  ForbiddenException,
  forwardRef,
  HttpCode,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

import { UserEntity } from 'src/users/users.entity';
import { ExtendedSharedFile, ExtendedMulterFile } from './files.interface';
import { FileEntity } from './files.entity';
import {
  generateFileName,
  getFileMimeType,
  removeFileFromDisk,
} from './files.helper';
import { FileSortBy, UserFiles } from '$shared/types/File';
import { PermissionLevel } from '$shared/types/User';
import { IRequest } from '$shared/requests';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class FilesService {
  private fileViews: { [key: string]: number } = {};

  constructor(
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    @InjectRepository(FileEntity)
    private uploadsRepository: Repository<FileEntity>,
  ) {}

  async getFile(
    id: string,
    countAsView = false,
  ): Promise<{
    stream: fs.ReadStream;
    mimeType: string;
    fileName: string;
    fileSize: number;
    password: string;
  } | null> {
    const uploadEntry = await this.uploadsRepository.findOne({ where: { id } });
    if (!uploadEntry) {
      return null;
    }

    const uploadFolder = path.resolve(process.env.UPLOAD_FOLDER);
    const uploadPath = path.resolve(uploadFolder, uploadEntry.file_name);

    if (!fs.existsSync(uploadPath)) {
      uploadEntry.remove();
      return null;
    }

    if (countAsView) {
      if (!this.fileViews[id]) this.fileViews[id] = 0;
      this.fileViews[id] += 1;
    }

    return {
      stream: fs.createReadStream(uploadPath),
      mimeType: uploadEntry.mime_type,
      fileName: uploadEntry.original_name,
      fileSize: uploadEntry.file_size,
      password: uploadEntry.password,
    };
  }

  async uploadFile(
    file: ExtendedMulterFile,
    userId: number,
    password?: string,
    expireDate?: number,
  ): Promise<{ url: string }> {
    let fileName: string | null = null;
    for (let i = 0; i < 10; i++) {
      const tempFileName = generateFileName(file);
      const doesExist = await this.uploadsRepository.findOne({
        where: { file_name: tempFileName },
      });

      if (!doesExist) {
        fileName = tempFileName;
        break;
      }
    }

    if (!fileName) {
      throw new InternalServerErrorException(
        'Failed to generate a unique file name',
      );
    }

    file.savename = fileName;
    const fileSize = Math.ceil(file.size / 1024);

    const user = await this.usersService.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const remainingSpace = await this.getUserRemainingSpace(user);
    if (remainingSpace < fileSize) {
      throw new ForbiddenException('Not enough space available');
    }

    let isWritten = false;
    try {
      isWritten = await this.writeBufferToDisk(file);
      if (!isWritten) throw new Error('Failed to write file to disk');
    } catch (error) {
      throw new InternalServerErrorException('Failed to write file to disk');
    }

    const mimeType = getFileMimeType(fileName);
    const uploadEntry = this.uploadsRepository.create({
      user,
      file_name: fileName,
      original_name: file.originalname,
      file_size: fileSize,
      mime_type: mimeType,
      password: password !== '' ? password : null,
      delete_timestamp:
        expireDate && expireDate !== -1 ? new Date(expireDate) : null,
    });

    const newEntry = await uploadEntry.save();
    if (!newEntry) {
      removeFileFromDisk(fileName);
      throw new InternalServerErrorException(
        'Failed to create a database entry',
      );
    }

    return {
      url: `${process.env.SHARED_APP_URL}/${newEntry.id}`,
    };
  }

  async deleteFile(id: string, byUser: UserEntity) {
    const uploadEntry = await this.uploadsRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!uploadEntry) {
      throw new NotFoundException('File not found');
    }

    if (
      (!uploadEntry?.user?.id || uploadEntry.user.id !== byUser.id) &&
      byUser.permission !== PermissionLevel.ADMIN
    ) {
      throw new ForbiddenException('You are not allowed to delete this file');
    }

    removeFileFromDisk(uploadEntry.file_name);
    await uploadEntry.remove();

    return HttpCode(200);
  }

  async purgeUserFiles(
    userId: number,
  ): Promise<IRequest['/files/purgeUserFiles']> {
    const files = await this.uploadsRepository.find({
      where: { user: { id: userId } },
    });

    for (const file of files) {
      removeFileFromDisk(file.file_name);
      await file.remove();
    }

    return true;
  }

  async getFilesMetadata(
    ids: string[],
    showSensitiveInfos = false,
    include: { password?: boolean; userId?: boolean } = {},
  ): Promise<Array<ExtendedSharedFile & { userId?: number }> | null> {
    const uploadEntries = await this.uploadsRepository
      .createQueryBuilder('file')
      .leftJoinAndSelect('file.user', 'user')
      .where('file.id IN (:...ids)', { ids })
      .getMany();

    if (!uploadEntries) {
      throw new NotFoundException("Couldn't find any files with the given IDs");
    }

    return uploadEntries.map((uploadEntry) => ({
      id: uploadEntry.id,
      originalFileName: uploadEntry.original_name,
      mimeType: uploadEntry.mime_type,
      size: uploadEntry.file_size,
      views: uploadEntry.views + (this.fileViews[uploadEntry.id] || 0),

      uploadedAt: uploadEntry.created_at.getTime(),
      uploadedBy: showSensitiveInfos ? uploadEntry?.user?.id : undefined,

      userId: include.userId ? uploadEntry.user.id : undefined,
      password: include.password ? uploadEntry.password : undefined,
    }));
  }

  async getUserFiles(
    userId: number,
    options: {
      pageSize: number;
      page: number;
      search: string;
      sortBy: FileSortBy;
    },
  ): Promise<UserFiles> {
    const fieldToSort: keyof FileEntity =
      (options.sortBy === 'date_desc' && 'created_at') ||
      (options.sortBy === 'size_desc' && 'file_size') ||
      (options.sortBy === 'name_desc' && 'original_name') ||
      'created_at';

    const [userFiles, totalNumOfFiles] =
      await this.uploadsRepository.findAndCount({
        where: {
          user: { id: userId },
          original_name: options.search
            ? Like(`%${options.search}%`)
            : undefined,
        },
        order: {
          [fieldToSort]: options.sortBy.endsWith('_desc') ? 'DESC' : 'ASC',
        },
        take: options.pageSize,
        skip: options.page * options.pageSize,
      });

    return {
      totalNumOfFiles,
      files: userFiles.map((x) => ({
        id: x.id,
        originalFileName: x.original_name,

        mimeType: x.mime_type,
        size: x.file_size,
        views: x.views,

        uploadedAt: x.created_at.getTime(),
      })),
    };
  }

  async getStats(): Promise<{
    uploads: number;
    views: number;
    totalSpaceUsed: number;
  }> {
    const uploads = await this.uploadsRepository.find();

    return {
      uploads: uploads.length,
      views:
        uploads.reduce((acc, upload) => acc + upload.views, 0) +
        Object.entries(this.fileViews).reduce(
          (acc, [, views]) => acc + views,
          0,
        ),
      totalSpaceUsed: uploads.reduce(
        (acc, upload) => acc + upload.file_size,
        0,
      ),
    };
  }

  private async writeBufferToDisk(file: ExtendedMulterFile): Promise<boolean> {
    const uploadFolder = path.resolve(process.env.UPLOAD_FOLDER);
    if (!fs.existsSync(uploadFolder)) {
      fs.mkdirSync(uploadFolder);
    }

    const uploadPath = path.resolve(uploadFolder, file.savename);
    const promise = new Promise<boolean>((resolve, reject) => {
      const stream = fs.createWriteStream(uploadPath, { flags: 'w' });

      stream.on('error', (err) => {
        reject(err);
      });

      stream.write(file.buffer);
      stream.end(() => resolve(true));
    });

    return promise;
  }

  private async getUserRemainingSpace(user: UserEntity) {
    const userUploads = await this.uploadsRepository.find({
      where: { user: user },
    });

    const totalSize = userUploads.reduce(
      (acc, upload) => acc + upload.file_size,
      0,
    );
    return user.uploadLimit - totalSize;
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  private async syncFileViews() {
    for (const [id, views] of Object.entries(this.fileViews)) {
      const uploadEntry = await this.uploadsRepository.findOne({
        where: { id },
      });
      if (!uploadEntry) {
        delete this.fileViews[id];
        continue;
      }

      uploadEntry.views += views;
      await uploadEntry.save();

      delete this.fileViews[id];
    }
  }
}
