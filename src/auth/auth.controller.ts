import {
  Body,
  Controller,
  HttpCode,
  Inject,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import * as ms from 'ms';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { TAuthRequest } from './auth.types';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-access.guard';
import { jwtConfig, TJwtConfig } from '../config/jwt.config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConf: TJwtConfig,
  ) {}

  @Post('register')
  async register(
    @Body() dto: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.register(dto);
    this.setRefreshCookie(res, refreshToken);
    return { accessToken };
  }

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.login(dto);
    this.setRefreshCookie(res, refreshToken);
    return { accessToken };
  }

  private setRefreshCookie(res: Response, token: string) {
    res.cookie('refresh_token', token, {
      httpOnly: true,
      secure: false, // Only for development
      sameSite: 'strict',
      maxAge: ms(this.jwtConf.refreshExpiresIn),
      path: '/auth',
    });
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async logout(
    @Req() req: TAuthRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = req.user.sub;
    await this.authService.logout(userId);
    res.clearCookie('refresh_token');
    return { message: 'Logout successful' };
  }
}
