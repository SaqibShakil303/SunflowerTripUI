import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/authService/auth.service';
import { MatIconModule } from '@angular/material/icon';    
import { Router, RouterLink } from '@angular/router';
import { environment } from '../../../environments/environments.dev';

@Component({
  selector: 'app-login',
  standalone: true,

 
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule,MatIconModule,FormsModule,RouterLink],
   templateUrl: './login.component.html',
 styleUrls: ['../auth-callback.component.scss'],
  // template: `
  //   <div class="container">
  //     <h2>Login</h2>
  //     <form (ngSubmit)="onSubmit()">
  //       <mat-form-field>
  //         <mat-label>Email</mat-label>
  //         <input matInput [(ngModel)]="email" name="email" type="email" required>
  //       </mat-form-field>
  //       <mat-form-field>
  //         <mat-label>Password</mat-label>
  //         <input matInput [(ngModel)]="password" name="password" type="password" required>
  //       </mat-form-field>
  //       <button mat-raised-button color="primary" type="submit">Login</button>
  //     </form>
  //     <button mat-raised-button color="accent" (click)="googleLogin()">Login with Google</button>
  //     <button mat-raised-button color="accent" (click)="truecallerLogin()">Login with Truecaller</button>
  //   </div>
  // `,
  // styles: [`
  //   .container { max-width: 400px; margin: 50px auto; padding: 20px; }
  //   mat-form-field { width: 100%; margin-bottom: 20px; }
  //   button { width: 100%; margin-bottom: 10px; }
  // `]
})
export class LoginComponent {
  email = '';
  password = '';
 hidePassword: boolean = true;
 
  constructor(private authService: AuthService, private router: Router  ,@Inject(PLATFORM_ID) private platformId: Object) {}

  onSubmit() {
    this.authService.login(this.email, this.password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => alert(err.message)
    });
  }

googleLogin() {
    const redirectUri = `${window.location.origin}/auth/google/callback`;
    let state: string | undefined;
    if (isPlatformBrowser(this.platformId)) {
      state = Math.random().toString(36).substring(2);
      sessionStorage.setItem('google_oauth_state', state);
      console.log('Google redirect_uri:', redirectUri, 'State:', state);
    } else {
      console.log('Google redirect_uri:', redirectUri, 'No state (SSR)');
    }
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${environment.googleClientId}&redirect_uri=${redirectUri}&response_type=code&scope=email profile${state ? `&state=${state}` : ''}`;
    if (isPlatformBrowser(this.platformId)) {
      window.location.href = authUrl;
    }
  }


  truecallerLogin() {
    window.location.href = environment.truecallerAuthUrl;
  }
}