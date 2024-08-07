import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SettingsEntity } from './settings.entity';
import {
  SETTINGS_KEYS,
  SettingsItemType,
  SettingsKeys,
  ValidSettingsTypes,
} from './settings.interface';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(SettingsEntity)
    private settingsRepository: Repository<SettingsEntity>,
  ) {}

  async getAll() {
    const settings = await this.settingsRepository.find();
    if (!settings) {
      return [];
    }

    return settings.map((x) => ({
      ...x,
      value: this.decodeValue(x.value, x.type),
    }));
  }

  async find<K extends keyof SettingsKeys>(
    key: K,
    defaultValue: SettingsKeys[K] = SETTINGS_KEYS[key]
      .default as SettingsKeys[K],
  ): Promise<SettingsKeys[K] | null> {
    const setting = await this.settingsRepository.findOne({ where: { key } });
    if (!setting) {
      return defaultValue;
    }

    return this.decodeValue(setting.value, setting.type) as SettingsKeys[K];
  }

  async findOrInsert<K extends keyof SettingsKeys>(
    key: K,
    defaultValue: SettingsKeys[K] = SETTINGS_KEYS[key]
      .default as SettingsKeys[K],
  ): Promise<SettingsKeys[K] | null> {
    const setting = await this.settingsRepository.findOne({
      where: { key },
    });
    if (!setting) {
      const valueType = this.getValueType(defaultValue);
      if (!valueType)
        throw new Error(`Cannot determine type of '${typeof defaultValue}'!`);

      await this.settingsRepository.insert({
        key,
        value: this.serializeValue(defaultValue),
        type: valueType,
      });

      return defaultValue;
    }

    return this.decodeValue(setting.value, setting.type);
  }

  async set<K extends keyof SettingsKeys>(
    key: K,
    value: SettingsKeys[K],
    type?: SettingsItemType,
  ) {
    const setting = await this.settingsRepository.findOne({ where: { key } });
    if (!setting) {
      if (!type) type = SETTINGS_KEYS[key].type;

      return await this.settingsRepository.insert({
        key,
        value: this.serializeValue(value as ValidSettingsTypes),
        type,
      });
    }

    setting.value = this.serializeValue(value);
    setting.type = type;

    await this.settingsRepository.save(setting);
  }

  async update(settings: { [key in keyof SettingsKeys]: any }) {
    for (const [key, value] of Object.entries(settings)) {
      if (!SETTINGS_KEYS[key]) {
        console.error(`Invalid setting key: ${key}`);
        continue;
      }

      if (typeof value !== SETTINGS_KEYS[key].type) {
        console.error(
          `Invalid setting value for key '${key}': ${value}`,
          typeof value,
          SETTINGS_KEYS[key].type,
        );
        continue;
      }

      await this.set(
        key as keyof SettingsKeys,
        this.serializeValue(value) as any,
        SETTINGS_KEYS[key].type,
      );
    }
  }

  async remove<K extends keyof SettingsKeys>(key: K) {
    await this.settingsRepository.delete({ key });
  }

  serializeValue(value: ValidSettingsTypes): string {
    switch (typeof value) {
      case 'bigint':
      case 'number':
        return value.toString();

      case 'boolean':
        return value ? 'true' : 'false';

      case 'object':
        return JSON.stringify(value);

      case 'undefined':
      case 'symbol':
      case 'function':
        throw new Error(`Cannot serialize '${typeof value}'!`);

      default:
        return value;
    }
  }

  decodeValue(value: any, type: SettingsItemType) {
    switch (type) {
      case SettingsItemType.BOOLEAN:
        return value === 'true';

      case SettingsItemType.NUMBER:
        return parseFloat(value);

      case SettingsItemType.ARRAY:
      case SettingsItemType.OBJECT:
        return JSON.parse(value);

      case SettingsItemType.STRING:
      default:
        return value;
    }
  }

  private getValueType(value: ValidSettingsTypes): SettingsItemType | null {
    switch (typeof value) {
      case 'bigint':
      case 'number':
        return SettingsItemType.NUMBER;

      case 'boolean':
        return SettingsItemType.BOOLEAN;

      case 'object':
        return Array.isArray(value)
          ? SettingsItemType.ARRAY
          : SettingsItemType.OBJECT;

      case 'undefined':
      case 'symbol':
      case 'function':
        return null;

      default:
        return SettingsItemType.STRING;
    }
  }
}
