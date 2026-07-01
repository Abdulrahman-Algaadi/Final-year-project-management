import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity, SoftDeleteEntity } from './base.entity';
import { Student } from './student.entity';
import { Advisor } from './advisor.entity';
import { Project } from './project.entity';

@Entity('department')
export class Department extends SoftDeleteEntity {
  @Column({ length: 100 })
  name!: string;

  @Column({ length: 20, unique: true })
  code!: string;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @OneToMany(() => Student, (s) => s.department)
  students?: Student[];

  @OneToMany(() => Advisor, (a) => a.department)
  advisors?: Advisor[];
}

@Entity('semester')
export class Semester extends SoftDeleteEntity {
  @Column({ length: 50 })
  name!: string;

  @Column({ name: 'academic_year', length: 20 })
  academicYear!: string;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate?: string;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate?: string;

  @OneToMany(() => Student, (s) => s.semester)
  students?: Student[];

  @OneToMany(() => Project, (p) => p.semester)
  projects?: Project[];
}

@Entity('project_status')
export class ProjectStatus extends BaseEntity {
  @Column({ name: 'status_name', length: 50, unique: true })
  statusName!: string;

  @OneToMany(() => Project, (p) => p.status)
  projects?: Project[];
}

@Entity('lookup')
export class Lookup extends BaseEntity {
  @Column({ length: 50 })
  category!: string;

  @Column({ length: 100 })
  value!: string;
}
