import { Component } from '@angular/core';
import { HeaderComponent } from "../../common/header/header.component";
import { TestimonialsComponent } from "../../components/testimonials/testimonials.component";
import { FooterComponent } from "../../common/footer/footer.component";

@Component({
  selector: 'app-testimonial',
  standalone: true,
  imports: [TestimonialsComponent, HeaderComponent, FooterComponent],
  templateUrl: './testimonials.component.html',
  styleUrl: './testimonials.component.scss'
})
export class TestimonialComponent {
  
}
