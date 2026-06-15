import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './jwt-access.guard';

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
});
