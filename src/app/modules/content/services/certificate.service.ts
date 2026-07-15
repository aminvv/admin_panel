import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CertificateDetails } from '../components/certificate/model/certificate-details.model';

@Injectable({ providedIn: 'root' })
export class CertificateService {
  private baseUrl = '/certificates';

  constructor(private http: HttpClient) {}

  getAllPublic(): Observable<CertificateDetails[]> {
    return this.http.get<CertificateDetails[]>(this.baseUrl);
  }

  getAllAdmin(): Observable<CertificateDetails[]> {
    return this.http.get<CertificateDetails[]>(`${this.baseUrl}/admin`);
  }

  getOne(id: number): Observable<CertificateDetails> {
    return this.http.get<CertificateDetails>(`${this.baseUrl}/${id}`);
  }

  create(data: CertificateDetails): Observable<CertificateDetails> {
    return this.http.post<CertificateDetails>(this.baseUrl, data);
  }

  update(id: number, data: CertificateDetails): Observable<CertificateDetails> {
    return this.http.put<CertificateDetails>(`${this.baseUrl}/${id}`, data);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}