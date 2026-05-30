import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TJwtPayload } from '../auth.types';

type TRefreshUser = TJwtPayload & {
  refreshToken: string;
};

@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {
  handleRequest<TUser = TRefreshUser>(
    err: unknown,
    user: TUser | false,
  ): TUser {
    if (err instanceof Error) {
      throw err;
    }

    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return user;
  }
}
