import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Message, MessageSender } from './entities/message.entity';
import { IChatProvider } from './interfaces/chat-provider.interface';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
    @Inject('CHAT_PROVIDER')
    private chatProvider: IChatProvider,
  ) {}

  async create(
    createMessageDto: CreateMessageDto,
    companyId: string | null,
  ): Promise<Message> {
    const message = this.messagesRepository.create({
      ...createMessageDto,
      companyId: companyId ?? null,
    });

    // If message is from agent or system, send to external provider
    if (
      createMessageDto.sender === MessageSender.AGENT ||
      createMessageDto.sender === MessageSender.SYSTEM
    ) {
      await this.chatProvider.sendMessage(createMessageDto);
    }

    return await this.messagesRepository.save(message);
  }

  async findAll(
    clientId: string,
    companyId: string | null,
  ): Promise<Message[]> {
    return await this.messagesRepository.find({
      where: {
        clientId,
        ...(companyId ? { companyId } : {}),
      },
      order: { createdAt: 'ASC' },
    });
  }

  findOne(id: string, companyId: string | null) {
    return this.messagesRepository.findOne({
      where: {
        id,
        ...(companyId ? { companyId } : {}),
      },
    });
  }

  async update(
    id: string,
    updateMessageDto: UpdateMessageDto,
    companyId: string | null,
  ) {
    const message = await this.findOne(id, companyId);
    if (!message) return null;
    return this.messagesRepository.update(id, updateMessageDto);
  }

  async remove(id: string, companyId: string | null) {
    // Check ownership first
    const message = await this.findOne(id, companyId);
    if (!message) return null;
    return this.messagesRepository.delete(id);
  }
}
