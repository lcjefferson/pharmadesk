import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import OpenAI from 'openai';
import { OpenAiService } from './services/openai.service';

@Controller('ai')
@UseGuards(AuthGuard('jwt'))
export class AiController {
  constructor(private readonly openAiService: OpenAiService) {}

  @Post('chat')
  async chat(
    @Body()
    body: {
      messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
    },
    @Request() req: { user: { companyId: string | null } },
  ) {
    return {
      response: await this.openAiService.chat(
        body.messages,
        req.user.companyId,
      ),
    };
  }

  @Post('analyze-image')
  async analyzeImage(
    @Body() body: { imageUrl: string; prompt?: string },
    @Request() req: { user: { companyId: string | null } },
  ) {
    return {
      text: await this.openAiService.analyzeImage(
        body.imageUrl,
        body.prompt ||
          'Extraia todo o texto desta imagem. Se for uma receita médica, identifique os medicamentos e dosagens.',
        req.user.companyId,
      ),
    };
  }

  // Note: Actual file upload handling would require more setup (Multer), skipping for now to focus on logic structure
  // or assuming base64 or URL for simplicity in this iteration
}
