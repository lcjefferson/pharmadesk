import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('leads')
export class Lead {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column('simple-array', { default: [] })
  tags: string[];

  @Column({ default: 'new' })
  status: string; // new, contacted, qualified, converted, lost

  @Column({ nullable: true })
  assignedToId: string;

  @Column({ nullable: true })
  source: string; // instagram, whatsapp, manual, etc.

  @Column({ type: 'varchar', nullable: true })
  companyId: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
