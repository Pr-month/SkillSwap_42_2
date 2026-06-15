import { AuthGuard } from '@nestjs/passport';
import { JwtRefreshGuard } from './jwt-refresh.guard';

jest.mock('@nestjs/passport', () => ({
  AuthGuard: jest.fn(() => {
    return class MockAuthGuard {};
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
});
