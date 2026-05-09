import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfig, TJwtConfig } from '../../config/jwt.config';

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
  providers: [],
  exports: [JwtModule],
})
export class JwtAuthModule {}
