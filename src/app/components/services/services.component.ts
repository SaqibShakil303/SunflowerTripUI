import { Component, AfterViewInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import AOS from 'aos';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss']
})
export class ServicesComponent implements AfterViewInit {
  services = [
    {
      title: 'Custom Itineraries',
      description: 'We craft personalized travel plans based on your interests, schedule, and budget, ensuring a journey that’s uniquely yours.',
      image: 'https://images.pexels.com/photos/3467148/pexels-photo-3467148.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      link: '/itinerary'
    },
    {
      title: 'International Group Tours',
      description: 'Join our expertly guided group tours to Europe, Asia, UAE, and more, with comprehensive support and vibrant experiences.',
      image: 'https://images.pexels.com/photos/3467150/pexels-photo-3467150.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      link: '/destinations'
    },
    {
      title: 'Domestic Packages',
      description: 'Explore India’s diverse landscapes with curated packages to Sikkim, Darjeeling, Rajasthan, Kerala, and beyond.',
      image: 'https://images.pexels.com/photos/3467152/pexels-photo-3467152.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      link: '/destinations'
    }
  ];
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      AOS.init({
        duration: 800,
        once: true
      });
    }
  }
}


  // services = [
  //   {
  //     icon: 'fas fa-plane',
  //     title: 'Travel Planning',
  //     description: 'Comprehensive itinerary planning tailored to your preferences.'
  //   },
  //   {
  //     icon: 'fas fa-hotel',
  //     title: 'Accommodation Booking',
  //     description: 'Handpicked hotels and resorts for a comfortable stay.'
  //   },
  //   {
  //     icon: 'fas fa-map',
  //     title: 'Guided Tours',
  //     description: 'Expert-led tours to explore the best of each destination.'
  //   },
  //   {
  //     icon: 'fas fa-passport',
  //     title: 'Visa Assistance',
  //     description: 'Hassle-free visa processing and support.'
  //   }
  // ];


