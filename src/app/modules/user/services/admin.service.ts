import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from 'src/app/shared/services/base.service';

export interface Admin {
  id: number;
  email: string;
  fullName: string;
  avatar?: string;
  isActive: boolean;
  role: 'admin' | 'superAdmin';
  createdAt: string;
  deleted_at?: string;
}

export interface CreateAdminDto {
  email: string;
  fullName: string;
  password: string;
  avatar?: string;
  role?: 'admin' | 'superAdmin';
}

export interface UpdateAdminDto {
  email?: string;
  fullName?: string;
  password?: string;
  avatar?: string;
  isActive?: boolean;
  role?: 'admin' | 'superAdmin';
}

export interface PromoteUserDto {
  email: string;
  fullName: string;
  password: string;
  avatar?: string;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private baseUrl = '/Admin';

  constructor(
    private http: HttpClient,
    private baseService: BaseService
  ) {}

  getAdmins(): Observable<Admin[]> {
    const headers = this.baseService.getAuthHeader();
    return this.http.get<Admin[]>(this.baseUrl, { headers });
  }

  createAdmin(dto: CreateAdminDto): Observable<{ message: string }> {
    const headers = this.baseService.getAuthHeader();
    return this.http.post<{ message: string }>(
      `${this.baseUrl}/create-admin-bySuperAdmin`,
      dto,
      { headers }
    );
  }

  updateAdmin(id: number, dto: UpdateAdminDto): Observable<{ message: string }> {
    const headers = this.baseService.getAuthHeader();
    return this.http.patch<{ message: string }>(
      `${this.baseUrl}/${id}`,
      dto,
      { headers }
    );
  }

  deleteAdmin(id: number): Observable<{ message: string }> {
    const headers = this.baseService.getAuthHeader();
    return this.http.delete<{ message: string }>(
      `${this.baseUrl}/${id}`,
      { headers }
    );
  }

  updateAdminRole(id: number, role: 'admin' | 'superAdmin'): Observable<{ message: string }> {
    const headers = this.baseService.getAuthHeader();
    return this.http.patch<{ message: string }>(
      `${this.baseUrl}/role/${id}`,
      { role },
      { headers }
    );
  }

  promoteToAdmin(userId: number, dto: PromoteUserDto): Observable<{ message: string }> {
    const headers = this.baseService.getAuthHeader();
    return this.http.post<{ message: string }>(
      `${this.baseUrl}/${userId}/promote`,
      dto,
      { headers }
    );
  }

  demoteFromAdmin(userId: number): Observable<{ message: string }> {
    const headers = this.baseService.getAuthHeader();
    return this.http.post<{ message: string }>(
      `${this.baseUrl}/${userId}/demote`,
      {},
      { headers }
    );
  }

  updateProfile(dto: UpdateAdminDto): Observable<{ message: string }> {
    const headers = this.baseService.getAuthHeader();
    return this.http.patch<{ message: string }>(
      `${this.baseUrl}/profile`,
      dto,
      { headers }
    );
  }
}