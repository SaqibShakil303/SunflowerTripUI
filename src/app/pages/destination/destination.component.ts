import { Component, OnInit, signal } from '@angular/core';
import { NavbarComponent } from '../../common/navbar/navbar.component';
import { FooterComponent } from '../../common/footer/footer.component';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SafeUrlPipe } from '../../common/pipes/safe-url.pipe';
import { DestinationService } from '../../services/destination/destination.service';
import { Destination } from '../../models/destination.model';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from "../../common/header/header.component";

@Component({
  selector: 'app-destination',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent, RouterModule, SafeUrlPipe, HeaderComponent],
  templateUrl: './destination.component.html',
  styleUrl: './destination.component.scss',
})
export class DestinationComponent implements OnInit {
  // default hero-image
  heroImage = '../pages/app/assets/Bali-Destination-Page/Banner.jpg';
  destination = signal<Destination | null>(null);
  isDestinationLoading = signal(true);
  isDestinationNotFound = signal(false);

  bestAttractionPreviewImage = signal<string | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private destSvc: DestinationService
  ) {}

  ngOnInit(): void {
    const titleParam = this.route.snapshot.paramMap.get('slug');
    if (!titleParam) {
      console.error('No title parameter provided, navigating to home.');
      this.router.navigateByUrl('/');
      return;
    }

    this.destSvc.getDestinationByTitle(titleParam).subscribe({
      next: (dest) => {
        console.log(
          'Destination data received:',
          JSON.stringify(dest, null, 2)
        );
        this.destination.set(dest);
        this.bestAttractionPreviewImage.set(dest.attractions[0].image_url);
      },
      error: (err) => {
        console.error('Error fetching destination:', err);
        console.error('Error details:', JSON.stringify(err, null, 2));
        this.isDestinationNotFound.set(true);
        this.router.navigateByUrl('/');
      },
      complete: () => {
        this.isDestinationLoading.set(false);
        console.log('Destination fetch completed.');
      },
    });
  }

  handleSelectableImgClick(url: string) {
    this.bestAttractionPreviewImage.set(url);
  }

  handleBookNow(slug: string) {
    this.router.navigateByUrl(`/tour/${slug}`);
  }
}
