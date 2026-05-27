import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_URL } from '../../../tokens/api-url.token';
import { Observable } from 'rxjs';
import { LotDTO } from '../../../Data/Interfaces/Lot';

@Injectable({ providedIn: 'root' })
export class StoreService {
  httpClient = inject(HttpClient);
  private readonly apiUrl = `${inject(API_URL)}/dashboard/store`;

  getLotsExpireThisWeek(): Observable<LotDTO[]> {
    return this.httpClient.get<LotDTO[]>(`${this.apiUrl}/lots_expire`);
  }

  getTotalLots(): Observable<number> {
    return this.httpClient.get<number>(`${this.apiUrl}/total_lots`);
  }

  getLossesOfTheMonth(): Observable<number> {
    return this.httpClient.get<number>(`${this.apiUrl}/losses_month`);
  }
}
