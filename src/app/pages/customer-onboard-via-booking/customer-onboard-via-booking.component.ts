import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user/user.service';
import { AuthService } from '../../services/authService/auth.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-customer-onboard-via-booking',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './customer-onboard-via-booking.component.html',
  styleUrl: './customer-onboard-via-booking.component.scss',
})
export class CustomerOnboardViaBookingComponent {
  token: string | null = null;
  jwt = new JwtHelperService();
  isValid: boolean = true;
  isDefaultPasswordUsed: boolean = false;

  email = '';
  defaultPassword = '';

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private userService: UserService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.verifyTokenAndDefaultPassword();
  }

  verifyTokenAndDefaultPassword() {
    try {
      this.token = this.activatedRoute.snapshot.paramMap.get('token');
      this.isValid = !this.jwt.isTokenExpired(this.token);
      if (this.isValid && typeof this.token === 'string') {
        const decodedToken = this.jwt.decodeToken(this.token);
        this.userService.getUserByEmail(decodedToken.email).subscribe({
          next: (data: any) => {
            this.isDefaultPasswordUsed =
              data.user?.is_default_password_used === 0 ? false : true;
          },
          error: () => (this.isValid = false),
        });
      }
    } catch (err) {
      console.log(err);
      this.isValid = false;
    }
  }

  resetPassword() {
    if (!this.isDefaultPasswordUsed && this.isValid && this.token) {
      this.userService.getUserByEmail(this.email).subscribe({
        next: (data: any) => {
          console.log(data);
          const user = data.user;
          const isEmailValid = this.email === user.email;
          const isDefaultPwdValid =
            this.defaultPassword === user.default_password;
          if (!isEmailValid || !isDefaultPwdValid) {
            this.snackBar.open(
              'Email or Default password is incorrect',
              'Close',
              {
                duration: 5000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
              },
            );
          }
          if (data.success && isEmailValid && isDefaultPwdValid)
            this.router.navigate([`/reset-password/${this.token}`]);
        },
        error: (error) => {
          console.log('reset_password_eror:: ', error);
        },
      });
    }
  }
}
