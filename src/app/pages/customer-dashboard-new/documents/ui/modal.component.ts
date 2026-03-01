import { Component, EventEmitter, HostListener, Input, Output } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-modal",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="open" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        class="fixed inset-0 bg-black/70 backdrop-blur-sm"
        (click)="requestClose()"
      ></div>

      <div
        class="relative w-full overflow-hidden rounded-xl bg-[#121212] border border-white/10 shadow-2xl"
        [class.max-w-xl]="maxWidth === 'xl'"
        [class.max-w-4xl]="maxWidth === '4xl'"
      >
        <div *ngIf="title" class="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 class="text-lg font-semibold text-white">{{ title }}</h2>
          <button
            type="button"
            class="h-10 w-10 rounded-lg hover:bg-white/5 text-white/80 hover:text-white grid place-items-center"
            (click)="requestClose()"
            [disabled]="disableClose"
          >
            ✕
          </button>
        </div>

        <button
          *ngIf="!title"
          type="button"
          class="absolute right-4 top-4 z-10 h-10 w-10 rounded-lg bg-black/20 hover:bg-black/40 text-white/80 hover:text-white grid place-items-center"
          (click)="requestClose()"
          [disabled]="disableClose"
        >
          ✕
        </button>

        <div class="p-6">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
})
export class ModalComponent {
  @Input() open = false;
  @Input() title?: string;
  @Input() maxWidth: "xl" | "4xl" = "xl";
  @Input() disableClose = false;

  @Output() close = new EventEmitter<void>();

  @HostListener("document:keydown.escape")
  onEsc() {
    this.requestClose();
  }

  requestClose() {
    if (this.open && !this.disableClose) this.close.emit();
  }
}