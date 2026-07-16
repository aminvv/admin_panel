import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SlideDetails } from './model/slide.model';

@Injectable({ providedIn: 'root' })
export class SlideService {
  private baseUrl = `/slides`;

  constructor(private http: HttpClient) {}

  getAllAdmin(): Observable<SlideDetails[]> {
    return this.http.get<SlideDetails[]>(`${this.baseUrl}/admin`);
  }

  create(data: SlideDetails): Observable<SlideDetails> {
    return this.http.post<SlideDetails>(this.baseUrl, data);
  }

  update(id: number, data: SlideDetails): Observable<SlideDetails> {
    return this.http.put<SlideDetails>(`${this.baseUrl}/${id}`, data);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}