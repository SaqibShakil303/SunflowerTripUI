import { Component, ViewChild, ElementRef, AfterViewInit, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { TestimonialsComponent } from "../../components/testimonials/testimonials.component";
import { WhyUsComponent } from "../../components/why-us/why-us.component";
import { NavbarComponent } from "../../common/navbar/navbar.component";
import { FooterComponent } from "../../common/footer/footer.component";
import Swiper from 'swiper';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import AOS from 'aos';
import { ChatWidgetComponent } from "../../components/chat-widget/chat-widget.component";

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TestimonialsComponent,
    WhyUsComponent,
    NavbarComponent,
    FooterComponent,
    ChatWidgetComponent
],
  templateUrl: './about-us.component.html',
  styleUrl: './about-us.component.scss',
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
export class AboutUsComponent implements OnInit, AfterViewInit {
  @ViewChild('teamSwiperContainer') teamSwiperContainer!: ElementRef;
  
  teamMembers = [
    {
      name: 'Banti Haque',
      position: 'Founder & CEO',
      bio: 'With over 15 years of experience in the travel industry, Haque brings passion and expertise to every journey we plan.',
      image: 'assets/images/team/team-1.jpg'
    },
    {
      name: 'Arijit Banerjee',
      position: 'Marketing Director',
      bio: 'Arijit specializes in curating unique cultural experiences and off-the-beaten-path adventures for our clients.',
      image: 'assets/images/team/team-2.jpg'
    },
    {
      name: 'Shaswati Das',
      position: 'Destination Expert',
      bio: 'Having traveled to over 40 countries, Shaswati ensures our itineraries capture the true essence of each destination.',
      image: 'assets/images/team/team-3.jpg'
    },
    {
      name: 'Smaran Paul',
      position: 'Customer Relations',
      bio: `Smaran is dedicated to providing exceptional service and ensuring every client's needs are met with care.`,
      image: 'assets/images/team/SHARAN_DP.jpg'
    }
  ];

  private teamSwiper!: Swiper;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initAOS();
    }
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Delay Swiper initialization to ensure DOM is ready
      setTimeout(() => this.initTeamSwiper(), 0);
    }
  }

  private initAOS(): void {
    AOS.init({
      duration: 800,
      once: true,
      offset: 100,
      easing: 'ease-in-out'
    });
  }

  private initTeamSwiper(): void {
    if (this.teamSwiperContainer && this.teamSwiperContainer.nativeElement) {
      this.teamSwiper = new Swiper(this.teamSwiperContainer.nativeElement, {
        modules: [Navigation, Pagination, Autoplay],
        slidesPerView: 1,
        spaceBetween: 30,
        loop: true,
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
            spaceBetween: 30
          }
        }
      });
    } else {
      console.error('Team Swiper container not found or DOM not ready');
    }
  }
}
