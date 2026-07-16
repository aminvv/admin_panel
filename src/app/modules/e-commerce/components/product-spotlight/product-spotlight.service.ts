import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductSpotlightDetails } from './model/product-spotlight.model';

@Injectable({ providedIn: 'root' })
export class ProductSpotlightService {
  private baseUrl = '/product-spotlight';

  constructor(private http: HttpClient) {}

  getAllAdmin(): Observable<ProductSpotlightDetails[]> {
    return this.http.get<ProductSpotlightDetails[]>(`${this.baseUrl}/admin`);
  }

  create(data: ProductSpotlightDetails): Observable<ProductSpotlightDetails> {
    return this.http.post<ProductSpotlightDetails>(this.baseUrl, data);
  }

  update(id: number, data: ProductSpotlightDetails): Observable<ProductSpotlightDetails> {
    return this.http.put<ProductSpotlightDetails>(`${this.baseUrl}/${id}`, data);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}