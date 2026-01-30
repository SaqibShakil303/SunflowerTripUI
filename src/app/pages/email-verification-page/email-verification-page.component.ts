import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { UserService } from '../../services/user/user.service';
import { AuthService } from '../../services/authService/auth.service';

@Component({
  selector: 'app-email-verification-page',
  standalone: true,
  imports: [],
  templateUrl: './email-verification-page.component.html',
  styleUrl: './email-verification-page.component.scss',
})
export class EmailVerificationPageComponent implements OnInit {
  token: string | null = null;
  jwt = new JwtHelperService();
  isValid: boolean = true;
  isAlreadyVerified: boolean = false;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private userSerivce: UserService,
    private authService: AuthService,
  ) {}
  ngOnInit(): void {
    this.verifyToken();
  }

  verifyToken() {
    try {
      this.token = this.activatedRoute.snapshot.paramMap.get('token');
      this.isValid = !this.jwt.isTokenExpired(this.token);
      if (this.isValid && typeof this.token === 'string') {
        const decodedToken = this.jwt.decodeToken(this.token);
        this.userSerivce.getUserByEmail(decodedToken.email).subscribe({
          next: (data: any) => {
            this.isValid = data.success ? true : false;
            this.isAlreadyVerified = data.user.is_email_verified;
          },
          error: () => (this.isValid = false),
        });
      }
    } catch (err) {
      console.log(err);
      this.isValid = false;
    }
  }

  verifyEmail() {
    if(!this.isAlreadyVerified && this.isValid && this.token) {
      this.authService.verifyUserEmail(this.token).subscribe({
        next: (data: any) => {
          data.success ? this.router.navigate(['/customer-dashboard/account']) : alert('failed to verify email');
        }
      })
    }
  }
}