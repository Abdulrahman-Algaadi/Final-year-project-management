import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { StudentGroup } from './student-group.entity';
import { Student } from './student.entity';
import { Lookup } from './department.entity';

@Entity('group_student')
export class GroupStudent extends BaseEntity {
  @Column({ name: 'group_id' })
  groupId!: number;

  @ManyToOne(() => StudentGroup, (g) => g.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_id' })
  group!: StudentGroup;

  @Column({ name: 'student_id' })
  studentId!: number;

  @ManyToOne(() => Student, (s) => s.groupMemberships, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student!: Student;

  @Column({ name: 'is_leader', default: false })
  isLeader!: boolean;

  @Column({ name: 'status_id' })
  statusId!: number;

  @ManyToOne(() => Lookup)
  @JoinColumn({ name: 'status_id' })
  status!: Lookup;

  @Column({ name: 'assignment_date', type: 'date', default: () => 'CURRENT_DATE' })
  assignmentDate!: string;
}
