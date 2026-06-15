import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';
import { jwtConfig, TJwtConfig } from '../../config/jwt.config';
import { TJwtPayload } from '../auth.types';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    @Inject(jwtConfig.KEY)
    protected jwtConfig: TJwtConfig,
  ) {
    super({
      jwtFromRequest: (req: Request) =>
        (req?.cookies?.['refresh_token'] as string) ?? null,
      secretOrKey: jwtConfig.refreshSecret,
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }

  validate(
    req: Request,
    payload: TJwtPayload,
  ): TJwtPayload & { refreshToken: string } {
    const refreshToken = req.cookies?.['refresh_token'] as string | null;
    if (!refreshToken) throw new UnauthorizedException();
    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      refreshToken,
    };
  }
}
