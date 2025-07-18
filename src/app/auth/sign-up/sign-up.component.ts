import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/authService/auth.service';
import { environment } from '../../../environments/environments.dev';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    RouterLink
  ],
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit {
  email = '';
  password = '';
  confirmPassword = '';
  role = 'user';
  hidePassword: boolean = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.hidePassword = true;
  }

  onSubmit() {
    if (this.password !== this.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if (this.email && this.password && this.role) {
      this.authService.signup(this.email, this.password, this.role).subscribe({
        next: () => this.router.navigate(['/home']),
        error: (err) => {
          console.error('Signup error:', err);
          alert(err.message || 'Signup failed. Please try again.');
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