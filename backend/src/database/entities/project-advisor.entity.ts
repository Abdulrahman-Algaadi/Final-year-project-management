import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Advisor } from './advisor.entity';
import { Project } from './project.entity';
import { Lookup } from './department.entity';

@Entity('project_advisor')
export class ProjectAdvisor extends BaseEntity {
  @Column({ name: 'advisor_id' })
  advisorId!: number;

  @ManyToOne(() => Advisor, (a) => a.projectAssignments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'advisor_id' })
  advisor!: Advisor;

  @Column({ name: 'project_id' })
  projectId!: number;

  @ManyToOne(() => Project, (p) => p.advisors, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project!: Project;

  @Column({ name: 'advisor_role_id' })
  advisorRoleId!: number;

  @ManyToOne(() => Lookup)
  @JoinColumn({ name: 'advisor_role_id' })
  advisorRole!: Lookup;

  @Column({ name: 'assignment_date', type: 'date', default: () => 'CURRENT_DATE' })
  assignmentDate!: string;
}
