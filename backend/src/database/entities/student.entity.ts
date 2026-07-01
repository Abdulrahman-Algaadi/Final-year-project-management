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
import { Department, Semester } from './department.entity';
import { GroupStudent } from './group-student.entity';

@Entity('student')
export class Student extends SoftDeleteEntity {
  @PrimaryColumn()
  id!: number;

  @OneToOne(() => Person, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id' })
  person!: Person;

  @Column({ name: 'registration_no', length: 30, unique: true })
  registrationNo!: string;

  @Column({ name: 'department_id' })
  departmentId!: number;

  @ManyToOne(() => Department)
  @JoinColumn({ name: 'department_id' })
  department!: Department;

  @Column({ name: 'semester_id' })
  semesterId!: number;

  @Column({ name: 'enrollment_year', type: 'int' })
  enrollmentYear!: number;

  @ManyToOne(() => Semester)
  @JoinColumn({ name: 'semester_id' })
  semester!: Semester;

  @OneToMany(() => GroupStudent, (gs) => gs.student)
  groupMemberships?: GroupStudent[];
}
