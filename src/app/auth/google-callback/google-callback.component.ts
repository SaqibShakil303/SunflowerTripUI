import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/authService/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-google-callback',
  standalone: true,
  imports: [],
  templateUrl: './google-callback.component.html',
  styleUrl: './google-callback.component.scss',
})
export class GoogleCallbackComponent implements OnInit {
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    const result$ = this.authService.processGoogleOAuthLogin();
    if (result$) {
      result$.subscribe((data: any) => {
        this.authService.storeToken(data.tokens, data.userRole, 'google');
        this.router.navigate(['/customer-dashboard']);
      });
    } else {
      this.router.navigate(['/login']);
    }
  }
}