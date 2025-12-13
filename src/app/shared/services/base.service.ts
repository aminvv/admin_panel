import {  HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';



@Injectable({
  providedIn: 'root',
})
export class BaseService {



// ================= GET TOKEN HEADER =================
 getAuthHeader():HttpHeaders{
      const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token') || ''}`
    });
    return headers
}





}
