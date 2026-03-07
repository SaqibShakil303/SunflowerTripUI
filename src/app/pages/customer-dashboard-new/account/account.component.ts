import { Component, NgModule, OnInit, signal } from '@angular/core';
import { AuthService } from '../../../services/authService/auth.service';
import { UserService } from '../../../services/user/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { NgOtpInputComponent, NgOtpInputConfig } from 'ng-otp-input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgOtpInputComponent,
  ],
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss',
})
export class AccountComponent implements OnInit {
  user: any | null = null;
  userLoading: boolean = true;
  contactNo: string = '';
  otp: string = '';
  disableOtpBtn: boolean = true;
  otpResData = signal({ success: false, message: '' });

  otpConfig: NgOtpInputConfig = {
    length: 4,
    allowNumbersOnly: true,
  };

  name: string = '';
  phone: string = '';
  email: string = '';

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.getUserAccount();
  }

  getUserAccount() {
    return this.userService
      .getUserByEmail(this.authService.getUser().email)
      .subscribe({
        next: (data: any) => {
          this.user = data?.user;
          this.name = this.user.name;
          this.phone = this.user.contact_no;
          this.email = this.user.email;
        },
        error: (err) => console.log(err),
        complete: () => {
          console.log(this.user);
          this.userLoading = false;
        },
      });
  }

  sendEmailVerificationLink() {
    this.authService
      .getEmailVerificationLink(this.user?.email, this.user?.name)
      .subscribe((data) => console.log(data));
  }

  addContactNo(addContactForm: NgForm) {
    if (this.user) {
      this.userService
        .addContactNo(this.user.id, addContactForm.value.contactNo)
        .subscribe({
          next: (data: any) => {
            console.log(data);
            if (data.success) {
              this.getUserAccount();
              this.snackBar.open('Contact No added successfully', 'close', {
                duration: 5000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
              });
            }
          },
          error: (error) => console.log(error),
        });
    }
  }

  getOtp() {
    this.clearOtp();
    this.resetOtpResData();
    if (this.user) {
      this.authService.getOtp(this.user.id).subscribe({
        next: (data: any) => {
          console.log(data);
          this.otpResData.set(data);
        },
        error: (error) => {
          console.log(error);
          this.otpResData.set(error.error);
          this.snackBar.open('Failed to send OTP: try again later', 'close', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
        },
      });
    }
  }

  verifyOtp(otpForm: NgForm) {
    this.resetOtpResData();
    if (this.user) {
      console.log(otpForm.value);
      this.authService.verifyOtp(otpForm.value.otp, this.user.id).subscribe({
        next: (data: any) => {
          this.getUserAccount();
          this.otpResData.set(data);
          console.log(data);
        },
        error: (error) => {
          console.log(error);
          this.otpResData.set(error.error);
          this.snackBar.open(
            'Failed to verify OTP... try again later',
            'close',
            {
              horizontalPosition: 'center',
              verticalPosition: 'top',
            },
          );
        },
      });
    }
  }

  isOtpValid() {
    this.disableOtpBtn = !/^\d{4}$/.test(this.otp);
  }

  clearOtp() {
    ((this.otp = ''), (this.disableOtpBtn = true));
  }

  resetOtpResData() {
    this.otpResData.set({ success: false, message: '' });
  }

  updateName(form: NgForm) {
    if (this.user && form && this.user.name !== form.value.name) {
      this.userService
        .updateAccount(this.user.id, { name: form.value.name })
        .subscribe({
          next: (data: any) => {
            if (data.success) {
              document.getElementById('update-name-form')?.hidePopover();
              this.getUserAccount();
              this.snackBar.open('Name updated successfully', 'close', {
                duration: 5000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
              });
            }
          },
          error: (error) => {
            this.snackBar.open(
              'Failed to update name. Please try again later',
              'close',
              {
                duration: 5000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
              },
            );
          },
        });
    }
  }

  updatePhone(form: NgForm) {
    if (this.user && form && this.user.contact_no !== form.value.phone)
      this.userService
        .updateAccount(this.user.id, { phone: form.value.phone })
        .subscribe({
          next: (data: any) => {
            if (data.success) {
              document.getElementById('update-phone-form')?.hidePopover();
              this.getUserAccount();
              this.snackBar.open('Contact No updated successfully', 'close', {
                duration: 5000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
              });
            }
          },
          error: (error) => {
            if (error.status === 409) {
              this.snackBar.open(
                `Failed to update: ${error.error?.message}` || 'Conflict error',
                'close',
                {
                  duration: 5000,
                  horizontalPosition: 'center',
                  verticalPosition: 'top',
                },
              );
              return;
            }
            this.snackBar.open(
              'Failed to update contact. Please try again later',
              'close',
              {
                duration: 5000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
              },
            );
          },
        });
  }

  updateEmail(form: NgForm) {
    if (this.user && form && this.user.email !== form.value.email) {
      const emailChanged =
        form.value.email && form.value.email !== this.user.email;
      this.userService
        .updateAccount(this.user.id, { email: form.value.email })
        .subscribe({
          next: (data: any) => {
            if (data.success && emailChanged) {
              document.getElementById('update-email-form')?.hidePopover();
              this.snackBar.open(
                'Email update successful. You can now login with your new email. You will be logged out in 10 seconds.',
                'close',
                {
                  horizontalPosition: 'center',
                  verticalPosition: 'top',
                  duration: 10000,
                },
              );

              setTimeout(() => {
                this.authService.logout();
                this.router.navigate(['login']);
              }, 10000);
            }
          },
          error: (error: HttpErrorResponse) => {
            if (error.status === 409) {
              this.snackBar.open(
                `Failed to update: ${error.error?.message}` || 'Conflict error',
                'close',
                {
                  duration: 5000,
                  horizontalPosition: 'center',
                  verticalPosition: 'top',
                },
              );
              return;
            }
            this.snackBar.open(
              'Failed to update account: Try again later.',
              'close',
              {
                duration: 5000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
              },
            );
          },
        });
    }
  }
}
