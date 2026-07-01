import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { StudentGroup } from './student-group.entity';
import { Project } from './project.entity';

@Entity('group_project')
export class GroupProject extends BaseEntity {
  @Column({ name: 'group_id', unique: true })
  groupId!: number;

  @OneToOne(() => StudentGroup, (g) => g.projectAssignment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_id' })
  group!: StudentGroup;

  @Column({ name: 'project_id', unique: true })
  projectId!: number;

  @OneToOne(() => Project, (p) => p.groupAssignment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project!: Project;

  @Column({ name: 'assigned_date', type: 'date', default: () => 'CURRENT_DATE' })
  assignedDate!: string;
}
