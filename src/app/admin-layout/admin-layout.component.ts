import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/authService/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss'
})
export class AdminLayoutComponent implements OnInit {
  isSidebarCollapsed: boolean = false;

  constructor(private router: Router) { }

  ngOnInit(): void {
    // Component initialization
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  logout(): void {
    console.log('Logout clicked');

    // Show confirmation and redirect
    if (confirm('Are you sure you want to logout?')) {
      // Clear any stored tokens/data
      localStorage.removeItem('authToken');
      sessionStorage.clear();

      // Redirect to login or home page
      this.router.navigate(['/login']);
    }
  }
}