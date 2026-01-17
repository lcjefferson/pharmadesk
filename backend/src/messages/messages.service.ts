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

  async create(createMessageDto: CreateMessageDto): Promise<Message> {
    const message = this.messagesRepository.create(createMessageDto);

    // If message is from agent or system, send to external provider
    if (
      createMessageDto.sender === MessageSender.AGENT ||
      createMessageDto.sender === MessageSender.SYSTEM
    ) {
      await this.chatProvider.sendMessage(createMessageDto);
    }

    return await this.messagesRepository.save(message);
  }

  async findAll(clientId: string): Promise<Message[]> {
    return await this.messagesRepository.find({
      where: { clientId },
      order: { createdAt: 'ASC' },
    });
  }

  findOne(id: string) {
    return this.messagesRepository.findOne({ where: { id } });
  }

  update(id: string, updateMessageDto: UpdateMessageDto) {
    return this.messagesRepository.update(id, updateMessageDto);
  }

  remove(id: string) {
    return this.messagesRepository.delete(id);
  }
}
