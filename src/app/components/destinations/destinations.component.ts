import { Component, ViewChild, ElementRef, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import Aos from 'aos';
import Swiper from 'swiper';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { DestinationService } from '../../services/destination/destination.service';

interface DestinationCard {
  id: number;
  title: string;
  description: string;
  image_url: string;
  slug: string;
}

@Component({
  selector: 'app-destinations',
  templateUrl: './destinations.component.html',
  styleUrls: ['./destinations.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule],
  animations: [
    trigger('staggerAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(30px)' }),
          stagger(100, [
            animate('0.8s ease', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class DestinationsComponent implements AfterViewInit {
  @ViewChild('swiperContainer') swiperContainer!: ElementRef;
  destinations: DestinationCard[] = [];
  private swiper!: Swiper;

  constructor(
    private destinationService: DestinationService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.destinationService.getDestinations().subscribe({
      next: (data) => {
        this.destinations = data.map((d) => ({
          id: d.id,
          title: d.title,
          description: d.description,
          image_url: d.image_url,
          slug: d.title.toLowerCase().replace(/\s+/g, '-')
        }));
      },
      error: (err) => console.error('Failed to load destinations:', err)
    });
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      Aos.init({
        duration: 800,
        once: true
      });
      this.destinationService.getDestinations().subscribe({
        next: () => {
          setTimeout(() => this.initSwiper(), 100); // Slight delay to ensure DOM readiness
        }
      });
    }
  }

  private initSwiper(): void {
    if (this.swiperContainer && this.swiperContainer.nativeElement) {
      this.swiper = new Swiper(this.swiperContainer.nativeElement, {
        modules: [Navigation, Pagination, Autoplay],
        slidesPerView: 1,
        spaceBetween: 30,
        loop: true, // Enable looping for continuous playback
        centeredSlides: true,
        autoplay: {
          delay: 5000, // 5 seconds delay
          disableOnInteraction: false, // Continue autoplay after user interaction
          pauseOnMouseEnter: true // Pause on hover
        },
        pagination: {
          el: '.swiper-pagination',
          clickable: true, // Make bullets clickable
          dynamicBullets: false, // Ensure one bullet per slide
          renderBullet: (index, className) => {
            return `<span class="${className}"></span>`;
          }
        },
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev'
        },
        breakpoints: {
          640: {
            slidesPerView: 1,
            spaceBetween: 20
          },
          768: {
            slidesPerView: 2,
            spaceBetween: 30
          },
          1024: {
            slidesPerView: 3,
            spaceBetween: 40
          }
        }
      });
    } else {
      console.error('Swiper container not found or DOM not ready');
    }
  }
}