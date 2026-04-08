import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../Services/auth-service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const expectedRole:string[] = route.data['rol'];
  const userRole = authService.getUserRole();

  if(authService.isAuthenticated() && expectedRole.includes(userRole!)){
    return true;
  }

  return router.parseUrl('/login');
};
