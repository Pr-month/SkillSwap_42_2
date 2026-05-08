import { Request } from 'express';
import { UserRole } from '../users/entities/user.entity';

export type TJwtPayload = {
  sub: string;
  email: string;
  role: UserRole;
};

export type TAuthRequest = Request<never, unknown, TJwtPayload, unknown>;
