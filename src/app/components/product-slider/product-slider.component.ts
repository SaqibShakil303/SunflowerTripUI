import { Component, AfterViewInit, OnInit, PLATFORM_ID, ElementRef, ViewChild, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';

declare var mixitup: any;
declare var $: any;

@Component({
  selector: 'app-product-slider',
  standalone: true,
  imports: [CommonModule,RouterLink,],
  templateUrl: './product-slider.component.html',
  styleUrl: './product-slider.component.scss'
})
export class ProductSliderComponent implements OnInit, AfterViewInit {
  // Use Inject decorator instead of inject function for Angular compatibility
  constructor(@Inject(PLATFORM_ID) private platformId: any) {}
  
  @ViewChild('infoSlider') infoSlider!: ElementRef;

  products = [
    {
      id: 1,
      name: 'Beach Resort',
      category: 'beach',
      image: '/assets/images/luxury/luxury-1.jpg',
      price: '$1999'
    },
    {
      id: 2,
      name: 'Mountain Retreat',
      category: 'mountain',
      image: '/assets/images/luxury/luxury-2.jpg',
      price: '$2499'
    },
    {
      id: 3,
      name: 'City Escape',
      category: 'city',
      image: '/assets/images/luxury/luxury-3.jpg',
      price: '$1599'
    },
    {
      id: 4,
      name: 'Safari Adventure',
      category: 'adventure',
      image: '/assets/images/luxury/luxury-4.jpg',
      price: '$3299'
    },
    {
      id: 5,
      name: 'Island Paradise',
      category: 'beach',
      image: '/assets/images/luxury/luxury-5.jpg',
      price: '$2799'
    },
    {
      id: 6,
      name: 'Cultural Tour',
      category: 'city',
      image: '/assets/images/luxury/luxury-1.jpg',
      price: '$1899'
    }
  ];

  filterCategories = [
    { name: 'All', value: 'all' },
    { name: 'Beach', value: 'beach' },
    { name: 'Mountain', value: 'mountain' },
    { name: 'City', value: 'city' },
    { name: 'Adventure', value: 'adventure' }
  ];

  ngOnInit(): void {
    // Only load scripts in browser environment
    if (isPlatformBrowser(this.platformId)) {
      this.loadScript('https://code.jquery.com/jquery-3.6.0.min.js');
      this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/mixitup/3.3.1/mixitup.min.js');
      this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.8.1/slick.min.js');
    }
  }

  ngAfterViewInit(): void {
    // Only initialize in browser environment
    if (isPlatformBrowser(this.platformId)) {
      // Initialize MixItUp and Slick after view init with a delay
      // to ensure scripts are loaded
      setTimeout(() => {
        this.initializeMixItUp();
        this.initializeSlickSlider();
      }, 1000);
    }
  }

  loadScript(url: string): void {
    // Only execute in browser environment
    if (isPlatformBrowser(this.platformId)) {
      const script = document.createElement('script');
      script.src = url;
      document.body.appendChild(script);
    }
  }

  initializeMixItUp(): void {
    if (isPlatformBrowser(this.platformId) && typeof mixitup !== 'undefined' && this.infoSlider) {
      const mixer = mixitup(this.infoSlider.nativeElement, {
        selectors: {
          target: '.product__item'
        },
        animation: {
          duration: 300
        }
      });
    }
  }

  initializeSlickSlider(): void {
    if (isPlatformBrowser(this.platformId) && typeof $ !== 'undefined' && this.infoSlider) {
      $(this.infoSlider.nativeElement).slick({
        slidesToShow: 3,
        slidesToScroll: 1,
        autoplay: false,
        arrows: true,
        responsive: [
          {
            breakpoint: 980,
            settings: {
              slidesToShow: 2
            }
          },
          {
            breakpoint: 660,
            settings: {
              slidesToShow: 1
            }
          }
        ]
      });
    }
  }

  filterProducts(category: string): void {
    // MixItUp handles the filtering
  }
}