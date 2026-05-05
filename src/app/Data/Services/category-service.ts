import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Category } from '../Interfaces/Category';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  httpClient = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/categories`;

  saveCategory(category: Category): Observable<Category> {
    return this.httpClient.post<Category>(this.apiUrl, category);
  }

  getAllCategories(): Observable<Category[]> {
    return this.httpClient.get<Category[]>(this.apiUrl);
  }

  getCountCategories(): Observable<number> {
    return this.httpClient.get<number>(`${this.apiUrl}/count`);
  }

  findCategoryById(id: number): Observable<Category> {
    return this.httpClient.get<Category>(`${this.apiUrl}/${id}`);
  }

  updateCategory(category: Category): Observable<Category> {
    return this.httpClient.put<Category>(this.apiUrl, category);
  }

  deleteCategory(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrl}/${id}`);
  }
}
