import { Component } from '@angular/core';
import { NavbarComponent } from "../../common/navbar/navbar.component";
import { FooterComponent } from "../../common/footer/footer.component";
import { JobService } from '../../services/job/job.service';
import { Job } from '../../models/job.model';
import { CommonModule } from '@angular/common';
import { JobListComponent } from "../../dynamics/job-list/job-list.component";
import { JobDetailsComponent } from "../../dynamics/job-details/job-details.component";
import { ChatWidgetComponent } from "../../components/chat-widget/chat-widget.component";

@Component({
  selector: 'app-careers',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, CommonModule, JobListComponent, JobDetailsComponent, ChatWidgetComponent],
  templateUrl: './careers.component.html',
  styleUrl: './careers.component.scss'
})
export class CareersComponent {
jobs: Job[] = [];
  selectedJob: Job | null = null;

  constructor(private jobService: JobService) {}

  ngOnInit() {
    this.jobService.getJobs().subscribe(j => this.jobs = j);
  }

  onSelect(job: Job) {
    this.selectedJob = job;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
