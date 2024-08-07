import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileEntity } from '../files.entity';
import { Repository } from 'typeorm';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class UsersFilesService {
  constructor(
    @InjectRepository(FileEntity)
    private uploadsRepository: Repository<FileEntity>,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  async getUserUsedSpace(userId: number): Promise<{
    files: number;
    usedSpace: number;
  }> {
    return this.cache.wrap(`user-${userId}-used-space`, async () => {
      const userFiles = await this.uploadsRepository.find({
        where: { user: { id: userId } },
      });

      return {
        files: userFiles.length,
        usedSpace: userFiles.reduce((acc, prev) => (acc += prev.file_size), 0),
      };
    });
  }
}
