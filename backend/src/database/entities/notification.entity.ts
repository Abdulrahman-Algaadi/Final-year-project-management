import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Person } from './person.entity';

@Entity('notification')
export class Notification extends BaseEntity {
  @Column({ name: 'person_id' })
  personId!: number;

  @ManyToOne(() => Person, (p) => p.notifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'person_id' })
  person!: Person;

  @Column({ length: 150 })
  title!: string;

  @Column({ type: 'text' })
  message!: string;

  @Column({ name: 'is_read', default: false })
  isRead!: boolean;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;
}
