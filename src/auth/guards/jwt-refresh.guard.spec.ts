import { UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserRole } from '../../users/users.enums';
import { JwtRefreshGuard } from './jwt-refresh.guard';

jest.mock('@nestjs/passport', () => ({
  AuthGuard: jest.fn(() => {
    return class MockAuthGuard {
      canActivate = jest.fn();
    };
  }),
}));

describe('JwtRefreshGuard', () => {
  it('should use jwt-refresh strategy', () => {
    expect(AuthGuard).toHaveBeenCalledWith('jwt-refresh');
  });

  it('should be defined', () => {
    const guard = new JwtRefreshGuard();

    expect(guard).toBeDefined();
  });

  it('should return user when refresh token is valid', () => {
    const guard = new JwtRefreshGuard();
    const user = {
      sub: 'user-id',
      email: 'user@example.com',
      role: UserRole.USER,
      refreshToken: 'refresh-token',
    };

    const result = guard.handleRequest(null, user);

    expect(result).toBe(user);
  });

  it('should throw UnauthorizedException when user is missing', () => {
    const guard = new JwtRefreshGuard();

    expect(() => guard.handleRequest(null, false)).toThrow(
      UnauthorizedException,
    );
  });

  it('should throw original error when strategy returns error', () => {
    const guard = new JwtRefreshGuard();
    const error = new Error('Strategy error');

    expect(() => guard.handleRequest(error, false)).toThrow(error);
  });
});
