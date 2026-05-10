import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConfig, TJwtConfig } from '../../config/jwt.config';
import { TJwtPayload } from '../auth.types';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @Inject(jwtConfig.KEY)
    protected jwtConfig: TJwtConfig,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtConfig.accessSecret,
      ignoreExpiration: false,
    });
  }

  async validate(payload: TJwtPayload) {
    const user = await this.usersService.findOneById(payload.sub);
    if (!user) throw new UnauthorizedException();
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}
