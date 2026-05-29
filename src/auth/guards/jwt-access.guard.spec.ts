import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './jwt-access.guard';
import { UnauthorizedException } from '@nestjs/common';
import { UserRole } from '../../users/users.enums';
import { TJwtPayload } from '../auth.types';

jest.mock('@nestjs/passport', () => ({
  AuthGuard: jest.fn(() => {
    return class MockAuthGuard {
      canActivate = jest.fn();
    };
  }),
}));

describe('JwtAuthGuard', () => {
  it('should use jwt strategy', () => {
    expect(AuthGuard).toHaveBeenCalledWith('jwt');
  });

  it('should be defined', () => {
    const guard = new JwtAuthGuard();

    expect(guard).toBeDefined();
  });

  it('should return user when token is valid', () => {
    const guard = new JwtAuthGuard();
    const user: TJwtPayload = {
      sub: 'user-id',
      email: 'user@example.com',
      role: UserRole.USER,
    };

    const result = guard.handleRequest(null, user);

    expect(result).toBe(user);
  });

  it('should throw UnauthorizedException when user is missing', () => {
    const guard = new JwtAuthGuard();

    expect(() => guard.handleRequest(null, false)).toThrow(
      UnauthorizedException,
    );
  });

  it('should throw original error when strategy returns error', () => {
    const guard = new JwtAuthGuard();
    const error = new Error('Strategy error');

    expect(() => guard.handleRequest(error, false)).toThrow(error);
  });
});
