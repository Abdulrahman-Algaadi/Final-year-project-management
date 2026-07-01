import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { SoftDeleteEntity } from './base.entity';
import { Person } from './person.entity';

@Entity('user_account')
export class UserAccount extends SoftDeleteEntity {
  @Column({ name: 'person_id', unique: true })
  personId!: number;

  @OneToOne(() => Person, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'person_id' })
  person!: Person;

  @Column({ length: 50, unique: true })
  username!: string;

  @Column({ length: 20 })
  role!: string;

  @Column({ name: 'auth_user_id', type: 'uuid', nullable: true, unique: true })
  authUserId?: string;

  @Column({ name: 'last_login', type: 'timestamptz', nullable: true })
  lastLogin?: Date;
}
