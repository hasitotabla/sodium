import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthModule } from './auth/auth.module';
import { UserEntity } from './users.entity';
import { UserKeysModule } from './keys/keys.module';
import { FilesModule } from 'src/files/files.module';
import { FileEntity } from 'src/files/files.entity';
import { SettingsModule } from 'src/settings/settings.module';
import { SettingsEntity } from 'src/settings/settings.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, SettingsEntity, FileEntity]),
    AuthModule,
    UserKeysModule,
    FilesModule,
    SettingsModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, JwtService],
  exports: [UsersService],
})
export class UsersModule {}
