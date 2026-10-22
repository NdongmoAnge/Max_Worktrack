import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Role } from './models';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.user() ? true : router.createUrlTree(['/login']);
};

export const homeGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.user() ? router.createUrlTree([auth.base(), 'dashboard']) : router.createUrlTree(['/login']);
};

export const roleGuard = (...roles: Role[]): CanActivateFn => () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const u = auth.user();
  if (!u) return router.createUrlTree(['/login']);
  return roles.includes(u.role) ? true : router.createUrlTree([auth.base(), 'dashboard']);
};
