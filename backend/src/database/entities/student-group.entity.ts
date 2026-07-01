import { Column, Entity, OneToMany, OneToOne } from 'typeorm';
import { SoftDeleteEntity } from './base.entity';
import { GroupStudent } from './group-student.entity';
import { GroupProject } from './group-project.entity';
import { GroupEvaluation } from './group-evaluation.entity';
import { Submission } from './submission.entity';
import { Meeting } from './meeting.entity';

@Entity('student_group')
export class StudentGroup extends SoftDeleteEntity {
  @Column({ name: 'group_name', length: 100 })
  groupName!: string;

  @Column({ name: 'created_on', type: 'timestamptz', default: () => 'NOW()' })
  createdOn!: Date;

  @OneToMany(() => GroupStudent, (gs) => gs.group)
  members?: GroupStudent[];

  @OneToOne(() => GroupProject, (gp) => gp.group)
  projectAssignment?: GroupProject;

  @OneToMany(() => GroupEvaluation, (ge) => ge.group)
  evaluations?: GroupEvaluation[];

  @OneToMany(() => Submission, (s) => s.group)
  submissions?: Submission[];

  @OneToMany(() => Meeting, (m) => m.group)
  meetings?: Meeting[];
}
