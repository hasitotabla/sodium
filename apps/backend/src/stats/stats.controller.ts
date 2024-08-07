import { Controller, Get } from '@nestjs/common';

import { IStats } from '$shared/types/Stats';
import { FilesService } from 'src/files/files.service';
import { UsersService } from 'src/users/users.service';

@Controller('stats')
export class StatsController {
  constructor(
    private readonly usersService: UsersService,
    private readonly uploadService: FilesService,
  ) {}

  @Get('/')
  async getStats(): Promise<IStats> {
    if (process.env.SHARED_DISPLAY_STATS !== 'true')
      return {
        users: 0,
        uploads: 0,
        views: 0,
        totalSpaceUsed: 0,
      };

    const users = await this.usersService.getTotal();
    const {
      uploads,
      views: views,
      totalSpaceUsed,
    } = await this.uploadService.getStats();

    return {
      users,
      uploads,
      views,
      totalSpaceUsed,
    };
  }
}
