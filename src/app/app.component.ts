import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { FooterComponent } from './common/footer/footer.component';
import { HomeComponent } from './pages/home/home.component';
import { HeaderComponent } from './common/header/header.component';
import { AboutComponent } from './components/about/about.component';
import { ChatWidgetComponent } from './components/chat-widget/chat-widget.component';
import { BookingInquiryComponent } from "./pages/booking-inquiry/booking-inquiry.component";
import { DestinationMainComponent } from "./pages/destination-main/destination-main.component";
import { TourPackageComponent } from "./pages/tour-package/tour-package.component";


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  // [RouterOutlet,HeroComponent,NavbarComponent,ServicesComponent,ReviewsComponent,ContactComponent,AboutComponent,GalleryComponent,FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'sunflowertrip';
}

