import { Module } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfig, TJwtConfig } from '../config/jwt.config';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [jwtConfig.KEY],
      useFactory: (jwtConfig: TJwtConfig) => ({
        secret: jwtConfig.accessSecret,
        signOptions: {
          expiresIn: jwtConfig.accessExpiresIn,
        },
      }),
    }),
  ],
  providers: [NotificationsGateway, WsJwtGuard],
})
export class NotificationsModule {}
