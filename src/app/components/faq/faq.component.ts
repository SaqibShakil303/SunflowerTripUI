import { Component, ElementRef, Renderer2 } from '@angular/core';
import {
  trigger, transition, style, animate, query, stagger
} from '@angular/animations';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports:[CommonModule],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss',
  animations: [
    // fade+up on the header
    trigger('headerAnim', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('800ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),

    // stagger in the FAQ items from left
    trigger('listStagger', [
      transition(':enter', [
        query('.faq-item', [
          style({ opacity: 0, transform: 'translateX(-20px)' }),
          stagger(200, [
            animate('600ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
          ])
        ], { optional: true })
      ])
    ]),

    // fade in contact
    trigger('contactAnim', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('800ms 1s ease-out', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class FAQComponent {
 faqs = [
    {
      question: 'Can I customize my travel package?',
      answer: 'Yes, all our packages are fully customizable based on your preferences. Our travel experts will work with you to create a personalized itinerary that suits your interests, budget, and time constraints.',
      isOpen: false
    },
    {
      question: 'What is your cancellation policy?',
      answer: 'We offer flexible cancellation depending on the package and timeframe. Generally, cancellations made 30 days before departure receive a full refund, while cancellations between 15-29 days receive a 50% refund. Please check your specific package details for exact terms.',
      isOpen: false
    },
    {
      question: 'Do you arrange visa assistance?',
      answer: 'Yes, we provide comprehensive visa assistance including documentation guidance, application form filling, and appointment scheduling for most destinations. Our team keeps updated with the latest visa requirements to ensure a smooth process.',
      isOpen: false
    },
    {
      question: 'Is travel insurance included in your packages?',
      answer: 'Basic travel insurance is included in all our international packages. However, we recommend upgrading to our premium insurance options for extended coverage including higher medical benefits, trip cancellation protection, and coverage for adventure activities.',
      isOpen: false
    },
    {
      question: 'How many people are typically in a group tour?',
      answer: 'Our standard group tours typically have 8-16 participants to ensure personal attention and comfort. For specialized tours and expeditions, group sizes may vary. Private tours are also available for those seeking a more exclusive experience.',
      isOpen: false
    }
  ];
  constructor(private renderer: Renderer2, private elRef: ElementRef) {}

 toggleFaq(clickedItem: any): void {
  this.faqs.forEach(item => {
    item.isOpen = (item === clickedItem) ? !item.isOpen : false;
  });
}

}
