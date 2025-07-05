import { Component } from '@angular/core';
import { NavbarComponent } from "../../common/navbar/navbar.component";
import { AboutComponent } from "../../components/about/about.component";
import { FooterComponent } from "../../common/footer/footer.component";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatWidgetComponent } from "../../components/chat-widget/chat-widget.component";

@Component({
  selector: 'app-travel-guide',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, CommonModule, FormsModule, ChatWidgetComponent],
  templateUrl: './travel-guide.component.html',
  styleUrl: './travel-guide.component.scss'
})
export class TravelGuideComponent {
  featuredDestinations = [
    {
      id: 1,
      name: 'Bali, Indonesia',
      description: 'Tropical paradise with stunning beaches, vibrant culture, and spiritual retreats.',
      image: 'assets/images/destinations/bali.webp',
      tag: 'Popular',
      rating: 4.8,
      duration: '7-10 days'
    },
    {
      id: 2,
      name: 'Maldives',
      description: 'Crystal clear waters, overwater villas, and pristine white sand beaches.',
      image: 'assets/images/destinations/maldives.webp',
      tag: 'Luxury',
      rating: 4.9,
      duration: '5-7 days'
    },
    {
      id: 3,
      name: 'Switzerland',
      description: 'Alpine scenery, charming villages, and world-class skiing adventures.',
      image: 'assets/images/destinations/switzerland.webp',
      tag: 'Family',
      rating: 4.7,
      duration: '7-14 days'
    },
    {
      id: 4,
      name: 'Thailand',
      description: 'Vibrant street life, ancient temples, and beautiful tropical islands.',
      image: 'assets/images/destinations/thailand.webp',
      tag: 'Budget',
      rating: 4.6,
      duration: '10-15 days'
    },
    {
      id: 5,
      name: 'Japan',
      description: 'Ancient traditions, futuristic cities, and stunning natural landscapes.',
      image: 'assets/images/destinations/japan.webp',
      tag: 'Culture',
      rating: 4.8,
      duration: '10-14 days'
    },
    {
      id: 6,
      name: 'Egypt',
      description: 'Ancient pyramids, majestic temples, and Nile River cruises.',
      image: 'assets/images/destinations/egypt.webp',
      tag: 'Historic',
      rating: 4.7,
      duration: '7-12 days'
    }
  ];

  travelTips = [
    {
      id: 1,
      title: 'How to Pack Light for 2-Week Trips',
      summary: 'Learn the art of efficient packing with these pro tips that will save space and stress...',
      image: 'assets/images/tips/packing.webp',
      date: 'May 5, 2025',
      readTime: '5 min read',
      url: '/travel-tips/packing-light'
    },
    {
      id: 2,
      title: 'Visa-free Countries for Indian Travelers',
      summary: 'Discover beautiful destinations where Indian passport holders can travel without visa hassles...',
      image: 'assets/images/tips/visa-free.webp',
      date: 'April 28, 2025',
      readTime: '7 min read',
      url: '/travel-tips/visa-free-countries'
    },
    {
      id: 3,
      title: 'Budget Travel Guide for Southeast Asia',
      summary: 'Explore the beauty of Southeast Asia without breaking the bank with these practical tips...',
      image: 'assets/images/tips/budget-travel.webp',
      date: 'April 15, 2025',
      readTime: '8 min read',
      url: '/travel-tips/budget-southeast-asia'
    },
    {
      id: 4,
      title: 'Travel Photography Tips for Beginners',
      summary: 'Capture stunning vacation memories with these simple photography techniques...',
      image: 'assets/images/tips/photography.webp',
      date: 'April 8, 2025',
      readTime: '6 min read',
      url: '/travel-tips/photography-basics'
    }
  ];

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

  popularTags = [
    'Beach Vacations', 'Adventure Travel', 'Family Trips', 'Luxury Retreats', 
    'Budget Travel', 'Honeymoon', 'Group Tours', 'Cultural Experiences', 
    'Wildlife Safari', 'Road Trips'
  ];

  searchQuery: string = '';
  emailSubscribe: string = '';

  constructor() { }

  ngOnInit(): void {
    // Initialize any components or fetch data if needed
  }

  toggleFaq(faq: any): void {
    // Close all other FAQs
    this.faqs.forEach(item => {
      if (item !== faq) {
        item.isOpen = false;
      }
    });
    
    // Toggle the selected FAQ
    faq.isOpen = !faq.isOpen;
  }

  searchDestinations(): void {
    console.log('Searching for:', this.searchQuery);
    // Implement search functionality
    // This would typically call a service to fetch filtered results
  }

  subscribeNewsletter(): void {
    if (this.validateEmail(this.emailSubscribe)) {
      console.log('Subscribing email:', this.emailSubscribe);
      // Implement newsletter subscription
      // This would typically call a service to handle the subscription
      this.emailSubscribe = '';
      alert('Thank you for subscribing to our newsletter!');
    } else {
      alert('Please enter a valid email address.');
    }
  }

  validateEmail(email: string): boolean {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  }

  exploreDestination(destination: any): void {
    console.log('Exploring destination:', destination.name);
    // Navigate to the destination detail page
    // This would typically use the Router to navigate
  }

  readArticle(article: any): void {
    console.log('Reading article:', article.title);
    // Navigate to the article detail page
    // This would typically use the Router to navigate
  }

  searchByTag(tag: string): void {
    console.log('Searching by tag:', tag);
    this.searchQuery = tag;
    this.searchDestinations();
  }

  planTrip(): void {
    console.log('Planning a trip');
    // Navigate to the trip planning page
    // This would typically use the Router to navigate
  }
}
