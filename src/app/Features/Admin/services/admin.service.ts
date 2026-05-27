import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_URL } from '../../../tokens/api-url.token';
import { Observable } from 'rxjs';
import { LotDTO } from '../../../Data/Interfaces/Lot';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  httpClient = inject(HttpClient);
  private readonly apiUrl = `${inject(API_URL)}/dashboard/admin`;

  getLotsExpireThisWeek(): Observable<LotDTO[]> {
    return this.httpClient.get<LotDTO[]>(`${this.apiUrl}/lots_expire`);
  }

  getProductsWithLowStock(): Observable<number> {
    return this.httpClient.get<number>(`${this.apiUrl}/critical_products`);
  }

  getCostOfShrinksOfTheMonth(): Observable<number> {
    return this.httpClient.get<number>(`${this.apiUrl}/losses_month`);
  }
}
