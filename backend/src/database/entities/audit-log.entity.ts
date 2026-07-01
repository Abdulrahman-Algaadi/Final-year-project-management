import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { UserAccount } from './user-account.entity';

@Entity('audit_log')
export class AuditLog extends BaseEntity {
  @Column({ name: 'table_name', length: 100 })
  tableName!: string;

  @Column({ name: 'record_id', type: 'int' })
  recordId!: number;

  @Column({ name: 'action_type', length: 20 })
  actionType!: string;

  @Column({ name: 'performed_by', nullable: true })
  performedById?: number;

  @ManyToOne(() => UserAccount)
  @JoinColumn({ name: 'performed_by' })
  performedBy?: UserAccount;

  @Column({ name: 'action_date', type: 'timestamptz', default: () => 'NOW()' })
  actionDate!: Date;
}
