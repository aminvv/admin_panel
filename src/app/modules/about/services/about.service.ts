import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AboutPage } from '../models/about.model';

@Injectable({
  providedIn: 'root',
})
export class AboutService {
  private apiUrl = '/about';

  constructor(private http: HttpClient) {}

  get(): Observable<AboutPage> {
    return this.http.get<AboutPage>(this.apiUrl);
  }

  update(data: Partial<AboutPage>): Observable<AboutPage> {
    return this.http.put<AboutPage>(this.apiUrl, data);
  }
}