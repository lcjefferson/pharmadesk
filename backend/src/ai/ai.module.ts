import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { OpenAiService } from './services/openai.service';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [SettingsModule],
  controllers: [AiController],
  providers: [OpenAiService],
  exports: [OpenAiService],
})
export class AiModule {}
