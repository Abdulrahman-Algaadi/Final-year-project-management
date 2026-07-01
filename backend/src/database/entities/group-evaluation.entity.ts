import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { StudentGroup } from './student-group.entity';
import { Evaluation } from './evaluation.entity';
import { Advisor } from './advisor.entity';

@Entity('group_evaluation')
export class GroupEvaluation extends BaseEntity {
  @Column({ name: 'group_id' })
  groupId!: number;

  @ManyToOne(() => StudentGroup, (g) => g.evaluations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_id' })
  group!: StudentGroup;

  @Column({ name: 'evaluation_id' })
  evaluationId!: number;

  @ManyToOne(() => Evaluation, (e) => e.groupEvaluations, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'evaluation_id' })
  evaluation!: Evaluation;

  @Column({ name: 'obtained_marks', type: 'decimal', precision: 5, scale: 2 })
  obtainedMarks!: number;

  @Column({ name: 'evaluation_date', type: 'date', default: () => 'CURRENT_DATE' })
  evaluationDate!: string;

  @Column({ name: 'evaluated_by' })
  evaluatedById!: number;

  @ManyToOne(() => Advisor, (a) => a.evaluations, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'evaluated_by' })
  evaluator!: Advisor;

  @Column({ type: 'text', nullable: true })
  comments?: string;

  @Column({ name: 'is_published', default: false })
  isPublished!: boolean;

  @Column({ name: 'attachment_path', length: 500, nullable: true })
  attachmentPath?: string;
}
