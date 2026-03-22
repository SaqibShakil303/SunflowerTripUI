import { Component, ElementRef, QueryList, Renderer2, signal, ViewChildren } from '@angular/core';
import {
  trigger, transition, style, animate, query, stagger
} from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Faq, FaqService } from '../../services/faq/faq.service';

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
  @ViewChildren('faqQuestion') faqQuestions!: QueryList<ElementRef>;
 faqs = signal<Faq[]>([])
  constructor(private renderer: Renderer2, private elRef: ElementRef, private faqService: FaqService) {}

  ngOnInit() {
    this.faqService.getAllFaqs().subscribe({
      next: (data: any) => {
        const newData = data.data?.map((faq: Faq) => {
          return { ...faq, isOpen: false };
        });
        this.faqs.set(newData);
        console.log(newData);
      },
      error: (err) => console.log('Error while fetching all faqs', err),
      complete: () => console.log('all faqs fetched successfully'),
    });
  }

  // ngAfterViewInit() {
  //   // apply animations
  //   const observer = new IntersectionObserver(
  //     (entries) => {
  //       entries.forEach((entry) => {
  //         entry.isIntersecting ? entry.target.classList.add('visible') : null;
  //       });
  //     },
  //     { threshold: 0.2, rootMargin: '0px 0px -50px 0px' }
  //   );

  //   this.faqQuestions.changes.subscribe(() => {
  //     this.faqQuestions.forEach((item) => observer.observe(item.nativeElement));
  //   });

  //   // initial render
  //   this.faqQuestions.forEach((item) => observer.observe(item.nativeElement));
  // }

 toggleFaq(clickedItem: any): void {
  this.faqs().forEach(item => {
    item.isOpen = (item === clickedItem) ? !item.isOpen : false;
  });
}

}
