import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { LotDTO } from '../../Interfaces/Lot';

@Injectable({ providedIn: 'root' })
export class StoreService {
  httpClient = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/dashboard/store`;

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
