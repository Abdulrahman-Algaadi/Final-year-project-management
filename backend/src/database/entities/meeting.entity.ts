import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { SoftDeleteEntity } from './base.entity';
import { StudentGroup } from './student-group.entity';
import { Advisor } from './advisor.entity';

@Entity('meeting')
export class Meeting extends SoftDeleteEntity {
  @Column({ name: 'group_id' })
  groupId!: number;

  @ManyToOne(() => StudentGroup, (g) => g.meetings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_id' })
  group!: StudentGroup;

  @Column({ name: 'advisor_id' })
  advisorId!: number;

  @ManyToOne(() => Advisor, (a) => a.meetings, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'advisor_id' })
  advisor!: Advisor;

  @Column({ name: 'meeting_date', type: 'timestamptz' })
  meetingDate!: Date;

  @Column({ length: 200, nullable: true })
  location?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ length: 20, default: 'Scheduled' })
  status!: string;

  @Column({ name: 'online_link', length: 500, nullable: true })
  onlineLink?: string;

  @Column({ name: 'cancelled_at', type: 'timestamptz', nullable: true })
  cancelledAt?: Date;

  @Column({ name: 'rescheduled_from_id', nullable: true })
  rescheduledFromId?: number;

  @ManyToOne(() => Meeting)
  @JoinColumn({ name: 'rescheduled_from_id' })
  rescheduledFrom?: Meeting;
}
