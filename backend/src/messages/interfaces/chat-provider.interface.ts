import { CreateMessageDto } from '../dto/create-message.dto';

export abstract class IChatProvider {
  abstract sendMessage(message: CreateMessageDto): Promise<any>;
}
