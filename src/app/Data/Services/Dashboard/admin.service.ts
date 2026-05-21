import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { inject } from '@angular/core/primitives/di';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { Lot, LotDTO } from '../../Interfaces/Lot';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  httpClient = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/dashboard/admin`;

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
