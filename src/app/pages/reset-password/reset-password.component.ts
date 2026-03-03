import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user/user.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent implements OnInit {
  hasAccess: boolean = true;
  isDefaultPasswordUsed: boolean = false;
  hidePassword: boolean = true;
  isValid: boolean = true;
  jwt = new JwtHelperService();
  email: string | null = null;
  token: string | null = '';

  password: string = '';
  confirmPassword: string = '';

  constructor(
    private route: Router,
    private userService: UserService,
    private activatedRoute: ActivatedRoute,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.verifyTokenAndPermission();
  }

  resetPassword() {
    if (this.email && this.password) {
      this.userService.createNewPassword(this.email, this.password).subscribe({
        next: (data: any) => {
          if (data.success){
            this.password = '';
            this.confirmPassword = '';
            this.snackBar.open(
              'Your passowrd created successfully. You will be redirect to home.',
              'Close',
              {
                duration: 5000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
              },
            );
            this.isDefaultPasswordUsed = true;
            this.hasAccess = false;
            setTimeout(() => {
              this.route.navigate(['']);
            }, 5000);
          }
        },
        error: (error) => console.log("create_new_password_error:: ", error)
      });
    }
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  verifyTokenAndPermission() {
    try {
      this.token = this.activatedRoute.snapshot.paramMap.get('token');
      this.isValid = !this.jwt.isTokenExpired(this.token);
      if (this.isValid && typeof this.token === 'string') {
        const decodedToken = this.jwt.decodeToken(this.token);
        this.userService.getUserByEmail(decodedToken.email).subscribe({
          next: (data: any) => {
            this.isDefaultPasswordUsed =
              data.user?.is_default_password_used === 0 ? false : true;
            this.email = decodedToken.email;
          },
          error: (error: HttpErrorResponse) => {
            if(error.status === 404) this.hasAccess = false;
            this.isValid = false
          },
        });
      }
    } catch (err) {
      console.log(err);
      this.isValid = false;
    }
  }
}
