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
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    RouterLink
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email = '';
  password = '';
  hidePassword: boolean = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit() {
    // Ensure initial state of password visibility
    this.hidePassword = true;
  }

  onSubmit() {
    if (this.email && this.password) {
      this.authService.login(this.email, this.password).subscribe({
        next: (response) => {
          const userRole = response.userRole;
          console.log('Login response userRole:', userRole); // Debug log
          if (userRole === 'admin') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/home']);
          }
        },
        error: (err) => {
          console.error('Login error:', err);
          alert(err.message || 'Login failed. Please try again.');
        }
      });
    }
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
    console.log('Password visibility toggled. Hide password:', this.hidePassword);
    console.log('Current input type should be:', this.hidePassword ? 'password' : 'text');
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
    if (isPlatformBrowser(this.platformId)) {
      window.location.href = environment.truecallerAuthUrl;
    }
  }
}