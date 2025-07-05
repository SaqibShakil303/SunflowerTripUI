// src/app/guards/auth.guard.ts
import { Injectable, inject } from '@angular/core';
import {
    ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterModule
} from '@angular/router';
import { AuthService } from '../services/authService/auth.service';


@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  private auth = inject(AuthService);
  private router = inject(Router);

 canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredRoles = route.data['roles'] as string[];
    if (this.auth.isAuthenticated() && this.auth.hasRole(requiredRoles)) {
      return true;
    }
    this.router.navigate(['/login'], { queryParams: { error: 'Unauthorized access' } });
    return false;
  }
}
