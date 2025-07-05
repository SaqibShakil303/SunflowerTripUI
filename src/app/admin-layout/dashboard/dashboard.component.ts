import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/authService/auth.service';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatButtonModule,RouterModule],
  template:` <div class="container">
      <h2>Welcome, {{ user?.email }}</h2>
      <p>Role: {{ user?.role }}</p>
        <li *ngIf="authService.hasRole(['admin', 'manager'])">
        <a routerLink="/admin">Admin's </a>
      </li>
      <button mat-raised-button color="warn" (click)="logout()">Logout</button>
    </div>`,
styles: [`
    .container { max-width: 600px; margin: 50px auto; padding: 20px; }
  `]
  // templateUrl: './dashboard.component.html',
  // styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  user: any;

  constructor(public authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.user = this.authService.getUser();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
