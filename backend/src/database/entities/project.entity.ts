import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { SoftDeleteEntity } from './base.entity';
import { Semester, ProjectStatus } from './department.entity';
import { GroupProject } from './group-project.entity';
import { ProjectAdvisor } from './project-advisor.entity';

@Entity('project')
export class Project extends SoftDeleteEntity {
  @Column({ length: 200 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'semester_id' })
  semesterId!: number;

  @ManyToOne(() => Semester)
  @JoinColumn({ name: 'semester_id' })
  semester!: Semester;

  @Column({ name: 'status_id' })
  statusId!: number;

  @ManyToOne(() => ProjectStatus)
  @JoinColumn({ name: 'status_id' })
  status!: ProjectStatus;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @OneToOne(() => GroupProject, (gp) => gp.project)
  groupAssignment?: GroupProject;

  @OneToMany(() => ProjectAdvisor, (pa) => pa.project)
  advisors?: ProjectAdvisor[];
}
