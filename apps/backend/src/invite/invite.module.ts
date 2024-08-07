import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';

import { UsersService } from '../users/users.service';

import { InviteService } from './invite.service';
import { InviteEntity } from './invite.entity';
import { InviteController } from './invite.controller';
import { UserEntity } from 'src/users/users.entity';
import { FileEntity } from 'src/files/files.entity';
import { FilesModule } from 'src/files/files.module';
import { SettingsModule } from 'src/settings/settings.module';

@Module({
  imports: [
    // UsersModule,
    TypeOrmModule.forFeature([InviteEntity, UserEntity, FileEntity]),
    FilesModule,
    SettingsModule,
  ],
  controllers: [InviteController],
  providers: [UsersService, JwtService, InviteService],
  exports: [InviteService],
})
export class InviteModule {}
