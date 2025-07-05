import { Component, Input } from '@angular/core';
import { Job } from '../../models/job.model';
import { CommonModule } from '@angular/common';
import { ApplyFormComponent } from "../apply-form/apply-form.component";

@Component({
  selector: 'app-job-details',
  standalone: true,
  imports: [CommonModule, ApplyFormComponent],
  templateUrl: './job-details.component.html',
  styleUrl: './job-details.component.scss'
})
export class JobDetailsComponent {
@Input() job!: Job;
  showForm = false;
  onApply() { this.showForm = true; }
}
