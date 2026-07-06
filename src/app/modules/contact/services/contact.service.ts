import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ContactPage } from '../models/contact.model';

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  private apiUrl = '/contact';

  constructor(private http: HttpClient) {}

  get(): Observable<ContactPage> {
    return this.http.get<ContactPage>(this.apiUrl);
  }

  update(data: Partial<ContactPage>): Observable<ContactPage> {
    return this.http.put<ContactPage>(this.apiUrl, data);
  }
}