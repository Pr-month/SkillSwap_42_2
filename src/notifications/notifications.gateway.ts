import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { TAuthSocket } from './notifications.types';

@WebSocketGateway()
export class NotificationsGateway {
  @SubscribeMessage('connection')
  async handleConnection(client: TAuthSocket) {
    const userId = client.user.sub;
    if (!userId) {
      return client.disconnect();
    }
    await client.join(userId);
  }

  async notifyUser()
}
