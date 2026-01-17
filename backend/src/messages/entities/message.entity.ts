import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Client } from '../../clients/entities/client.entity';

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  AUDIO = 'audio',
  DOCUMENT = 'document',
}

export enum MessageSender {
  AGENT = 'agent',
  USER = 'user',
  SYSTEM = 'system',
}

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({
    type: 'enum',
    enum: MessageType,
    default: MessageType.TEXT,
  })
  type: MessageType;

  @Column({
    type: 'enum',
    enum: MessageSender,
    default: MessageSender.AGENT,
  })
  sender: MessageSender;

  @Column({ nullable: true })
  fileName: string; // For documents/images

  @Column({ nullable: true })
  fileUrl: string; // For documents/images

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  clientId: string;

  @Column({ type: 'varchar', nullable: true })
  companyId: string | null;

  @ManyToOne(() => Client, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clientId' })
  client: Client;
}
