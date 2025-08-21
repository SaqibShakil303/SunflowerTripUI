import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobModel } from '../../models/job.model';
import { JobService } from '../../services/job/job.service';
import { JobDetailsComponent } from '../job-details/job-details.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './job-list.component.html',
  styleUrl: './job-list.component.scss'
})
export class JobListComponent implements OnInit {
  jobs: JobModel[] = [];
  isLoading: boolean = true;
  error: string | null = null;
  @Output() selectJob = new EventEmitter<JobModel>();

  constructor(private jobService: JobService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadJobs();
  }

  loadJobs(): void {
    this.isLoading = true;
    this.error = null;
    this.jobService.getAllJobs().subscribe({
      next: (jobs) => {
        this.jobs = jobs.filter(job => job.status === 'Open');
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load open positions. Please try again later.';
        this.isLoading = false;
        console.error('Error fetching jobs:', err);
      }
    });
  }

  openJobDetails(job: JobModel) {
    this.dialog.open(JobDetailsComponent, {
      data: { job },
      width: '600px',
      maxHeight: '80vh'
    }).afterClosed().subscribe(() => {
      // Optional: Handle dialog close
    });
  }
}