// src/app/components/location-image-viewer/location-image-viewer.component.ts
import { Component, Inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { LocationService } from '../../services/location/location.service';
import { finalize } from 'rxjs/operators';

type ViewerData = { id: number; name?: string };

@Component({
  selector: 'app-location-image-viewer',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  template: `
  <div class="viewer">
    <div class="viewer-toolbar">
      <div class="title">{{ data.name || 'Location Image' }}</div>
      <div class="spacer"></div>
      <button class="btn" (click)="reset()">Reset</button>
      <button class="btn" (click)="zoomIn()">+</button>
      <button class="btn" (click)="zoomOut()">−</button>
      <button class="btn close" (click)="close()">×</button>
    </div>

    <div class="viewer-canvas"
         (wheel)="onWheel($event)"
         (mousedown)="onPointerDown($event)"
         (mousemove)="onPointerMove($event)"
         (mouseup)="onPointerUp()"
         (mouseleave)="onPointerUp()"
         (touchstart)="onTouchStart($event)"
         (touchmove)="onTouchMove($event)"
         (touchend)="onTouchEnd()"
         (dblclick)="reset()"
         [class.loading]="loading">

      <div class="loader" *ngIf="loading">
        <i class="fas fa-spinner fa-spin"></i> Loading image...
      </div>

      <img *ngIf="imgUrl"
           [src]="imgUrl"
           [style.transform]="transform"
           [style.cursor]="dragging ? 'grabbing' : 'grab'"
           draggable="false"
           alt="Location image"/>
      <div class="error" *ngIf="error">{{ error }}</div>
    </div>
  </div>
  `,
  styles: [`
  .viewer { width: 90vw; height: 85vh; display: flex; flex-direction: column; background: #111; color: #fff; }
  .viewer-toolbar { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1rem; border-bottom: 1px solid #333; }
  .viewer-toolbar .title { font-weight: 600; }
  .viewer-toolbar .spacer { flex: 1; }
  .viewer-toolbar .btn { background: #222; color: #fff; border: 1px solid #333; padding: 0.4rem 0.75rem; border-radius: 6px; }
  .viewer-toolbar .btn.close { font-size: 1.2rem; line-height: 1; }
  .viewer-canvas { position: relative; flex: 1; overflow: hidden; touch-action: none; display: flex; align-items: center; justify-content: center; }
  .viewer-canvas.loading { background: #0f0f0f; }
  img { max-width: none; user-select: none; will-change: transform; }
  .loader { position: absolute; color: #ddd; }
  .error { color: #ffb3b3; }
  `]
})
export class LocationImageViewerComponent implements OnDestroy {
  imgUrl?: string;
  loading = true;
  error = '';

  // transform state
  scale = 0.5;
  minScale = 0.25;
  maxScale = 6;
  translateX = 0;
  translateY = 0;

  // drag state
  dragging = false;
  lastX = 0;
  lastY = 0;

  // pinch state
  lastDist?: number;

  get transform() {
    return `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale})`;
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ViewerData,
    private dialogRef: MatDialogRef<LocationImageViewerComponent>,
    private locationService: LocationService
  ) {
    this.locationService.getLocationImageUrl(data.id)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (url) => this.imgUrl = url,
        error: () => this.error = 'Failed to load image.'
      });
  }

  ngOnDestroy(): void {
    // you could revoke objectURL here if you don’t keep cache
    // if you do want to revoke: URL.revokeObjectURL(this.imgUrl!)
  }

  close() { this.dialogRef.close(); }

  reset() {
    this.scale = 1;
    this.translateX = 0;
    this.translateY = 0;
  }

  zoomIn()  { this.scale = Math.min(this.maxScale, this.scale * 1.2); }
  zoomOut() { this.scale = Math.max(this.minScale, this.scale / 1.2); }

  onWheel(e: WheelEvent) {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 1.1 : 0.9;
    const newScale = Math.min(this.maxScale, Math.max(this.minScale, this.scale * delta));

    // zoom towards cursor
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const cx = e.clientX - rect.left - rect.width / 2;
    const cy = e.clientY - rect.top - rect.height / 2;

    this.translateX = (this.translateX - cx) * (newScale / this.scale) + cx;
    this.translateY = (this.translateY - cy) * (newScale / this.scale) + cy;

    this.scale = newScale;
  }

  onPointerDown(e: MouseEvent) {
    e.preventDefault();
    this.dragging = true;
    this.lastX = e.clientX;
    this.lastY = e.clientY;
  }
  onPointerMove(e: MouseEvent) {
    if (!this.dragging) return;
    const dx = e.clientX - this.lastX;
    const dy = e.clientY - this.lastY;
    this.translateX += dx;
    this.translateY += dy;
    this.lastX = e.clientX;
    this.lastY = e.clientY;
  }
  onPointerUp() { this.dragging = false; }

  // touch (pinch & pan)
  onTouchStart(e: TouchEvent) {
    if (e.touches.length === 2) {
      this.lastDist = this.distance(e.touches[0], e.touches[1]);
    } else if (e.touches.length === 1) {
      this.dragging = true;
      this.lastX = e.touches[0].clientX;
      this.lastY = e.touches[0].clientY;
    }
  }
  onTouchMove(e: TouchEvent) {
    if (e.touches.length === 2 && this.lastDist) {
      const dist = this.distance(e.touches[0], e.touches[1]);
      const factor = dist / this.lastDist;
      const newScale = Math.min(this.maxScale, Math.max(this.minScale, this.scale * factor));
      this.scale = newScale;
      this.lastDist = dist;
    } else if (e.touches.length === 1 && this.dragging) {
      const dx = e.touches[0].clientX - this.lastX;
      const dy = e.touches[0].clientY - this.lastY;
      this.translateX += dx;
      this.translateY += dy;
      this.lastX = e.touches[0].clientX;
      this.lastY = e.touches[0].clientY;
    }
  }
  onTouchEnd() {
    this.dragging = false;
    this.lastDist = undefined;
  }
  private distance(a: Touch, b: Touch) {
    const dx = a.clientX - b.clientX, dy = a.clientY - b.clientY;
    return Math.hypot(dx, dy);
  }
}
