import { Component } from '@angular/core';
import {
  HostListener
} from '@angular/core';
import {
  trigger, transition, style, animate
} from '@angular/animations';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
  animations: [
     // staggered title animations
     trigger('flipY',   [ transition(':enter', [ /* … */ ]) ]),
     trigger('slideUp',[ transition(':enter', [ /* … */ ]) ]),
     trigger('fadeIn', [ transition(':enter', [ /* … */ ]) ]),
     // diamond pulse
     trigger('diamondAnimation', [ transition(':enter', [ /* … */ ]) ])
   ]
})
export class HeroComponent {
  @HostListener('window:scroll') onWindowScroll() {
    const s = window.pageYOffset;
    (document.querySelector('.layer.bg') as any).style.transform      = `translateY(${s * 0.2}px)`;
    (document.querySelector('.layer.mid') as any).style.transform     = `translateY(${s * 0.5}px)`;
    (document.querySelector('.layer.overlay') as any).style.transform = `translateY(${s * 0.8}px)`;
  }

  cards = [
    { img: 'https://images.unsplash.com/photo-1541666282672-5f4aad922c63?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', title: 'Kelingking Beach', location: 'Penida' },
    { img: 'https://images.unsplash.com/photo-1580100586938-02822d99c4a8?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',  title: 'Broken Beach',   location: 'Penida' },
    /* …etc… */
  ];
  current = 0;
  prev() { this.current = (this.current + this.cards.length - 1) % this.cards.length; }
  next() { this.current = (this.current + 1) % this.cards.length; }
}
