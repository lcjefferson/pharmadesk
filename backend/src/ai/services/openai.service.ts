import { Injectable } from '@nestjs/common';
import { SettingsService } from '../../settings/settings.service';
import OpenAI from 'openai';

@Injectable()
export class OpenAiService {
  private openai: OpenAI | null = null;

  constructor(private settingsService: SettingsService) {}

  async getClient(): Promise<OpenAI | null> {
    if (this.openai) return this.openai;

    const config = await this.settingsService.findOne('ai_config');
    const value = config.value as unknown;

    if (
      value &&
      typeof value === 'object' &&
      'apiKey' in value &&
      'provider' in value &&
      (value as { provider: string }).provider === 'openai'
    ) {
      const apiKey = (value as { apiKey?: string }).apiKey;
      if (apiKey) {
        this.openai = new OpenAI({ apiKey });
        return this.openai;
      }
    }
    return null;
  }

  async analyzeImage(
    imageUrl: string,
    prompt: string = 'Analise esta imagem',
  ): Promise<string> {
    const client = await this.getClient();
    if (!client) return 'Erro: OpenAI API Key não configurada.';

    try {
      const response = await client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
      });
      return response.choices[0].message.content || 'Sem resposta.';
    } catch (error) {
      console.error('OpenAI Vision Error:', error);
      return 'Erro ao processar imagem via IA.';
    }
  }

  async transcribeAudio(_audioBuffer: Buffer): Promise<string> {
    void _audioBuffer;
    // Note: This requires the buffer to be converted to a File-like object or passed correctly
    // For simplicity in this mock/prototype, we'll return a placeholder or implement if 'openai' package supports buffer directly easily
    // OpenAI node SDK expects a file-like object (ReadStream or File)

    const client = await this.getClient();
    if (!client) return 'Erro: OpenAI API Key não configurada.';

    try {
      // In a real implementation we would convert Buffer to File object
      // const transcription = await client.audio.transcriptions.create({
      //   file: audioFile,
      //   model: "whisper-1",
      // });
      // return transcription.text;

      return 'Transcrição de áudio simulada (Implementação real requer manipulação de arquivos temporários no backend)';
    } catch (error) {
      console.error('OpenAI Whisper Error:', error);
      return 'Erro ao transcrever áudio.';
    }
  }

  async chat(
    messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  ): Promise<string> {
    const client = await this.getClient();
    if (!client) return 'Erro: OpenAI API Key não configurada.';

    try {
      const response = await client.chat.completions.create({
        model: 'gpt-4o',
        messages: messages,
      });
      return response.choices[0].message.content || '';
    } catch (error) {
      console.error('Chat Error:', error);
      return 'Erro ao processar mensagem.';
    }
  }
}
