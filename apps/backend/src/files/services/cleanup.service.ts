import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as fs from 'fs';
import * as path from 'path';

import { FileEntity } from '../files.entity';
import { removeFileFromDisk } from '../files.helper';

export class FileCleanupService {
  constructor(
    @InjectRepository(FileEntity)
    private uploadsRepository: Repository<FileEntity>,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async deleteExpiredFiles() {
    const expiredFiles = await this.uploadsRepository.find({
      where: {
        delete_timestamp: LessThan(new Date()),
      },
    });

    for (const file of expiredFiles) {
      removeFileFromDisk(file.file_name);
      await file.remove();
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async deleteInvalidFiles() {
    const filesInDatabase = await this.uploadsRepository.find();

    for (const file of filesInDatabase) {
      const fileExists = fs.existsSync(
        path.resolve(process.env.UPLOAD_FOLDER, file.file_name),
      );
      if (fileExists) continue;

      await file.remove();
    }

    const filesInUploadFolder = fs.readdirSync(process.env.UPLOAD_FOLDER);
    for (const file of filesInUploadFolder) {
      const isFileInDatabase = filesInDatabase.some(
        (x) => x.file_name === file,
      );
      if (isFileInDatabase) continue;

      fs.unlinkSync(path.resolve(process.env.UPLOAD_FOLDER, file));
    }
  }
}
