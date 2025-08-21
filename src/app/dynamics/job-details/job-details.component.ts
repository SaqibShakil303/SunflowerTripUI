import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { JobModel } from '../../models/job.model';
import { JobApplicationComponent } from '../../components/job-application/job-application.component';

@Component({
  selector: 'app-job-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './job-details.component.html',
  styleUrl: './job-details.component.scss'
})
export class JobDetailsComponent {
  constructor(
    public dialogRef: MatDialogRef<JobDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { job: JobModel },
    private dialog: MatDialog
  ) {}

  onApply() {
    this.dialog.open(JobApplicationComponent, {
      data: { job: this.data.job },
      width: '600px',
      maxHeight: '80vh'
    }).afterClosed().subscribe((result) => {
      if (result) {
        // Optionally close the JobDetails dialog after successful application
        this.dialogRef.close();
      }
    });
  }

  onClose() {
    this.dialogRef.close();
  }
}