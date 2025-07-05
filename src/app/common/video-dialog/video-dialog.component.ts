import { Component, Inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { SafeUrlPipe } from '../pipes/safe-url.pipe';
@Component({
  selector: 'app-video-dialog',
  standalone: true,
  imports: [CommonModule,SafeUrlPipe,  MatDialogModule],
  templateUrl: './video-dialog.component.html',
  styleUrl: './video-dialog.component.scss'
})
export class VideoDialogComponent {
constructor(
    public dialogRef: MatDialogRef<VideoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { videoUrl: string },
    private sanitizer: DomSanitizer
  ) {}

  isYouTubeUrl(url: string): boolean {
    return url.includes('youtu.be') || url.includes('youtube.com');
  }

  getYouTubeEmbedUrl(videoUrl: string): string {
    let videoId: string | undefined;
    if (videoUrl.includes('v=')) {
      videoId = videoUrl.split('v=')[1]?.split('&')[0];
    } else {
      videoId = videoUrl.split('/').pop();
    }
    return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  }
}