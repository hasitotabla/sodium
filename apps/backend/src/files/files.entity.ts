import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { init } from '@paralleldrive/cuid2';
import { UserEntity } from 'src/users/users.entity';

const createId = init({
  length: 8,
});

@Entity('files')
export class FileEntity extends BaseEntity {
  @PrimaryColumn('varchar')
  id = createId();

  @ManyToOne(() => UserEntity, (user) => user.uploads, {
    nullable: true,
    eager: true,
  })
  user!: UserEntity;

  @Column('varchar', { unique: true })
  file_name: string;

  @Column('varchar')
  original_name: string;

  @Column('int')
  file_size: number;

  @Column('varchar')
  mime_type: string;

  @Column('datetime', { default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column('datetime', { nullable: true })
  delete_timestamp: Date;

  @Column('varchar', { nullable: true })
  password: string;

  @Column('int', { default: 0 })
  views: number;
}
