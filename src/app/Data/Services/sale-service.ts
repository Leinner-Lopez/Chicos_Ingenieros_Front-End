import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { SaleHistoryDTO, SaleRequest, SaleResponse } from '../Interfaces/Sale';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SaleService {
  httpClient = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/sales`;

  saveSale(sale: SaleRequest): Observable<SaleResponse> {
    return this.httpClient.post<SaleResponse>(this.apiUrl, sale);
  }

  getSales() {
    return this.httpClient.get<SaleResponse[]>(this.apiUrl);
  }

  getSaleHistory(): Observable<SaleHistoryDTO[]> {
    return this.httpClient.get<SaleHistoryDTO[]>(`${this.apiUrl}/history`);
  }
}
