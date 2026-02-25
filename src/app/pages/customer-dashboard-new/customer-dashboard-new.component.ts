import { Component } from '@angular/core';
import {
  RouterOutlet,
  RouterLink,
  RouterLinkActive,
  Router,
} from '@angular/router';
import { AuthService } from '../../services/authService/auth.service';

@Component({
  selector: 'app-customer-dashboard-new',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './customer-dashboard-new.component.html',
  styleUrl: './customer-dashboard-new.component.scss',
})
export class CustomerDashboardNewComponent {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}
  logout() {
    this.authService.logout();
    this.router.navigate(['/home']);
  }
}
