import { Component, ViewChild, ElementRef, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import Aos from 'aos';
import Swiper from 'swiper';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { TourService } from '../../services/tours/tour.service';
import { NgOptimizedImage } from '@angular/common';
import { AuthService } from '../../services/authService/auth.service';
import { WishlistService } from '../../services/wishlist/wishlist.service';
import { error } from 'node:console';
interface TourCard {
  id: number;
  title: string;
  slug: string;
  description: string;
  duration_days: number;
  price_per_person: string;
  price_with_flight:string;
  price_currency: string;
  image_url: string;
}

@Component({
  selector: 'app-tours',
  templateUrl: './tours.component.html',
  styleUrls: ['./tours.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, NgOptimizedImage],
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
export class ToursComponent implements AfterViewInit { 
  @ViewChild('swiperContainer') swiperContainer!: ElementRef;
  tours: TourCard[] = [];
  private swiper!: Swiper;
  isUserLoggedin: boolean = false;
  user: any = null;
  wishlist: any [] = [];

  constructor(
    private authService: AuthService,
    private tourService: TourService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private wishlistService: WishlistService
  ) {}

  ngOnInit(): void {
    this.loadTours();
    this.isUserLoggedin = this.authService.isAuthenticated();
    this.user = this.authService.getUser();
    this.loadWishlistData();
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      Aos.init({
        duration: 800,
        once: true
      });
      // Ensure Swiper initializes after tours data is loaded
      this.tourService.getFeaturedTours().subscribe({
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

  loadTours() {
    this.tourService.getFeaturedTours().subscribe({
      next: (data) => {
        this.tours = data.map((tour) => ({
          id: tour.id,
          title: tour.title,
          slug: tour.slug,
          description: tour.description,
          duration_days: tour.duration_days,
          price_per_person: tour.price_per_person ?? '',
          price_with_flight:tour.price_with_flight??'',
          price_currency: tour.price_currency ?? '',
          image_url: tour.image_url
        }));
      },
      error: (err) => console.error('Failed to load featured tours:', err)
    });
  }

  loadWishlistData() {
    this.wishlistService.getByUserId(this.user.id).subscribe({
      next: (data: any) => {
        this.wishlist = data.data || [];
      },
      error: (error) => {
        console.log(error)
      }
    })
  }

  handleAddWishlist(data: {user_id: number, tour_id: number}) {
    console.log(data);
    this.wishlistService.create(data).subscribe({
      next: (data) => {
        this.loadWishlistData();
      },
      error: (error) => console.log(error)
    });
  }
  
  handleRemoveWishlist(id: number) {
    this.wishlistService.deleteById(this.getWishlistItem(id).id).subscribe({
      next: (data) => {
        this.loadWishlistData();
      },
      error: (error) => console.log(error)
    })
  }

  isInWishlist(tourId: number) {
    return this.wishlist.some(
      (item: any) => item.tour_id === tourId && item.user_id === this.user.id
    );
  }

  getWishlistItem(tourId: number) {
    return this.wishlist.find(
      (item: any) => item.tour_id === tourId && item.user_id === this.user.id
    );
  }
}