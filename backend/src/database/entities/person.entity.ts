import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { SoftDeleteEntity } from './base.entity';
import { Lookup } from './department.entity';
import { Student } from './student.entity';
import { Advisor } from './advisor.entity';
import { UserAccount } from './user-account.entity';
import { Notification } from './notification.entity';

@Entity('person')
export class Person extends SoftDeleteEntity {
  @Column({ name: 'first_name', length: 100, nullable: true })
  firstName?: string;

  @Column({ name: 'last_name', length: 100, nullable: true })
  lastName?: string;

  @Column({ name: 'gender_id', nullable: true })
  genderId?: number;

  @ManyToOne(() => Lookup)
  @JoinColumn({ name: 'gender_id' })
  gender?: Lookup;

  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth?: string;

  @Column({ name: 'contact_no', length: 20, nullable: true })
  contactNo?: string;

  @Column({ type: 'citext', nullable: true, unique: true })
  email?: string;

  @Column({ length: 255, nullable: true })
  address?: string;

  @Column({ name: 'auth_user_id', type: 'uuid', nullable: true, unique: true })
  authUserId?: string;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @OneToOne(() => Student, (s) => s.person)
  student?: Student;

  @OneToOne(() => Advisor, (a) => a.person)
  advisor?: Advisor;

  @OneToOne(() => UserAccount, (u) => u.person)
  userAccount?: UserAccount;

  @OneToMany(() => Notification, (n) => n.person)
  notifications?: Notification[];
}
