import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { inject } from '@angular/core/primitives/di';
import { environment } from '../../../environments/environment';
import { Lot, LotDTO } from '../Interfaces/Lot';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LotService {
  httpClient = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/lots`;

  saveLot(lot: Lot): Observable<Lot> {
    return this.httpClient.post<Lot>(this.apiUrl, lot);
  }

  getAllLots(): Observable<LotDTO[]> {
    return this.httpClient.get<LotDTO[]>(this.apiUrl);
  }

  getCountLots(): Observable<number> {
    return this.httpClient.get<number>(`${this.apiUrl}/count`);
  }

  findLotById(id: number): Observable<Lot> {
    return this.httpClient.get<Lot>(`${this.apiUrl}/${id}`);
  }

  updateLot(lot: Lot): Observable<Lot> {
    return this.httpClient.put<Lot>(this.apiUrl, lot);
  }

  deleteLot(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrl}/${id}`);
  }
}
