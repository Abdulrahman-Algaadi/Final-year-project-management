import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { SoftDeleteEntity } from './base.entity';
import { GroupEvaluation } from './group-evaluation.entity';

@Entity('evaluation')
export class Evaluation extends SoftDeleteEntity {
  @Column({ length: 100 })
  name!: string;

  @Column({ name: 'total_marks', type: 'int' })
  totalMarks!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  weight!: number;

  @OneToMany(() => GroupEvaluation, (ge) => ge.evaluation)
  groupEvaluations?: GroupEvaluation[];
}
