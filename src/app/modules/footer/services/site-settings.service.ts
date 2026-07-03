import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from 'src/app/shared/services/base.service';
import { SiteSettings } from '../models/interface SiteSettings-model';

@Injectable({
  providedIn: 'root'
})
export class SiteSettingsService {
  private apiUrl = '/site-settings';

  constructor(
    private http: HttpClient,
    private baseService: BaseService
  ) {}

  getSettings(): Observable<SiteSettings> {
    return this.http.get<SiteSettings>(this.apiUrl, {
      headers: this.baseService.getAuthHeader()
    });
  }

  updateSettings(data: SiteSettings): Observable<SiteSettings> {
    return this.http.patch<SiteSettings>(this.apiUrl, data, {
      headers: this.baseService.getAuthHeader()
    });
  }
}