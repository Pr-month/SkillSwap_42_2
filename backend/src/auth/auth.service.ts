import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { jwtConfig, TJwtConfig } from '../config/jwt.config';
import { appConfig, TAppConfig } from '../config/app.config';
import { TJwtPayload } from './auth.types';
import { LoginDto } from './dto/login.dto';
import { UsersService } from 'src/users/users.service';
import { UserRole } from '../users/users.enums';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConf: TJwtConfig,
    @Inject(appConfig.KEY)
    private readonly appConf: TAppConfig,
  ) {}

  async register(dto: CreateUserDto) {
    const user = await this.userService.create(dto);
    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.saveRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async login(dto: LoginDto) {
    const user = await this.userService.findOneByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.saveRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async refresh(userId: string, refreshToken: string) {
    const user = await this.userService.findOneById(userId);
    if (!user || !user.refreshToken) throw new UnauthorizedException();

    const tokenMatch = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!tokenMatch) throw new UnauthorizedException('Refresh token invalid');

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.saveRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: string) {
    return await this.userService.setRefreshToken(userId, null);
  }

  private async generateTokens(userId: string, email: string, role: UserRole) {
    const payload: TJwtPayload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        secret: this.jwtConf.refreshSecret,
        expiresIn: this.jwtConf.refreshExpiresIn,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async saveRefreshToken(userId: string, refreshToken: string) {
    const hashed = await bcrypt.hash(refreshToken, this.appConf.hashSalt);
    await this.userService.setRefreshToken(userId, hashed);
  }
}
