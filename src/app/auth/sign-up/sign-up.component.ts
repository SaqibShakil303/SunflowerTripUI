import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AuthService } from '../../services/authService/auth.service';
import { ApiService } from '../../services/apiService/api.service';
import { Router, RouterLink } from '@angular/router';
import { JWT_OPTIONS, JwtHelperService } from '@auth0/angular-jwt';
import { tokenGetter } from '../../../main';
import { environment } from '../../../environments/environments.dev';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule,MatIconModule,FormsModule,RouterLink],
  //  providers: [
  //   // recreate exactly what JwtModule.forRoot would do
  //   {
  //     provide: JWT_OPTIONS,
  //     useValue: {
  //       tokenGetter,
  //       allowedDomains: ['localhost:3000'],
  //       disallowedRoutes: []
  //     }
  //   },
  //   JwtHelperService
  // ],
  templateUrl: './sign-up.component.html',
 styleUrls: ['../auth-callback.component.scss'],
})
export class SignUpComponent {
  email = '';
  password = '';
   confirmPassword: string = '';
  role = 'user';
   hidePassword: boolean = true;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.authService.signup(this.email, this.password, this.role).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => alert(err.message)
    });
  }
  googleLogin() {
         const redirectUri = `${window.location.origin}/auth/google/callback`;
         const state = Math.random().toString(36).substring(2); // Random state
         console.log('Google redirect_uri:', redirectUri, 'State:', state);
         sessionStorage.setItem('google_oauth_state', state); // Store state
         window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${environment.googleClientId}&redirect_uri=${redirectUri}&response_type=code&scope=email profile&state=${state}`;
       }
  
  
    truecallerLogin() {
      window.location.href = environment.truecallerAuthUrl;
    }
}
