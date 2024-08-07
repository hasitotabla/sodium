import { Module, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingsEntity } from './settings.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SettingsEntity]),
    forwardRef(() => UsersModule),
  ],
  controllers: [SettingsController],
  providers: [JwtService, SettingsService],
  exports: [TypeOrmModule, SettingsService],
})
export class SettingsModule {}
