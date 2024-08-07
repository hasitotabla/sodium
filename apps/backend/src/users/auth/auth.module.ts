import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersService } from '../users.service';

import { UserEntity } from '../users.entity';
import { InviteService } from '../../invite/invite.service';
import { InviteEntity } from '../../invite/invite.entity';
import { SettingsService } from 'src/settings/settings.service';
import { SettingsModule } from 'src/settings/settings.module';
import { FileEntity } from 'src/files/files.entity';
import { FilesModule } from 'src/files/files.module';

@Module({
  imports: [
    ConfigModule.forFeature(() => ({})),
    TypeOrmModule.forFeature([UserEntity, InviteEntity, FileEntity]),
    JwtModule.register({ secret: process.env.SIGN_SECRET }),
    SettingsModule,
    FilesModule,
    SettingsModule,
  ],
  controllers: [AuthController],
  providers: [UsersService, AuthService, InviteService],
  exports: [AuthService],
})
export class AuthModule {}
