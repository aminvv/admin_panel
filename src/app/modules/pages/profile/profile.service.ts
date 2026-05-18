import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from 'src/app/shared/services/base.service';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private baseUrl = '/Admin';
  private imageUrl = '/image';

  constructor(
    private http: HttpClient,
    private baseService: BaseService
  ) { }

  getProfile(): Observable<any> {
    const headers = this.baseService.getAuthHeader();
    return this.http.get(`${this.baseUrl}/me`, { headers });
  }

  updateProfile(dto: { fullName: string }): Observable<any> {
    const headers = this.baseService.getAuthHeader();
    return this.http.patch(`${this.baseUrl}/profile`, dto, { headers });
  }

  uploadAvatar(file: File, alt: string, name: string): Observable<any> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('alt', alt);
    formData.append('name', name);

    const headers = this.baseService.getAuthHeader();
    return this.http.post(`${this.imageUrl}/create-image`, formData, { headers });
  }
}