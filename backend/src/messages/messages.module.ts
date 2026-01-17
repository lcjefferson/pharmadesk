import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { Message } from './entities/message.entity';
import { ChatGateway } from './chat.gateway';
import { OfficialWhatsappProvider } from './providers/official-whatsapp.provider';
import { UnofficialWhatsappProvider } from './providers/unofficial-whatsapp.provider';

@Module({
  imports: [TypeOrmModule.forFeature([Message])],
  controllers: [MessagesController],
  providers: [
    MessagesService,
    ChatGateway,
    OfficialWhatsappProvider,
    UnofficialWhatsappProvider,
    {
      provide: 'CHAT_PROVIDER',
      useFactory: (
        configService: ConfigService,
        official: OfficialWhatsappProvider,
        unofficial: UnofficialWhatsappProvider,
      ) => {
        const type = configService.get<string>('WHATSAPP_PROVIDER');
        return type === 'official' ? official : unofficial;
      },
      inject: [
        ConfigService,
        OfficialWhatsappProvider,
        UnofficialWhatsappProvider,
      ],
    },
  ],
  exports: [MessagesService],
})
export class MessagesModule {}
