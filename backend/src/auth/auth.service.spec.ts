import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { jwtConfig } from '../config/jwt.config';
import { appConfig } from '../config/app.config';
import { Gender, UserRole } from '../users/users.enums';
import { CreateUserDto } from '../users/dto/create-user.dto';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;

  const mockUsersService = {
    create: jest.fn(),
    findOneByEmail: jest.fn(),
    findOneById: jest.fn(),
    setRefreshToken: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: jwtConfig.KEY,
          useValue: {
            refreshSecret: 'refresh-secret',
            refreshExpiresIn: '7d',
          },
        },
        {
          provide: appConfig.KEY,
          useValue: {
            hashSalt: 10,
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should clear refresh token on logout', async () => {
    mockUsersService.setRefreshToken.mockResolvedValue(undefined);

    await service.logout('user-id');

    expect(mockUsersService.setRefreshToken).toHaveBeenCalledWith(
      'user-id',
      null,
    );
  });

  it('should throw UnauthorizedException when login user is not found', async () => {
    mockUsersService.findOneByEmail.mockResolvedValue(null);

    await expect(
      service.login({
        email: 'missing@example.com',
        password: 'password',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('should throw UnauthorizedException when login password is invalid', async () => {
    mockUsersService.findOneByEmail.mockResolvedValue({
      id: 'user-id',
      email: 'user@example.com',
      password: 'hashed-password',
      role: 'USER',
    });
    jest.mocked(bcrypt.compare).mockResolvedValue(false as never);

    await expect(
      service.login({
        email: 'user@example.com',
        password: 'wrong-password',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('should login user and save hashed refresh token', async () => {
    mockUsersService.findOneByEmail.mockResolvedValue({
      id: 'user-id',
      email: 'user@example.com',
      password: 'hashed-password',
      role: 'USER',
    });
    jest.mocked(bcrypt.compare).mockResolvedValue(true as never);
    jest.mocked(bcrypt.hash).mockResolvedValue('hashed-refresh-token' as never);
    mockJwtService.signAsync
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token');
    mockUsersService.setRefreshToken.mockResolvedValue(undefined);

    const result = await service.login({
      email: 'user@example.com',
      password: 'password',
    });

    expect(result).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
    expect(mockUsersService.setRefreshToken).toHaveBeenCalledWith(
      'user-id',
      'hashed-refresh-token',
    );
  });

  it('should register user and save hashed refresh token', async () => {
    const dto: CreateUserDto = {
      name: 'User',
      email: 'user@example.com',
      password: 'password',
      birthdate: '2000-01-01',
      city: 'Moscow',
      gender: Gender.OTHER,
      wantToLearn: ['category-id'],
      about: 'About user',
    };
    mockUsersService.create.mockResolvedValue({
      id: 'user-id',
      email: dto.email,
      role: UserRole.USER,
    });
    jest.mocked(bcrypt.hash).mockResolvedValue('hashed-refresh-token' as never);
    mockJwtService.signAsync
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token');
    mockUsersService.setRefreshToken.mockResolvedValue(undefined);

    const result = await service.register(dto);

    expect(mockUsersService.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
    expect(mockUsersService.setRefreshToken).toHaveBeenCalledWith(
      'user-id',
      'hashed-refresh-token',
    );
  });

  it('should throw UnauthorizedException when refresh user is not found', async () => {
    mockUsersService.findOneById.mockResolvedValue(null);

    await expect(
      service.refresh('missing-user-id', 'refresh-token'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('should throw UnauthorizedException when refresh token is invalid', async () => {
    mockUsersService.findOneById.mockResolvedValue({
      id: 'user-id',
      email: 'user@example.com',
      role: UserRole.USER,
      refreshToken: 'hashed-refresh-token',
    });
    jest.mocked(bcrypt.compare).mockResolvedValue(false as never);

    await expect(
      service.refresh('user-id', 'wrong-refresh-token'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('should refresh tokens and save new hashed refresh token', async () => {
    mockUsersService.findOneById.mockResolvedValue({
      id: 'user-id',
      email: 'user@example.com',
      role: UserRole.USER,
      refreshToken: 'old-hashed-refresh-token',
    });
    jest.mocked(bcrypt.compare).mockResolvedValue(true as never);
    jest
      .mocked(bcrypt.hash)
      .mockResolvedValue('new-hashed-refresh-token' as never);
    mockJwtService.signAsync
      .mockResolvedValueOnce('new-access-token')
      .mockResolvedValueOnce('new-refresh-token');
    mockUsersService.setRefreshToken.mockResolvedValue(undefined);

    const result = await service.refresh('user-id', 'old-refresh-token');

    expect(result).toEqual({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    });
    expect(mockUsersService.setRefreshToken).toHaveBeenCalledWith(
      'user-id',
      'new-hashed-refresh-token',
    );
  });
});
