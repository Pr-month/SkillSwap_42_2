import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TJwtPayload } from '../auth.types';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = TJwtPayload>(err: unknown, user: TUser | false): TUser {
    if (err instanceof Error) {
      throw err;
    }

    if (!user) {
      throw new UnauthorizedException('Invalid access token');
    }

    return user;
  }
}
