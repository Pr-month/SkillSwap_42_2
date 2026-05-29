import { Socket } from 'socket.io';
import { TJwtPayload } from '../auth/auth.types';

export type TAuthSocket = Socket & { user: TJwtPayload };
