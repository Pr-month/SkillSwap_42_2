import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtAuthModule } from './jwt/jwt.module';

@Module({
  imports: [JwtAuthModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
