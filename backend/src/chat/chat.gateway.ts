import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';

interface SendMessagePayload {
  recipientId: string;
  content: string;
}

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Map<userId, socketId>
  private connectedUsers = new Map<string, string>();

  constructor(
    private chatService: ChatService,
    private jwtService: JwtService,
  ) { }

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token || client.handshake.query?.token;
      if (!token) {
        client.disconnect();
        return;
      }
      const payload = this.jwtService.verify(token);
      this.connectedUsers.set(payload.sub, client.id);
      // Join a room with their userId so we can emit to them easily?
      // Or just use the socketId map. Room is cleaner for multiple devices.
      client.join(payload.sub);
    } catch (e) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    // Find userId by socketId and remove?
    // Inefficient map reverse lookup.
    // Better: store userId on socket object?
    // client.data.userId?
    // Let's assume singular connection for now or iterate.
    for (const [userId, socketId] of this.connectedUsers.entries()) {
      if (socketId === client.id) {
        this.connectedUsers.delete(userId);
        break;
      }
    }
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SendMessagePayload,
  ) {
    // Get senderId from token/connection
    // We can re-verify or trust handleConnection.
    // Better to store userId in client.data
    // I'll parse token again or use map if I stored it.
    // Let's use the map (Wait, map is userId -> socketId).
    // I need socketId -> userId.
    // I'll decoding token again or store in client.data.

    // Quick fix: decode token from handshake again since I didn't store in client.data above (fix: store in client.data)
    const token = client.handshake.auth?.token || client.handshake.query?.token;
    const user = this.jwtService.verify(token); // Should succeed as connection is open
    const senderId = user.sub;

    const message = await this.chatService.sendMessage(
      senderId,
      payload.recipientId,
      payload.content,
    );

    // Emit to recipient
    this.server.to(payload.recipientId).emit('receiveMessage', message);

    // Emit back to sender (confirm/sync)
    // this.server.to(senderId).emit('receiveMessage', message); 
    // Usually client optimistically adds, but syncing is good.
    // Let's return the message to the caller only?
    // "return message;" sends ack to sender.
    // But other devices of sender need it too.
    this.server.to(senderId).emit('receiveMessage', message);

    return message;
  }
}
