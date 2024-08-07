import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { UsersModule } from './users/users.module';
import { FilesModule } from './files/files.module';
import { StatsModule } from './stats/stats.module';
import { InviteModule } from './invite/invite.module';
import { SettingsModule } from './settings/settings.module';

// Entities
import { UserEntity } from './users/users.entity';
import { FileEntity } from './files/files.entity';
import { InviteEntity } from './invite/invite.entity';
import { UserKeysEntity } from './users/keys/keys.entity';
import { SettingsEntity } from './settings/settings.entity';

import { envFilePath } from 'src/consts';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath }),
    TypeOrmModule.forRoot({
      type: process.env.DB_TYPE as any,
      host: process.env.DB_HOST,
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      port: parseInt(process.env.DB_PORT) ?? 3306,

      // synchronize: true,
      migrations: ['./**/migrations/*.js'],
      migrationsRun: true,

      entities: [
        UserEntity,
        FileEntity,
        InviteEntity,
        UserKeysEntity,
        SettingsEntity,
      ],
    }),
    ScheduleModule.forRoot(),

    UsersModule,
    FilesModule,
    StatsModule,
    InviteModule,
    SettingsModule,
  ],
})
export class AppModule {}
