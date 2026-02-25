import { Component, NgModule, OnInit, signal } from '@angular/core';
import { AuthService } from '../../../services/authService/auth.service';
import { UserService } from '../../../services/user/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { NgOtpInputComponent, NgOtpInputConfig } from 'ng-otp-input';

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
  contactNo: string = '';
  otp: string = '';
  disableOtpBtn: boolean = true;
  otpResData = signal({ success: false, message: '' });

  otpConfig: NgOtpInputConfig = {
    length: 4,
    allowNumbersOnly: true,
  };

  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.getUserAccount();
  }

  getUserAccount() {
    return this.userService
      .getUserByEmail(this.authService.getUser().email)
      .subscribe({
        next: (data: any) => (this.user = data?.user),
        error: (err) => console.log(err),
        complete: () => console.log(this.user),
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
        },
      });
    }
  }

  isOtpValid() {
    this.disableOtpBtn = !/^\d{4}$/.test(this.otp);
  }

  clearOtp() {
    this.otp = "",
    this.disableOtpBtn = true;
  }

  resetOtpResData() {
    this.otpResData.set({ success: false, message: '' });
  }
}
