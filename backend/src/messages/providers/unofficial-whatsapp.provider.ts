import { Injectable, Logger } from '@nestjs/common';
import { IChatProvider } from '../interfaces/chat-provider.interface';
import { CreateMessageDto } from '../dto/create-message.dto';

@Injectable()
export class UnofficialWhatsappProvider implements IChatProvider {
  private readonly logger = new Logger(UnofficialWhatsappProvider.name);

  async sendMessage(message: CreateMessageDto): Promise<any> {
    this.logger.log(
      `[UNOFFICIAL API] Sending message to client ${message.clientId}: ${message.content}`,
    );
    await Promise.resolve();
    // Implementation for Unofficial API (e.g. wppconnect, venom, etc.)
    return { status: 'sent', provider: 'unofficial' };
  }
}
