import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import {
  NewsletterService,
  NewsletterSubscriber
} from '../../services/newsletter/newsletter.service';

@Component({
  selector: 'app-newsletter-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './newsletter-admin.component.html',
  styleUrls: ['./newsletter-admin.component.scss']
})
export class NewsletterAdminComponent implements OnInit {
  subscribers: NewsletterSubscriber[] = [];
  filteredSubscribers: NewsletterSubscriber[] = [];
  loading = false;
  error = '';
  statusFilter: string = 'all';

  // add/edit modal state
  showModal = false;
  isEditMode = false;
  editingSubscriber: NewsletterSubscriber | null = null;

  modalForm = {
    email: '',
    name: '',
    status: 'active' as 'active' | 'unsubscribed' | 'bounced' | 'spam',
    is_verified: 0 as 0 | 1
  };

  constructor(private newsletterService: NewsletterService) {}

  ngOnInit(): void {
    this.loadSubscribers();
  }

  loadSubscribers() {
    this.loading = true;
    this.error = '';

    this.newsletterService.getSubscribers().subscribe({
      next: (subs) => {
        this.loading = false;
        this.subscribers = subs;
        this.applyFilter();
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Failed to load subscribers.';
        console.error('Newsletter admin load error:', err);
      }
    });
  }

  applyFilter() {
    if (this.statusFilter === 'all') {
      this.filteredSubscribers = this.subscribers;
    } else {
      this.filteredSubscribers = this.subscribers.filter(
        (s) => s.status === this.statusFilter
      );
    }
  }

  // --- status quick change from table (no modal) ---
  onStatusChange(sub: NewsletterSubscriber, newStatus: string) {
    this.newsletterService
      .updateSubscriber(sub.id, { status: newStatus as any })
      .subscribe({
        next: () => {
          sub.status = newStatus as any;
        },
        error: (err) => {
          console.error('Failed to update subscriber status:', err);
          this.error = 'Failed to update status.';
        }
      });
  }

  delete(sub: NewsletterSubscriber) {
    if (!confirm(`Delete subscriber ${sub.email}?`)) return;

    this.newsletterService.deleteSubscriber(sub.id).subscribe({
      next: () => {
        this.subscribers = this.subscribers.filter((s) => s.id !== sub.id);
        this.applyFilter();
      },
      error: (err) => {
        console.error('Failed to delete subscriber:', err);
        this.error = 'Failed to delete subscriber.';
      }
    });
  }

  // ---------- ADD / EDIT MODAL ----------

  openAddModal() {
    this.isEditMode = false;
    this.editingSubscriber = null;
    this.modalForm = {
      email: '',
      name: '',
      status: 'active',
      is_verified: 0
    };
    this.showModal = true;
  }

  openEditModal(sub: NewsletterSubscriber) {
    this.isEditMode = true;
    this.editingSubscriber = sub;
    this.modalForm = {
      email: sub.email,
      name: sub.name || '',
      status: sub.status,
      is_verified: sub.is_verified
    };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveSubscriber(form: NgForm) {
    if (form.invalid) return;

    if (this.isEditMode && this.editingSubscriber) {
      // EDIT
      const id = this.editingSubscriber.id;
      this.newsletterService
        .updateSubscriber(id, {
          name: this.modalForm.name,
          status: this.modalForm.status,
          is_verified: this.modalForm.is_verified
        })
        .subscribe({
          next: (res: any) => {
            // update local list
            const idx = this.subscribers.findIndex((s) => s.id === id);
            if (idx !== -1) {
              this.subscribers[idx] = {
                ...this.subscribers[idx],
                name: this.modalForm.name,
                status: this.modalForm.status,
                is_verified: this.modalForm.is_verified
              };
              this.applyFilter();
            }
            this.closeModal();
          },
          error: (err) => {
            console.error('Failed to update subscriber:', err);
            this.error = 'Failed to update subscriber.';
          }
        });
    } else {
      // ADD
      this.newsletterService
        .subscribe(this.modalForm.email, this.modalForm.name)
        .subscribe({
          next: (res: any) => {
            // backend returns { message, subscriber }
            if (res?.subscriber) {
              this.subscribers.unshift(res.subscriber);
              this.applyFilter();
            } else {
              // if not, reload all
              this.loadSubscribers();
            }
            this.closeModal();
          },
          error: (err) => {
            console.error('Failed to add subscriber:', err);
            this.error =
              err?.error?.message || 'Failed to add subscriber.';
          }
        });
    }
  }
}
