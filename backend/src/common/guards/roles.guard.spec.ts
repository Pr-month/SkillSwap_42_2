import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../users/users.enums';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  const reflector = {
    get: jest.fn(),
  };

  const createContext = (role: UserRole): ExecutionContext =>
    ({
      getHandler: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({
          user: { role },
        }),
      }),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    const guard = new RolesGuard(reflector as unknown as Reflector);

    expect(guard).toBeDefined();
  });

  it('should allow access when role is not required', () => {
    reflector.get.mockReturnValue(undefined);
    const guard = new RolesGuard(reflector as unknown as Reflector);
    const context = createContext(UserRole.USER);

    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should allow access when user has required role', () => {
    reflector.get.mockReturnValue(UserRole.ADMIN);
    const guard = new RolesGuard(reflector as unknown as Reflector);
    const context = createContext(UserRole.ADMIN);

    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should deny access when user does not have required role', () => {
    reflector.get.mockReturnValue(UserRole.ADMIN);
    const guard = new RolesGuard(reflector as unknown as Reflector);
    const context = createContext(UserRole.USER);

    const result = guard.canActivate(context);

    expect(result).toBe(false);
  });
});
