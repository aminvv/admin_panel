import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from 'src/app/shared/services/base.service';

export interface Profile {
  id: number;
  email: string;
  fullName: string;
  avatar?: string;
  role: 'admin' | 'superAdmin';
  createdAt: string;
  isActive: boolean;
}

export interface UpdateProfileDto {
  fullName?: string;
  email?: string;
  avatar?: string;
  password?: string;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private baseUrl = '/Admin';

  constructor(
    private http: HttpClient,
    private baseService: BaseService
  ) {}

  getProfile(): Observable<Profile> {
    const headers = this.baseService.getAuthHeader();
    return this.http.get<Profile>(`${this.baseUrl}/me`, { headers });
  }

updateProfile(dto: any): Observable<any> {
  const headers = this.baseService.getAuthHeader(); // اگر BaseService دارید
  return this.http.patch('/Admin/profile', dto, { headers });
}



}