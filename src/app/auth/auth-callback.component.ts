

  import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
   import { ActivatedRoute, Router } from '@angular/router';

   import { catchError, tap } from 'rxjs/operators';
   import { of } from 'rxjs';
import { AuthService } from '../services/authService/auth.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';

   @Component({
     selector: 'app-auth-callback',
     standalone: true,
     
  imports: [CommonModule],
     template: `
       <div *ngIf="error" style="color: red; text-align: center; margin-top: 50px;">
         Error: {{ error }}
       </div>
       <div *ngIf="!error" style="text-align: center; margin-top: 50px;">
         Loading...
       </div>
     `,
     styles: [`
       div { font-size: 18px; }
     `]
   })
   export class AuthCallbackComponent implements OnInit {
    error: string | null = null;
  private isProcessing = false;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (this.isProcessing) {
      console.log('Already processing, skipping duplicate request');
      return;
    }
    this.isProcessing = true;

    const code = this.route.snapshot.queryParamMap.get('code');
    const provider = this.route.snapshot.paramMap.get('provider');
    const state = this.route.snapshot.queryParamMap.get('state');
    let storedState: string | null = null;

    if (isPlatformBrowser(this.platformId)) {
      storedState = sessionStorage.getItem('google_oauth_state');
      sessionStorage.removeItem('google_oauth_state'); // Clear state
    }

    if (code && provider === 'google') {
      console.log('Google callback code:', code, 'State:', state, 'Stored state:', storedState);
      if (isPlatformBrowser(this.platformId)) {
        this.router.navigate([], { queryParams: {}, replaceUrl: true }); // Clear query params
      }
      if (state && storedState && state !== storedState) {
        this.error = 'Invalid state parameter';
        console.error('Invalid state parameter:', { state, storedState });
        setTimeout(() => {
          this.router.navigate(['/login'], { queryParams: { error: this.error } });
        }, 3000);
        return;
      }
      this.authService.googleAuth(code).pipe(
        tap((response) => {
          console.log('Google auth response:', response.body);
          this.router.navigate(['/dashboard']);
        }),
        catchError((error) => {
          console.error('Google auth error:', error);
          this.error = error.error?.message || 'Authentication failed';
          setTimeout(() => {
            this.router.navigate(['/login'], { queryParams: { error: this.error } });
          }, 3000);
          return of(null);
        })
      ).subscribe();
    } else {
      this.error = 'Invalid callback parameters';
      console.error('Invalid callback parameters:', { code, provider, state, storedState });
      setTimeout(() => {
        this.router.navigate(['/login'], { queryParams: { error: this.error } });
      }, 3000);
    }
  }
}