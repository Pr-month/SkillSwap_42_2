import { Request } from 'express';
import { UserRole } from '../users/users.enums';

export type TJwtPayload = {
  sub: string;
  email: string;
  role: UserRole;
};

export type TAuthRequest = Request & { user: TJwtPayload };

export type TRefreshRequest = Request & {
  user: TJwtPayload & { refreshToken: string };
};
