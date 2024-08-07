import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { init } from '@paralleldrive/cuid2';
import { UserEntity } from '../users/users.entity';

const randomString = init({
  length: 32,
});

@Entity('invites')
export class InviteEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar')
  code = randomString();

  @ManyToOne(() => UserEntity, (user) => user.invites, { cascade: ['remove'] })
  created_by: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.invites, {
    nullable: true,
    eager: true,
    cascade: ['remove'],
  })
  used_by: UserEntity | null;
}
