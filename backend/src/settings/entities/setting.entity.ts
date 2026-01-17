import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity('settings')
@Index(['key', 'companyId'], { unique: true })
export class Setting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  key: string;

  @Column({ type: 'jsonb', nullable: true })
  value: any;

  @Column({ type: 'varchar', nullable: true })
  companyId: string | null;
}
