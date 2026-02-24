import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/authService/auth.service';


export const RoleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const expectedRoles = route.data['roles'] as string[];

  if (!authService.isAuthenticated()) {
    authService.logout(); // bug fix: when the user open the website after long time, google auth cors error.
    router.navigate(['/login']);
    return false;
  }

  if (!authService.isAuthenticated()) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;

  
};