import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';
import { SettingsItemType, SettingsKeys } from './settings.interface';

@Entity('settings')
export class SettingsEntity extends BaseEntity {
  @PrimaryColumn('varchar')
  key: keyof SettingsKeys;

  @Column('enum', { enum: SettingsItemType, default: SettingsItemType.STRING })
  type: SettingsItemType;

  @Column('text')
  value: string;
}
