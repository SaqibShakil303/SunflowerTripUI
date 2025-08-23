import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FlightCard, FlightsService } from '../../services/flights/flights.service';
import { Subscription } from 'rxjs';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-flight-results',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './flight-results.component.html',
  styleUrl: './flight-results.component.scss',
  providers: [DatePipe]
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
        next: (resp: any) => {
          // Support both shapes: { results: [...] } or direct array
          this.items = Array.isArray(resp) ? resp : (resp?.results ?? []);
          this.loading = false;
        },
        error: (e) => {
          this.error = e?.error?.error || 'Failed to load flights';
          this.loading = false;
        }
      });
    });
  }

  ngOnDestroy(){ this.sub?.unsubscribe(); }

  getAirlineLogo(carrier: string): string {
    // Assuming carrier is an IATA code like 'AA', 'DL', etc.
    // Use a public API for airline logos (e.g., avs.io provides free logos)
    return `https://pics.avs.io/99/36/${carrier}.png`;
  }

  getStopsLabel(it: FlightCard['itineraries'][0]): string {
    const stops = (it?.length || 1) - 1;
    return stops === 0 ? 'Non-stop' : `${stops} stop${stops > 1 ? 's' : ''}`;
  }

  getDuration(it: FlightCard['itineraries'][0]): string {
    if (!it || it.length === 0) return '0h 0m';
    const start = new Date(it[0].depart);
    const end = new Date(it[it.length - 1].arrive);
    const diffMs = end.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }

  
}