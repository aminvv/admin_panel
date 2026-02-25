import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from 'src/app/shared/services/base.service';

export interface Address {
  id: number;
  province: string;
  city: string;
  street: string;
  postalCode: string;
  plaque?: string;
  isDefault: boolean;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  mobile: string;
  role: 'user' | 'admin';
  create_at: string;
  last_login?: string;         
  addresses?: Address[];     
  deleted_at?: string;
}

export interface CreateUserDto {
  firstName: string;
  lastName: string;
  mobile: string;
}

export interface UpdateUserDto extends Partial<CreateUserDto> {}

@Injectable({ providedIn: 'root' })
export class UserService {
  private baseUrl = '/user';

  constructor(private http: HttpClient, private baseService: BaseService) {}

  getUsers(): Observable<User[]> {
    const headers = this.baseService.getAuthHeader();
    return this.http.get<User[]>(this.baseUrl, { headers });
  }

  getUser(id: number): Observable<User> {
    const headers = this.baseService.getAuthHeader();
    return this.http.get<User>(`${this.baseUrl}/${id}`, { headers });
  }

  createUser(dto: CreateUserDto): Observable<{ message: string }> {
    const headers = this.baseService.getAuthHeader();
    return this.http.post<{ message: string }>(this.baseUrl, dto, { headers });
  }

  updateUser(id: number, dto: UpdateUserDto): Observable<{ message: string }> {
    const headers = this.baseService.getAuthHeader();
    return this.http.patch<{ message: string }>(`${this.baseUrl}/${id}`, dto, { headers });
  }

  deleteUser(id: number): Observable<{ message: string }> {
    const headers = this.baseService.getAuthHeader();
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`, { headers });
  }
}