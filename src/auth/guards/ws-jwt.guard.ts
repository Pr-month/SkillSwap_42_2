import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConfig, TJwtConfig } from '../../config/jwt.config';
import { TJwtPayload } from '../auth.types';

type WsClient = {
  handshake?: {
    headers?: Record<string, string | string[] | undefined>;
    query?: Record<string, string | string[] | undefined>;
  };
  user?: TJwtPayload;
};

@Injectable()
export class WsJwtGuard {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConf: TJwtConfig,
  ) {}

  checkToken(client: WsClient): TJwtPayload {
    const token = this.extractToken(client);

    if (!token) {
      throw new UnauthorizedException('Token is required');
    }

    let payload: TJwtPayload;

    try {
      payload = this.jwtService.verify<TJwtPayload>(token, {
        secret: this.jwtConf.accessSecret,
      });

      return payload;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractToken(client: WsClient): string | null {
    const authHeader = client.handshake?.headers?.authorization;
    const headerToken = Array.isArray(authHeader) ? authHeader[0] : authHeader;

    if (headerToken?.startsWith('Bearer ')) {
      return headerToken.slice(7);
    }

    const queryToken = client.handshake?.query?.token;
    const token = Array.isArray(queryToken) ? queryToken[0] : queryToken;

    return token ?? null;
  }
}
