import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// 🔹 Une entrée simple (valeur + nombre d'occurrences)
export interface SingleChoiceEntry {
  value: string;
  count: number;
}

export interface DailyCount {
  date: string; // ISO string envoyée par le back
  count: number;
}

// 🔹 Doit être compatible avec ce que tu utilises dans SurveyStatsComponent
export interface StatsOverview {
  trueCount: number;
  falseCount: number;
  totalCount: number;

  totalResponses: number;
  dailyCounts: DailyCount[];

  // Tu peux avoir d'autres champs selon ton back, on les laisse ouverts
  [key: string]: any;
}

@Injectable({
  providedIn: 'root',
})
export class StatsService {
  private readonly http = inject(HttpClient);

  // En dev  : http://localhost:3000/api
  // En prod : https://vera-groupe-2.onrender.com/api
  private readonly baseUrl = environment.apiUrl;

  /** Récupère un snapshot des stats (pour loadSnapshot) */
  fetchOverview(): Observable<StatsOverview> {
    return this.http.get<StatsOverview>(`${this.baseUrl}/stats/overview`);
  }

  /** Écoute le flux temps réel via Server-Sent Events (pour listenToStream) */
  listenToStream(): Observable<StatsOverview> {
    return new Observable<StatsOverview>((subscriber) => {
      const url = `${this.baseUrl}/stats/stream`;
      const source = new EventSource(url);

      source.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as StatsOverview;
          subscriber.next(data);
        } catch (e) {
          console.error('[StatsService] erreur parse stream', e);
        }
      };

      source.onerror = (err) => {
        console.error('[StatsService] stream error', err);
        source.close();
        subscriber.error(err);
      };

      // cleanup quand l'observable est unsubscribed
      return () => {
        source.close();
      };
    });
  }
}
