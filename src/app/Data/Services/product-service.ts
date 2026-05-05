import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Product, ProductDTO,} from '../Interfaces/Product';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  httpClient = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/products`;

  saveProduct(product: Product): Observable<Product> {
    return this.httpClient.post<Product>(this.apiUrl, product);
  }

  getAllProducts(): Observable<ProductDTO[]> {
    return this.httpClient.get<ProductDTO[]>(this.apiUrl);
  }

  getCountProducts(): Observable<number> {
    return this.httpClient.get<number>(`${this.apiUrl}/count`);
  }

  findProductById(id: number): Observable<Product> {
    return this.httpClient.get<Product>(`${this.apiUrl}/${id}`);
  }

  updateProduct(product: Product): Observable<Product> {
    return this.httpClient.put<Product>(this.apiUrl, product);
  }

  deleteProduct(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrl}/${id}`);
  }
}
