import { Body, Controller, Get, Put, Query, UseGuards } from '@nestjs/common';

import { PermissionGuard } from 'src/users/permission/permission.guard';
import { AuthGuard } from 'src/users/auth/auth.guard';
import { SettingsService } from './settings.service';
import { PermissionLevel, SharedUser } from '../../../shared/src';
import { CsrfGuard } from 'src/utilities/csrf';
import { type SettingsKeys, SETTINGS_KEYS } from './settings.interface';
import { User } from 'src/users/users.decorator';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @UseGuards(AuthGuard(), PermissionGuard(PermissionLevel.ADMIN))
  @Get('all')
  async getAllSettings() {
    const settings = await this.settingsService.getAll();

    return settings.reduce(
      (acc, value) => ({
        ...acc,
        [value.key]: value.value,
      }),
      {},
    );
  }

  @UseGuards(AuthGuard())
  @Get('get')
  async getSetting<K extends keyof SettingsKeys>(
    @User() user: SharedUser,
    @Query('key') key: K,
  ) {
    if (!key || !SETTINGS_KEYS[key]) throw new Error('Invalid key');

    const isAdmin = user.permission === PermissionLevel.ADMIN;
    if (!isAdmin && !SETTINGS_KEYS[key]?.isPublic)
      throw new Error('Permission denied');

    return this.settingsService.findOrInsert(key);
  }

  @UseGuards(AuthGuard(), PermissionGuard(PermissionLevel.ADMIN), CsrfGuard)
  @Put('save')
  async saveSettings(@Body() settings: { [key in keyof SettingsKeys]: any }) {
    return this.settingsService.update(settings);
  }
}
