import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { SaleHistoryDTO, SaleResponse } from '../Interfaces/Sale';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SaleService {
  httpClient = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/sales`;

  getSales() {
    return this.httpClient.get<SaleResponse[]>(this.apiUrl);
  }

  getSaleHistory(): Observable<SaleHistoryDTO[]> {
    return this.httpClient.get<SaleHistoryDTO[]>(`${this.apiUrl}/history`);
  }
}
