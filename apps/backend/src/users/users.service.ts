import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Like, Repository } from 'typeorm';

import { UserEntity } from './users.entity';
import { IRequest } from '$shared/requests';
import { FileEntity } from 'src/files/files.entity';
import { FilesService } from 'src/files/files.service';
import { SettingsService } from 'src/settings/settings.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly filesService: FilesService,
    private readonly settingsService: SettingsService,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async findOneBy(
    partialData: FindOptionsWhere<UserEntity>,
  ): Promise<UserEntity | null> {
    const foundUser = this.usersRepository.findOneBy(partialData);
    return foundUser;
  }

  async getAll(options: {
    pageSize: number;
    page: number;
    search: string;
    // sortBy: FileSortBy;
  }): Promise<IRequest['/users/all']> {
    const [users, total] = await this.usersRepository.findAndCount({
      where: { email: Like(`%${options.search}%`) },

      relations: ['uploads'],

      take: options.pageSize,
      skip: options.page * options.pageSize,
    });

    return {
      users: users.map((user) => ({
        id: user.id,
        email: user.email,
        permission: user.permission,
        uploadLimit: user.uploadLimit,
        filesUploaded: (user.uploads as unknown as FileEntity[])?.length,
        filesUploadedSize: (user.uploads as unknown as FileEntity[]).reduce(
          (acc, prev) => (acc += prev.file_size),
          0,
        ),
      })),
      total,
    };
  }

  async create({
    email,
    password,
    salt,
  }: {
    email: string;
    password: string;
    salt: string;
  }): Promise<UserEntity> {
    const newUser = this.usersRepository.create({
      email,
      password,
      salt,
      uploadLimit: await this.settingsService.findOrInsert(
        'user_default_upload_limit',
        524288,
      ),
    });

    await newUser.save();
    return newUser;
  }

  async delete(id: number): Promise<boolean> {
    await this.filesService.purgeUserFiles(id);

    const { affected } = await this.usersRepository.delete({ id });
    return affected > 0;
  }

  async update(
    id: number,
    data: Partial<UserEntity>,
  ): Promise<UserEntity | null> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      return null;
    }

    Object.assign(user, data);
    await user.save();

    return user;
  }

  async getTotal(): Promise<number> {
    return this.usersRepository.count();
  }
}
