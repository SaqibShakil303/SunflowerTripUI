import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Job } from '../../models/job.model';

@Injectable({
  providedIn: 'root'
})
export class JobService {
 getJobs(): Observable<Job[]> {
    // TODO: replace with real HTTP call
    return of([
      {
        id: '1',
        title: 'Travel Consultant',
        location: 'Kolkata',
        experience: '1-3 years',
        category: 'customer',
        type: 'Full-time',
        department: 'Customer Service',

        responsibilities: [
          'Handle travel bookings and customer queries',
          'Coordinate with vendors and partners',
          'Prepare travel itineraries'
        ],
        skills: ['Communication', 'Attention to detail', 'Problem-solving']
      },
       { id: '2',
        title: 'Software Engineer',
        location: 'Kolkata',
        experience: '0-3 years',
            category: 'product',
            type: 'Full-time',
        department: 'Engineering',
        responsibilities: [
          'Handle all the full stack development',
          'Work with the team to design and develop new features',
          'Write clean, maintainable code',
          'Participate in code reviews and team meetings'
        ],
        skills: ['JavaScript', 'Angular', 'Node.js', 'HTML', 'CSS', 'SQL','Express.js', 'MongoDB', 'REST APIs', 'Git', 'deployment', 'CI/CD', 'Agile/Scrum', 'Problem-solving', 'Teamwork', 'Communication'],
      },
      {
        id: '3',
        title: 'Regional Operations Coordinator',
        department: 'Operations',
        location: 'Bangkok, Thailand',
        type: 'Full-time',
        description: 'Coordinate local tour providers and ensure smooth operations for all our Southeast Asia experiences.',
        responsibilities: [
          'Experience in travel operations or hospitality',
          'Strong organizational and problem-solving skills',
          'Fluent in English and Thai'
        ],
        category: 'operations',
        experience: '2-4 years',
        skills: ['Organization', 'Problem-solving', 'English', 'Thai']
      },
      // more jobs...
    ]);
  }
}
