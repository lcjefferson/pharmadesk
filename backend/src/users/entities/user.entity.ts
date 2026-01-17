import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
  SUPERADMIN = 'superadmin',
  ADMIN = 'admin',
  SUPERVISOR = 'supervisor',
  OPERATOR = 'operator',
  SDR = 'sdr',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false }) // Don't return password by default
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.OPERATOR })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'varchar', nullable: true })
  companyId: string | null;

  @Column({ type: 'varchar', nullable: true })
  companyName: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
