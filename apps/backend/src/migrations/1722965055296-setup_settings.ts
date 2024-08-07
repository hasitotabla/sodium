import { MigrationInterface, QueryRunner } from 'typeorm';
import {
  SETTINGS_KEYS,
  SettingsKeys,
  ValidSettingsTypes,
} from '../settings/settings.interface';

export class SetupSettings1722965055296 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const serializeValue = (value: ValidSettingsTypes) => {
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
    };

    for (const key in SETTINGS_KEYS) {
      const { type } = SETTINGS_KEYS[key as keyof SettingsKeys];

      await queryRunner.query(
        `INSERT IGNORE INTO settings VALUES ("${key}", "${type}", "${serializeValue(
          SETTINGS_KEYS[key].default,
        ).replace(/"/g, '\\"')}")`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
