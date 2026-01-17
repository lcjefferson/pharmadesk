import { Injectable, Logger } from '@nestjs/common';
import { IChatProvider } from '../interfaces/chat-provider.interface';
import { CreateMessageDto } from '../dto/create-message.dto';

@Injectable()
export class OfficialWhatsappProvider implements IChatProvider {
  private readonly logger = new Logger(OfficialWhatsappProvider.name);

  async sendMessage(message: CreateMessageDto): Promise<any> {
    this.logger.log(
      `[OFFICIAL API] Sending message to client ${message.clientId}: ${message.content}`,
    );
    await Promise.resolve();
    // Implementation for Meta Cloud API (axios post to https://graph.facebook.com/...)
    return { status: 'sent', provider: 'official' };
  }
}
