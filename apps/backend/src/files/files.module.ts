import { TypeOrmModule } from '@nestjs/typeorm';
import { forwardRef, Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { FilesController } from './files.controller';
import { FilesService } from './files.service';

import { UserEntity } from 'src/users/users.entity';
import { FileEntity } from './files.entity';
import { UserKeysEntity } from 'src/users/keys/keys.entity';
import { UsersModule } from 'src/users/users.module';
import { UserKeysModule } from 'src/users/keys/keys.module';
import { FileCleanupService } from './services/cleanup.service';
import { UsersFilesService } from './services/users.service';
import { CacheModule } from '@nestjs/cache-manager';
import { SettingsModule } from 'src/settings/settings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, FileEntity, UserKeysEntity]),
    CacheModule.register(),
    forwardRef(() => UsersModule),
    forwardRef(() => UserKeysModule),
    forwardRef(() => SettingsModule),
  ],
  controllers: [FilesController],
  providers: [
    // deps
    JwtService,

    FilesService,
    FileCleanupService,
    UsersFilesService,
  ],
  exports: [FilesService, UsersFilesService],
})
export class FilesModule {}
