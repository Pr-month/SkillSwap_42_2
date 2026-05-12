import {
  Injectable,
  ConflictException,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../users/entities/user.entity';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { jwtConfig, TJwtConfig } from '../config/jwt.config';
import { appConfig, TAppConfig } from '../config/app.config';
import { TJwtPayload } from './auth.types';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConf: TJwtConfig,
    @Inject(appConfig.KEY)
    private readonly appConf: TAppConfig,
  ) {}

  async register(dto: CreateUserDto) {
    const existing = await this.userRepository.findOneBy({ email: dto.email });
    if (existing) throw new ConflictException('Email already in use');

    const hashedPassword = await bcrypt.hash(
      dto.password,
      this.appConf.hashSalt,
    );
    const user = this.userRepository.create({
      ...dto,
      password: hashedPassword,
    });
    await this.userRepository.save(user);

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.saveRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async login(dto: LoginDto) {
    const user: Pick<User, 'id' | 'email' | 'password' | 'role'> | null =
      await this.userRepository.findOne({
        where: { email: dto.email },
        select: ['id', 'email', 'password', 'role'],
      });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.saveRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async refresh(userId: string, refreshToken: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'email', 'role', 'refreshToken'],
    });
    if (!user || !user.refreshToken) throw new UnauthorizedException();

    const tokenMatch = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!tokenMatch) throw new UnauthorizedException('Refresh token invalid');

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.saveRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: string) {
    const updatedUser = await this.userRepository.update(userId, {
      refreshToken: null,
    });
    return updatedUser;
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
    await this.userRepository.update(userId, { refreshToken: hashed });
  }
}
