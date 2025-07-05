import { Component, AfterViewInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import AOS from 'aos';

@Component({
  selector: 'app-top-picks',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './top-picks.component.html',
  styleUrls: ['./top-picks.component.scss']
})
export class TopPicksComponent implements AfterViewInit {
  topPicks = [
    // {
    //   title: 'Darjeeling',
    //   description: 'Escape to the Queen of Hills, known for its tea gardens and stunning Himalayan views.',
    //   image: 'https://images.pexels.com/photos/3467160/pexels-photo-3467160.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    // },
    {
      title: 'Bangkok, Thailand',
      description: 'A vibrant city with temples, markets, and nightlife, accessible via direct flights from Kolkata.',
      image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmFuZ2tva3xlbnwwfHwwfHx8MA%3D%3D'
    },
    {
      title: 'Andaman Islands',
      description: 'Relax on pristine beaches and dive into crystal-clear waters, just a flight from Kolkata.',
      image: 'https://plus.unsplash.com/premium_photo-1670002461190-1499b36e8494?q=80&w=1492&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    },
    {
      title: 'Bhutan',
      description: 'Discover the Land of the Thunder Dragon with its monasteries and scenic valleys, easily reachable from Kolkata.',
      image: 'https://images.unsplash.com/photo-1617469165786-8007eda3caa7?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGJodXRhbnxlbnwwfHwwfHx8MA%3D%3D'
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