import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Job } from '../../models/job.model';
import { CommonModule } from '@angular/common';
// import { EventEmitter } from 'stream';

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './job-list.component.html',
  styleUrl: './job-list.component.scss'
})
export class JobListComponent {
  @Input() jobs: Job[] = [];
  @Output() selectJob = new EventEmitter<Job>();
}
