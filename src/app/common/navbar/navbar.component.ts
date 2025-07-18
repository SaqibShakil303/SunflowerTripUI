import { Component, HostListener, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/authService/auth.service';

interface NavItem {
  name: string;
  route: string;
  queryParams?: {
    destination?: number;
    location?: number;
    category?: string;
  };
}

interface NavGroup {
  label: string;
  items: NavItem[];
  locations: NavItem[];
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  isScrolled = false;
  isMobileNavVisible = true;
  isLoggedIn: boolean = false;
  navGroups: NavGroup[] = [
    {
      label: 'Holiday Packages',
      items: [
        {
          name: 'Holiday Packages',
          route: '/tours',
          queryParams: { category: 'holiday' }
        }
      ],
      locations: []
    },
    {
      label: 'Group Packages',
      items: [
        {
          name: 'Group Packages',
          route: '/tours',
          queryParams: { category: 'group' }
        }
      ],
      locations: []
    }
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 50;
  }

  hideMobileNav() {
    this.isMobileNavVisible = false;
  }

  showMobileNav() {
    this.isMobileNavVisible = true;
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
    this.isMobileNavVisible = false;
  }

  customizeHoliday() {
    console.log('Customize holiday button clicked');
  }

  logout() {
    this.authService.logout();
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('isLoggedIn');
    }
    this.isLoggedIn = false;
    this.router.navigate(['/home']);
    this.isMobileNavVisible = false;
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    const target = event.target as HTMLElement;
    const clickedInsideNav = target.closest('.contact-info') || target.closest('.mobile-show-btn');
    if (!clickedInsideNav && this.isMobileNavVisible) {
      this.isMobileNavVisible = false;
    }
  }
}