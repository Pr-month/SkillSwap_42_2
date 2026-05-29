import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { TAuthSocket, TNotificationPayload } from './notifications.types';
import { Injectable } from '@nestjs/common';

@Injectable()
@WebSocketGateway()
export class NotificationsGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('connection')
  async handleConnection(client: TAuthSocket) {
    const userId = client.user.sub;
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
