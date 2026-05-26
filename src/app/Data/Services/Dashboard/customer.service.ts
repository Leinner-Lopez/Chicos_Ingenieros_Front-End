import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { SaleHistoryDTO } from '../../Interfaces/Sale';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  httpClient = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/dashboard/customer`;

  getAvailableProducts(): Observable<number> {
    return this.httpClient.get<number>(`${this.apiUrl}/available_products`);
  }

  getTotalPurchases(userId: number): Observable<number> {
    return this.httpClient.get<number>(`${this.apiUrl}/${userId}/total_purchases`);
  }

  getTotalSpent(userId: number): Observable<number> {
    return this.httpClient.get<number>(`${this.apiUrl}/${userId}/total_spent`);
  }

  getRecentPurchases(userId: number): Observable<SaleHistoryDTO[]> {
    return this.httpClient.get<SaleHistoryDTO[]>(`${this.apiUrl}/${userId}/recent_purchases`);
  }
}
