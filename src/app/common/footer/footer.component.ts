import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  animations: [
    trigger('collapseAnimation', [
      state('open', style({
        height: '*',
        opacity: 1,
        visibility: 'visible'
      })),
      state('closed', style({
        height: '0',
        opacity: 0,
        visibility: 'hidden'
      })),
      transition('closed <=> open', [
        animate('0.3s ease-in-out')
      ])
    ])
  ]
})
export class FooterComponent {
  currentYear: number = new Date().getFullYear();
  isMoreOpen: boolean = false;

  toggleMore() {
    this.isMoreOpen = !this.isMoreOpen;
  }
}