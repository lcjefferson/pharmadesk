import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly messagesService: MessagesService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() clientId: string,
    @ConnectedSocket() client: Socket,
  ) {
    void client.join(clientId);
    console.log(`Client ${client.id} joined room ${clientId}`);
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @MessageBody() clientId: string,
    @ConnectedSocket() client: Socket,
  ) {
    void client.leave(clientId);
  }

  @SubscribeMessage('msgToServer')
  async handleMessage(@MessageBody() createMessageDto: CreateMessageDto) {
    const message = await this.messagesService.create(createMessageDto, null);
    this.server.to(createMessageDto.clientId).emit('msgToClient', message);
    return message;
  }

  @SubscribeMessage('typing')
  handleTyping(@MessageBody() data: { clientId: string; isTyping: boolean }) {
    this.server.to(data.clientId).emit('typing', data);
  }
}
