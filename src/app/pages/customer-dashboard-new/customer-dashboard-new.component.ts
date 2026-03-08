import { Component, OnInit } from '@angular/core';
import {
  RouterOutlet,
  RouterLink,
  RouterLinkActive,
  Router,
} from '@angular/router';
import { AuthService } from '../../services/authService/auth.service';
import { UserService } from '../../services/user/user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-customer-dashboard-new',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './customer-dashboard-new.component.html',
  styleUrl: './customer-dashboard-new.component.scss',
})
export class CustomerDashboardNewComponent implements OnInit {
  user: any = null;
  constructor(
    private authService: AuthService,
    private router: Router,
    private userSerivce: UserService,
  ) {}

  ngOnInit() {
    this.userSerivce
      .getUserById(this.authService.getUser().id)
      .subscribe({
        next: (data: any) => {
          this.user = data.data || null;
        },
      });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/home']);
  }

  gotoHome() {
    this.router.navigate(['/home']);
  }

  getNickname() {
    if (!this.user) return 'UN';
    return this.user?.name
      ?.split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase();
  }
}
