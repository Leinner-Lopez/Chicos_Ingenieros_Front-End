import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_URL } from '../../tokens/api-url.token';
import {
  ProductResponse,
  ProductDTO,
  ProductRequest,
  ProductInventoryDTO,
} from '../Interfaces/Product';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  httpClient = inject(HttpClient);
  private readonly apiUrl = `${inject(API_URL)}/products`;

  saveProduct(formData: FormData): Observable<ProductRequest> {
    return this.httpClient.post<ProductRequest>(this.apiUrl, formData);
  }

  getAllProducts(): Observable<ProductDTO[]> {
    return this.httpClient.get<ProductDTO[]>(this.apiUrl);
  }

  getCountProducts(): Observable<number> {
    return this.httpClient.get<number>(`${this.apiUrl}/count`);
  }

  getProductsByCategory(categoryId: number): Observable<ProductDTO[]> {
    return this.httpClient.get<ProductDTO[]>(`${this.apiUrl}/category/${categoryId}`);
  }

  getInventory(): Observable<ProductInventoryDTO[]> {
    return this.httpClient.get<ProductInventoryDTO[]>(`${this.apiUrl}/inventory`);
  }

  findProductById(id: number): Observable<ProductRequest> {
    return this.httpClient.get<ProductRequest>(`${this.apiUrl}/${id}`);
  }

  updateProduct(product: ProductResponse): Observable<ProductRequest> {
    return this.httpClient.put<ProductRequest>(this.apiUrl, product);
  }

  deleteProduct(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrl}/${id}`);
  }
}
