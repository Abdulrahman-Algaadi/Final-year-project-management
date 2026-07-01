import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { SoftDeleteEntity } from './base.entity';
import { Person } from './person.entity';
import { Department, Lookup } from './department.entity';
import { ProjectAdvisor } from './project-advisor.entity';
import { GroupEvaluation } from './group-evaluation.entity';
import { Meeting } from './meeting.entity';

@Entity('advisor')
export class Advisor extends SoftDeleteEntity {
  @PrimaryColumn()
  id!: number;

  @OneToOne(() => Person, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id' })
  person!: Person;

  @Column({ name: 'department_id' })
  departmentId!: number;

  @ManyToOne(() => Department)
  @JoinColumn({ name: 'department_id' })
  department!: Department;

  @Column({ name: 'designation_id' })
  designationId!: number;

  @ManyToOne(() => Lookup)
  @JoinColumn({ name: 'designation_id' })
  designation!: Lookup;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  salary?: number;

  @OneToMany(() => ProjectAdvisor, (pa) => pa.advisor)
  projectAssignments?: ProjectAdvisor[];

  @OneToMany(() => GroupEvaluation, (ge) => ge.evaluator)
  evaluations?: GroupEvaluation[];

  @OneToMany(() => Meeting, (m) => m.advisor)
  meetings?: Meeting[];
}
