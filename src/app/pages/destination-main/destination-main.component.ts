import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
  Inject,
  PLATFORM_ID,
  Input
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import  { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { SafeUrlPipe } from '../../common/pipes/safe-url.pipe';
import { DestinationService } from '../../services/destination/destination.service';
import { Destination } from '../../models/destination.model';
import Swiper from 'swiper';
import { FooterComponent } from "../../common/footer/footer.component";
import { NavbarComponent } from "../../common/navbar/navbar.component";
import { VideoDialogComponent } from '../../common/video-dialog/video-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ChatWidgetComponent } from "../../components/chat-widget/chat-widget.component";

@Component({
  selector: 'app-destination-main',
  standalone: true,
  imports: [CommonModule, RouterModule, SafeUrlPipe, FooterComponent, NavbarComponent, ChatWidgetComponent],
  templateUrl: './destination-main.component.html',
  styleUrls: ['./destination-main.component.scss']
})
export class DestinationMainComponent implements OnInit{
  destination: Destination | null = null;
    // @Input() destination: any = {};
 @ViewChild('locationsWrapper') locationsWrapper!: ElementRef;
  // One Swiper instance per section
  @ViewChild('packagesSwiper') packagesSwiper!: ElementRef;
  @ViewChild('attractionsSwiper') attractionsSwiper!: ElementRef;
  @ViewChild('cultureSwiper') cultureSwiper!: ElementRef;
  @ViewChild('cuisineSwiper') cuisineSwiper!: ElementRef;
  @ViewChild('activitiesSwiper') activitiesSwiper!: ElementRef;

  // private swipers: Swiper[] = [];
 currentSlide = 0;
  
  // Touch/Swipe properties
  private startX = 0;
  private currentX = 0;
  private isDragging = false;
  private startTime = 0;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private destSvc: DestinationService,
    public dialog: MatDialog,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

openVideoDialog(videoUrl: string): void {
    if (videoUrl) {
      this.dialog.open(VideoDialogComponent, {
        width: '80%',
        data: { videoUrl }
      });
    }
  }
  ngOnInit(): void {
    const titleParam = this.route.snapshot.paramMap.get('title');
  if (!titleParam) {
    this.router.navigateByUrl('/');
    return;
  }
    this.destSvc.getDestinationByTitle(titleParam).subscribe({
      next: dest => {
        this.destination = dest;
        // Once data is bound, initialize each Swiper
        if (isPlatformBrowser(this.platformId)) {
          setTimeout(() => {
            this.initSwiper(this.packagesSwiper);
            this.initSwiper(this.attractionsSwiper);
            this.initSwiper(this.cultureSwiper);
            this.initSwiper(this.cuisineSwiper);
            this.initSwiper(this.activitiesSwiper);
          }, 0);
        }
      },
      error: () => {
        this.router.navigateByUrl('/');
      }
    });
  }

    private initSwiper(elRef: ElementRef): void {
    if (!elRef?.nativeElement) return;
    new Swiper(elRef.nativeElement, {
      modules: [Navigation, Pagination, Autoplay],
      slidesPerView: 1,
      spaceBetween: 30,
      loop: true,
      centeredSlides: true,
      autoplay: { delay: 5000, disableOnInteraction: false },
      pagination: { el: '.swiper-pagination', clickable: true },
      navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
      breakpoints: {
        640:  { slidesPerView: 1, spaceBetween: 20 },
        768:  { slidesPerView: 2, spaceBetween: 30 },
        1024: { slidesPerView: 3, spaceBetween: 40 }
      }
    });
  }


   onTouchStart(event: TouchEvent): void {
    this.startX = event.touches[0].clientX;
    this.currentX = this.startX;
    this.isDragging = true;
    this.startTime = Date.now();
    
    if (this.locationsWrapper) {
      this.locationsWrapper.nativeElement.classList.add('dragging');
    }
  }

  onTouchMove(event: TouchEvent): void {
    if (!this.isDragging) return;
    
    event.preventDefault();
    this.currentX = event.touches[0].clientX;
    
    const diff = this.currentX - this.startX;
    const translateX = -this.currentSlide * 100 + (diff / window.innerWidth) * 100;
    
    if (this.locationsWrapper) {
      this.locationsWrapper.nativeElement.style.transform = `translateX(${translateX}%)`;
    }
  }

  onTouchEnd(event: TouchEvent): void {
    if (!this.isDragging) return;
    
    this.isDragging = false;
    const endTime = Date.now();
    const timeDiff = endTime - this.startTime;
    const distance = this.currentX - this.startX;
    const velocity = Math.abs(distance) / timeDiff;
    
    if (this.locationsWrapper) {
      this.locationsWrapper.nativeElement.classList.remove('dragging');
    }
    
    // Determine if swipe should trigger slide change
    const threshold = window.innerWidth * 0.25; // 25% of screen width
    const velocityThreshold = 0.5; // pixels per millisecond
    
    if (Math.abs(distance) > threshold || velocity > velocityThreshold) {
      if (distance > 0 && this.currentSlide > 0) {
        // Swipe right - go to previous slide
        this.goToSlide(this.currentSlide - 1);
      } else if (distance < 0 && this.currentSlide < this.destination!.locations.length - 1) {
        // Swipe left - go to next slide
        this.goToSlide(this.currentSlide + 1);
      } else {
        // Snap back to current slide
        this.goToSlide(this.currentSlide);
      }
    } else {
      // Snap back to current slide
      this.goToSlide(this.currentSlide);
    }
  }

  // Navigate to specific slide
  goToSlide(index: number): void {
    if (index >= 0 && index < this.destination!.locations.length) {
      this.currentSlide = index;
      
      if (this.locationsWrapper) {
        this.locationsWrapper.nativeElement.style.transform = `translateX(-${this.currentSlide * 100}%)`;
      }
    }
  }

  // Navigate to next slide
  nextSlide(): void {
    if (this.currentSlide < this.destination!.locations.length - 1) {
      this.goToSlide(this.currentSlide + 1);
    }
  }

  // Navigate to previous slide
  previousSlide(): void {
    if (this.currentSlide > 0) {
      this.goToSlide(this.currentSlide - 1);
    }
  }

  // Handle explore location button click
  exploreLocation(location: any): void {
    // Add any additional logic here before navigation
    console.log('Exploring location:', location.name);
  }

  // Auto-slide functionality (optional)
  private autoSlideInterval: any;

  startAutoSlide(intervalMs: number = 5000): void {
    this.stopAutoSlide();
    this.autoSlideInterval = setInterval(() => {
      if (this.currentSlide < this.destination!.locations.length - 1) {
        this.nextSlide();
      } else {
        this.goToSlide(0); // Loop back to first slide
      }
    }, intervalMs);
  }

  stopAutoSlide(): void {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
      this.autoSlideInterval = null;
    }
  }

  ngOnDestroy(): void {
      this.stopAutoSlide();
  }
}
