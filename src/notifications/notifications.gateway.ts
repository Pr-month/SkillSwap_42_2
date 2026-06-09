import { Injectable, UseGuards } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { TAuthSocket, TNotificationPayload } from './notifications.types';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';

@Injectable()
@WebSocketGateway()
@UseGuards(WsJwtGuard)
export class NotificationsGateway {
  constructor(private readonly jwtGuard: WsJwtGuard) {}
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('connection')
  async handleConnection(client: TAuthSocket) {
    const userPayload = this.jwtGuard.checkToken(client);
    const userId = userPayload.sub;
    if (!userId) {
      return client.disconnect();
    }
    await client.join(userId);
  }

  notifyUser(id: string, payload: TNotificationPayload) {
    this.server
      .to(id)
      .emit(payload.notificationType, payload.notificationMessage);
  }
}
