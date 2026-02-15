import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from '../../../shared/services/base.service';
import { Payment } from '../models/payment.model';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  constructor(
    private http: HttpClient,
    private baseService: BaseService
  ) { }

  getPayments(): Observable<Payment[]> {
    const headers = this.baseService.getAuthHeader();
    return this.http.get<Payment[]>('/payment/find-payment', { headers })
    
  }

  getPaymentById(id: number): Observable<Payment> {
    throw new Error('Not implemented, use getPayments and filter');
  }





}