import { Socket } from 'socket.io';
import { TJwtPayload } from '../auth/auth.types';
import { NotificationType } from './notifications.enums';

export type TAuthSocket = Socket & { user: TJwtPayload };

export type TNotificationPayload = {
  notificationType: NotificationType;
  notificationMessage: string;
};
