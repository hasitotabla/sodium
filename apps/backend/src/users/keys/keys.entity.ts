import { BaseEntity, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { UserEntity } from '../users.entity';
import { init } from '@paralleldrive/cuid2';

const randomString = init({
  length: 48,
});

@Entity('apikeys')
export class UserKeysEntity extends BaseEntity {
  @PrimaryColumn('varchar')
  key = randomString();

  @ManyToOne(() => UserEntity, (user) => user.uploads, {
    nullable: true,
    eager: true,
  })
  user: UserEntity;
}
