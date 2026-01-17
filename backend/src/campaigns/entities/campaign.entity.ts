import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum CampaignType {
  ONE_SHOT = 'one-shot',
  AUTOMATION = 'automation',
}

export enum CampaignStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  RUNNING = 'running',
  COMPLETED = 'completed',
  PAUSED = 'paused',
}

@Entity('campaigns')
export class Campaign {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: CampaignType,
    default: CampaignType.ONE_SHOT,
  })
  type: CampaignType;

  @Column({
    type: 'enum',
    enum: CampaignStatus,
    default: CampaignStatus.DRAFT,
  })
  status: CampaignStatus;

  @Column({ type: 'text', nullable: true })
  target: string; // Ex: 'tag:vip', 'all', 'segment:123'

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ nullable: true })
  trigger: string; // For automation: 'lead_created', 'tag_added'

  @Column({ nullable: true })
  scheduledAt: Date;

  @Column({ default: 0 })
  reach: number;

  @Column({ default: 0 })
  opened: number;

  @Column({ default: 0 })
  clicked: number;

  @CreateDateColumn()
  createdAt: Date;
}
