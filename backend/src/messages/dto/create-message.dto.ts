import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { MessageSender, MessageType } from '../entities/message.entity';

export class CreateMessageDto {
  @IsString()
  @IsOptional()
  content?: string;

  @IsEnum(MessageType)
  @IsOptional()
  type?: MessageType;

  @IsEnum(MessageSender)
  @IsNotEmpty()
  sender: MessageSender;

  @IsUUID()
  @IsNotEmpty()
  clientId: string;

  @IsString()
  @IsOptional()
  fileName?: string;

  @IsString()
  @IsOptional()
  fileUrl?: string;
}
