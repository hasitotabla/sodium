import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PermissionLevel, SharedUser } from '$shared/types/User';
import { FileEntity } from 'src/files/files.entity';
import { InviteEntity } from '../invite/invite.entity';
import { UserKeysEntity } from './keys/keys.entity';

@Entity('users')
export class UserEntity extends BaseEntity implements SharedUser {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar', length: 128 })
  password: string;

  @Column({ type: 'varchar', length: 48 })
  salt: string;

  @Column({
    type: 'enum',
    enum: PermissionLevel,
    default: PermissionLevel.USER,
  })
  permission: PermissionLevel;

  @Column({ type: 'bigint', default: 512 * 1024 })
  uploadLimit: number;

  @OneToMany(() => FileEntity, (upload) => upload.user)
  uploads: FileEntity;

  @OneToMany(() => InviteEntity, (invite) => invite.created_by)
  invites: InviteEntity;

  @OneToMany(() => UserKeysEntity, (invite) => invite.user)
  api_keys: UserKeysEntity;

  @OneToOne(() => UserEntity, (invite) => invite.id)
  invited_by: UserEntity | null;
}
