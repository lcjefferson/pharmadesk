import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { diskStorage } from 'multer';
import { extname } from 'path';
import type { Request } from 'express';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(
    @Body() createMessageDto: CreateMessageDto,
    @Req() req: { user: { companyId: string | null } },
  ) {
    return this.messagesService.create(createMessageDto, req.user.companyId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll(
    @Query('clientId') clientId: string,
    @Req() req: { user: { companyId: string | null } },
  ) {
    if (clientId) {
      return this.messagesService.findAll(clientId, req.user.companyId);
    }
    return [];
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Req() req: { user: { companyId: string | null } },
  ) {
    return this.messagesService.findOne(id, req.user.companyId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMessageDto: UpdateMessageDto,
    @Req() req: { user: { companyId: string | null } },
  ) {
    return this.messagesService.update(
      id,
      updateMessageDto,
      req.user.companyId,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Req() req: { user: { companyId: string | null } },
  ) {
    return this.messagesService.remove(id, req.user.companyId);
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (
          req: Request,
          file: Express.Multer.File,
          cb: (error: Error | null, filename: string) => void,
        ) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return {
      filename: file.filename,
      url: `http://localhost:3000/uploads/${file.filename}`, // In production this would be S3 URL
      mimetype: file.mimetype,
    };
  }
}
