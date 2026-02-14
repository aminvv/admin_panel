// src/app/modules/admin/customers/services/customer.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseService } from 'src/app/shared/services/base.service';
import { Order, OrderService } from './order.service';

export interface CustomerOrderListItem {
  id: number;
  orderNumber: string;
  customerName: string;
  address: string;
  phone: string;
  orderStatus: string;
  paymentStatus: string;
  customerId: number;
  orderId: number;
}

export interface CustomerDetail {
  id: number;
  firstName: string;
  lastName: string;
  mobile: string;
  email: string | null;
  registrationDate: string;
  addresses: Address[];
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  recentOrders: RecentOrder[];
}

export interface Address {
  id: number;
  title?: string;       
  city: string;
  street: string;
  postalCode: string;
  plaque?: string;
  isDefault: boolean;
}

export interface RecentOrder {
  id: number;
  orderNumber: string;
  orderDate: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  constructor(
    private http: HttpClient,
    private baseService: BaseService,
    private orderService: OrderService
  ) {}




getCustomerOrderList(): Observable<CustomerOrderListItem[]> {
  return this.orderService.getOrders().pipe(
    map((orders: Order[]) => {
      return orders.map(order => {
        const firstName = order.user?.firstName || '';
        const lastName = order.user?.lastName || '';
        const customerName = `${firstName} ${lastName}`.trim() || 'مشتری ناشناس';

      
        let paymentStatus = 'unknown';
        if (order.payment) {
          if (order.payment.status === true) {
            paymentStatus = 'paid';
          } else if (order.payment.status === false) {
            paymentStatus = 'failed';
          } else if (typeof order.payment.status === 'string') {
            paymentStatus = order.payment.status;
          }
        }

        return {
          id: order.id,
          orderNumber: `ORD-${order.id}`,
          customerName,
          address: order.street || 'آدرس ثبت نشده',
          phone: order.user?.mobile || 'ندارد',
          orderStatus: order.status,
          paymentStatus, 
          customerId: order.user?.id,
          orderId: order.id
        };
      });
    })
  );
}

getCustomerDetail(customerId: number): Observable<CustomerDetail> {
  const headers = this.baseService.getAuthHeader();

  const userDetail$ = this.http.get<any>(`/user/${customerId}`, { headers });
  const userOrders$ = this.orderService.getOrders().pipe(
    map(orders => {
      // مقایسه عددی (مهم!)
      return orders.filter(order => 
        order.user && +order.user.id === +customerId
      );
    })
  );

  return forkJoin([userDetail$, userOrders$]).pipe(
    map(([user, orders]) => {
      // مرتب‌سازی نزولی بر اساس تاریخ
      const sortedOrders = [...orders].sort(
        (a, b) => new Date(b.create_at).getTime() - new Date(a.create_at).getTime()
      );

      // تبدیل payment.status به string
      const allOrders = sortedOrders.map(order => {
        let paymentStatus = 'unknown';
        if (order.payment) {
          if (typeof order.payment.status === 'boolean') {
            paymentStatus = order.payment.status ? 'paid' : 'failed';
          } else if (typeof order.payment.status === 'string') {
            paymentStatus = order.payment.status;
          }
        }

        return {
          id: order.id,
          orderNumber: `ORD-${order.id}`,
          orderDate: order.create_at,
          status: order.status,
          paymentStatus,
          totalAmount: order.final_amount || 0
        };
      });

      const addresses: Address[] = (user.addresses || []).map((addr: any) => ({
        id: addr.id,
        province: addr.province,
        city: addr.city,
        street: addr.street,
        postalCode: addr.postalCode,
        plaque: addr.plaque,
        isDefault: addr.isDefault || false,
        title: this.generateAddressTitle(addr)
      }));

      const totalSpent = orders.reduce((sum, o) => sum + (o.final_amount || 0), 0);
      const lastOrderDate = sortedOrders[0]?.create_at || '';

      return {
        id: user.id,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        mobile: user.mobile || '',
        email: user.email || null,
        registrationDate: user.create_at,
        addresses,
        totalOrders: orders.length,
        totalSpent,
        lastOrderDate,
        recentOrders: allOrders  // ✅ همه سفارشات
      };
    })
  );
}
 


  private generateAddressTitle(addr: any): string {
    return `${addr.province}، ${addr.city}، ${addr.street}`;
  }
}