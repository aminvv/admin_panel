import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SearchResults {
  products: any[];
  orders: any[];
  users: any[];
}

@Injectable({ providedIn: 'root' })
export class GlobalSearchService {
  private readonly baseUrl = '/admin/search';

  constructor(private http: HttpClient) {}

  search(query: string): Observable<SearchResults> {
    return this.http.get<SearchResults>(this.baseUrl, { params: { q: query } });
  }
}