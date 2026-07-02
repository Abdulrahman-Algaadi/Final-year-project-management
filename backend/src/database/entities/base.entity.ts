import { CreateDateColumn, DeleteDateColumn, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;
}

export abstract class SoftDeleteEntity extends BaseEntity {
  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt?: Date | null;
}

/** Person-linked tables (student, advisor) share person.id as PK — not auto-generated. */
export abstract class PersonLinkedEntity {
  @PrimaryColumn()
  id!: number;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt?: Date | null;
}

export abstract class TimestampEntity extends BaseEntity {
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
