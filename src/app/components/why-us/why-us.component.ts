import { Component, ViewChild, ElementRef, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import AOS from 'aos';
import Swiper from 'swiper';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

@Component({
  selector: 'app-why-us',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './why-us.component.html',
  styleUrls: ['./why-us.component.scss']
})
export class WhyUsComponent implements AfterViewInit {
  @ViewChild('swiperContainer') swiperContainer!: ElementRef;

  whyUsItems = [
    {
      icon: 'fas fa-globe',
      title: 'Global Expertise, Local Touch',
      description: 'Based in Kolkata, we blend international standards with a deep understanding of Indian travelers’ preferences.'
    },
    {
      icon: 'fas fa-heart',
      title: 'Personalized Journeys',
      description: 'Every trip is tailored to your dreams, ensuring a unique and memorable experience.'
    },
    {
      icon: 'fas fa-headset',
      title: '24/7 Support',
      description: 'Our Kolkata team is always available to assist, from planning to your return home.'
    },
    {
      icon: 'fas fa-shield-alt',
      title: 'Trusted & Secure',
      description: 'Travel with confidence knowing every detail is handled by our experienced team.'
    }
  ];

  private swiper!: Swiper;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      AOS.init({ duration: 800, once: true });
      setTimeout(() => this.initSwiper(), 0);
    }
  }

  private initSwiper(): void {
    if (this.swiperContainer?.nativeElement) {
      this.swiper = new Swiper(this.swiperContainer.nativeElement, {
        modules: [Navigation, Pagination, Autoplay],
        slidesPerView: 1,
        spaceBetween: 30,
        loop: true,
        centeredSlides: true,
        autoplay: {
          delay: 5000,
          disableOnInteraction: false
        },
        pagination: {
          el: '.swiper-pagination',
          clickable: true
        },
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev'
        },
        breakpoints: {
          640: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 }
        }
      });
    }
  }
}
