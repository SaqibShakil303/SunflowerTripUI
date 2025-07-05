import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { RouterLink, RouterModule, Router } from '@angular/router';

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
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  isScrolled = false;
  isMobileNavVisible = true;
  navGroups: NavGroup[] = [
    {
      label: 'Holiday Packages',
      items: [{ 
        name: 'Holiday Packages', 
        route: '/tours', 
        queryParams: { category: 'holiday' } 
      }],
      locations: []
    },
    {
      label: 'Group Packages',
      items: [{ 
        name: 'Group Packages', 
        route: '/tours', 
        queryParams: { category: 'group' } 
      }],
      locations: []
    }
  ];

  constructor(private router: Router) {}

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

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    const target = event.target as HTMLElement;
    const clickedInsideNav = target.closest('.contact-info') || target.closest('.mobile-show-btn');
    if (!clickedInsideNav && this.isMobileNavVisible) {
      this.isMobileNavVisible = false;
    }
  }
}