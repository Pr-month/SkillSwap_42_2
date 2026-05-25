import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { Roles } from './roles.decorator';
import { TAuthRequest } from 'src/auth/auth.types';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const role = this.reflector.get(Roles, context.getHandler());
    if (!role) {
      return true;
    }
    const request = context.switchToHttp().getRequest<TAuthRequest>();
    const user = request.user;
    return role === user.role;
  }
}
