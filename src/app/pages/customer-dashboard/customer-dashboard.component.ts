import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { NavbarComponent } from '../../common/navbar/navbar.component';
import { FooterComponent } from '../../common/footer/footer.component';
import { RouterOutlet, RouterModule, Route, Router } from '@angular/router';
import { AuthService } from '../../services/authService/auth.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, RouterModule, RouterOutlet],
  templateUrl: './customer-dashboard.component.html',
  styleUrl: './customer-dashboard.component.scss',
})

export class CustomerDashboardComponent {
  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private authService: AuthService,
    private router: Router
  ) {}

  logout() {
    this.authService.logout();
    this.router.navigate(['/home']);
  }
}