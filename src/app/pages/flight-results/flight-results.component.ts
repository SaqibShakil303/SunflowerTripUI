import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FlightCard, FlightsService } from '../../services/flights/flights.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-flight-results',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './flight-results.component.html',
  styleUrl: './flight-results.component.scss'
})
export class FlightResultsComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private api = inject(FlightsService);
  private sub?: Subscription;

  loading = false;
  items: FlightCard[] = [];
  error = '';

  ngOnInit() {
    this.sub = this.route.queryParams.subscribe(params => {
      const from = params['from'], to = params['to'], depart = params['depart'];
      if (!from || !to || !depart) { this.items = []; return; }
      const body = {
        from, to, depart,
        ret: params['ret'] || undefined,
        adults: +(params['adults'] || 1),
        children: +(params['children'] || 0),
        infants: +(params['infants'] || 0),
        cabin: params['cabin'] || 'ECONOMY',
        nonStop: params['nonStop'] === 'true',
        currency: params['currency'] || 'INR',
        max: 50
      };
      this.loading = true; this.error = '';
      this.api.search(body).subscribe({
        next: ({results}) => { this.items = results; this.loading = false; },
        error: (e) => { this.error = e?.error?.error || 'Failed to load flights'; this.loading = false; }
      });
    });
  }

  ngOnDestroy(){ this.sub?.unsubscribe(); }

  durationLabel(it: FlightCard['itineraries'][0]) {
    // simple stops label: segments-1
    const stops = (it?.length || 1) - 1;
    return stops === 0 ? 'Non-stop' : `${stops} stop${stops>1?'s':''}`;
  }
}