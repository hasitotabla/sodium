import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StatsController } from './stats.controller';
import { UserEntity } from 'src/users/users.entity';
import { FileEntity } from 'src/files/files.entity';
import { FilesModule } from 'src/files/files.module';
import { StatsService } from './stats.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, FileEntity]),
    UsersModule,
    FilesModule,
  ],
  controllers: [StatsController],
  providers: [StatsService],
  exports: [StatsService],
})
export class StatsModule {}
