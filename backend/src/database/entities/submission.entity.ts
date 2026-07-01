import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { SoftDeleteEntity } from './base.entity';
import { StudentGroup } from './student-group.entity';
import { Advisor } from './advisor.entity';

@Entity('submission')
export class Submission extends SoftDeleteEntity {
  @Column({ name: 'group_id' })
  groupId!: number;

  @ManyToOne(() => StudentGroup, (g) => g.submissions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_id' })
  group!: StudentGroup;

  @Column({ length: 150 })
  title!: string;

  @Column({ name: 'file_path', length: 500 })
  filePath!: string;

  @Column({ name: 'version_no', type: 'int', default: 1 })
  versionNo!: number;

  @Column({ name: 'submitted_at', type: 'timestamptz', default: () => 'NOW()' })
  submittedAt!: Date;

  @Column({ name: 'submission_type', length: 50, nullable: true })
  submissionType?: string;

  @Column({ length: 30, default: 'Pending' })
  status!: string;

  @Column({ name: 'storage_bucket', length: 100, nullable: true })
  storageBucket?: string;

  @Column({ name: 'file_size', type: 'bigint', nullable: true })
  fileSize?: number;

  @Column({ name: 'mime_type', length: 100, nullable: true })
  mimeType?: string;

  @Column({ name: 'reviewed_by', nullable: true })
  reviewedById?: number;

  @ManyToOne(() => Advisor)
  @JoinColumn({ name: 'reviewed_by' })
  reviewedBy?: Advisor;

  @Column({ name: 'reviewed_at', type: 'timestamptz', nullable: true })
  reviewedAt?: Date;
}
