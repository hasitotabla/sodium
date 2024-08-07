import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

import { UserKeysEntity } from './keys.entity';
import { UserKeysService } from './keys.service';
import { UserKeysController } from './keys.controller';

import { AuthModule } from '../auth/auth.module';
import { UsersService } from '../users.service';
import { UserEntity } from '../users.entity';
import { FileEntity } from 'src/files/files.entity';
import { FilesModule } from 'src/files/files.module';
import { SettingsModule } from 'src/settings/settings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, UserKeysEntity, FileEntity]),
    JwtModule.register({
      secret: process.env.SIGN_SECRET,
    }),
    forwardRef(() => AuthModule),
    forwardRef(() => FilesModule),
    forwardRef(() => SettingsModule),
  ],
  controllers: [UserKeysController],
  providers: [UsersService, UserKeysService],
  exports: [UserKeysService],
})
export class UserKeysModule {}
