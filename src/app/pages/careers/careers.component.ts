import { Component, Input } from '@angular/core';
import { NavbarComponent } from "../../common/navbar/navbar.component";
import { FooterComponent } from "../../common/footer/footer.component";
import { JobService } from '../../services/job/job.service';
import { JobModel } from '../../models/job.model';
import { CommonModule } from '@angular/common';
import { JobListComponent } from "../../dynamics/job-list/job-list.component";
import { JobDetailsComponent } from "../../dynamics/job-details/job-details.component";

@Component({
  selector: 'app-careers',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, CommonModule, JobListComponent, JobDetailsComponent],
  templateUrl: './careers.component.html',
  styleUrl: './careers.component.scss'
})
export class CareersComponent {
  jobs: JobModel[] = [];
  selectedJob: JobModel | null = null;

  constructor(private jobService: JobService) { }

  ngOnInit() {
    this.jobService.getAllJobs().subscribe(j => this.jobs = j);
  }

  onSelect(job: JobModel) {
    this.selectedJob = job;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
