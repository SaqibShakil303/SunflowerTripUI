import { Directive, ElementRef, OnInit, Renderer2, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appAnimation]',
  standalone: true
})
export class AnimationDirective implements OnInit {
  private platformId = inject(PLATFORM_ID);

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Add the '_anim-items' and '_anim-no-hide' classes for consistency with original
      this.renderer.addClass(this.el.nativeElement, '_anim-items');
      this.renderer.addClass(this.el.nativeElement, '_anim-no-hide');
      
      // Initialize animation with a small delay to ensure DOM is ready
      setTimeout(() => {
        this.initAnimation();
      }, 100);
    }
  }

  private initAnimation(): void {
    if (typeof IntersectionObserver !== 'undefined') {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              this.renderer.addClass(entry.target, '_active');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1 }
      );

      observer.observe(this.el.nativeElement);
    } else {
      // Fallback for browsers without IntersectionObserver
      this.renderer.addClass(this.el.nativeElement, '_active');
    }
  }
}