import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, inject, PLATFORM_ID } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-group-brochure',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './group-brochure.component.html',
  styleUrl: './group-brochure.component.scss'
})
export class GroupBrochureComponent {
 private sanitizer = inject(DomSanitizer);
  private platformId = inject(PLATFORM_ID);

  // Path to your PDF in assets folder
    pdfSrc = 'assets/marketing-brochure-sunflowertrip.pdf';
  safePdfSrc!: SafeResourceUrl;

  // Toggle PDF viewer
  isPdfVisible = false;


  ngOnInit() {
    this.safePdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(this.pdfSrc);
    // Trigger download only in browser environment
    if (isPlatformBrowser(this.platformId)) {
      this.triggerPdfDownload();
    }
  }

  // Method to trigger automatic PDF download
  private triggerPdfDownload() {
    const link = document.createElement('a');
    link.href = this.pdfSrc;
    link.download = 'travel-portfolio-sunflower-trip.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  viewBrochure() {
    this.isPdfVisible = true;
  }

  closeViewer() {
    this.isPdfVisible = false;
  }
}
