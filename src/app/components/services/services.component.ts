import { Component, AfterViewInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import AOS from 'aos';

interface Service {
  title: string;
  description: string;
  image: string;
  route: string;
  queryParams?: { category?: string };
}

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss']
})
export class ServicesComponent implements AfterViewInit {
  services: Service[] = [
    {
      title: 'Itineraries',
      description: 'We craft personalized travel plans based on your interests, schedule, and budget, ensuring a journey that’s uniquely yours.',
      image: 'https://images.pexels.com/photos/3467148/pexels-photo-3467148.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      route: '/itinerary'
    },
    {
      title: 'International Group Packages',
      description: 'Join our expertly guided group tours to Europe, Asia, UAE, and more, with comprehensive support and vibrant experiences.',
      image: 'https://images.pexels.com/photos/3467150/pexels-photo-3467150.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      route: '/tours',
      queryParams: { category: 'group' }
    },
    {
      title: 'Holiday Packages',
      description: 'Enjoy curated personal vacations to explore stunning destinations at your own pace, tailored to your preferences.',
      image: 'https://images.pexels.com/photos/3467152/pexels-photo-3467152.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      route: '/tours',
      queryParams: { category: 'holiday' }
    }
  ];

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      AOS.init({
        duration: 800,
        once: true
      });
    }
  }

  navigateTo(route: string, queryParams?: any) {
    this.router.navigate([route], { queryParams });
  }
}