import { isPlatformBrowser } from '@angular/common';
import { Component, AfterViewInit, Input, PLATFORM_ID, Inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';


@Component({
  selector: 'app-pano-viewer',
  standalone: true,
  imports: [],
  //  template: `<div id="viewer" style="width: 100%; height: 500px;"></div>`,
  templateUrl: './pano-viewer.component.html',
  styleUrl: './pano-viewer.component.scss'
  //  template: `
  //   <div class="pano-iframe-wrapper">
  //     <iframe [src]="embedUrl" frameborder="0" allowfullscreen></iframe>
  //   </div>
  // `,
  // styles: [`
  //   .pano-iframe-wrapper iframe {
  //     width: 100%;
  //     height: 500px;
  //     border: none;
  //     border-radius: 12px;
  //   }
  // `]
})
export class PanoViewerComponent implements AfterViewInit  {
   @Input() embedUrl: string = '';
// get embedUrl() {
//     return this.url ? this.sanitizeUrl(this.url) : '';
//   }

  sanitizeUrl(url: string) {
    return url;
  }
  @Input() imagePath: string = '';
constructor(@Inject(PLATFORM_ID) private platformId: Object,private sanitizer: DomSanitizer) {}
 getSafeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
  ngAfterViewInit(): void {
    // if (isPlatformBrowser(this.platformId)) {
    //   new PhotoSphereViewer.Viewer({
    //     container: document.getElementById('viewer')!,
    //     panorama: this.imagePath,
    //      loadingImg: 'assets/loading.gif', //
    //     navbar: ['zoom', 'fullscreen'],
    //   });
    // }
  }
}
