// src/app/modules/admin/orders/services/order.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { BaseService } from 'src/app/shared/services/base.service';

export interface Order {
  id: number;
  status: string;
  address: string;
  total_amount: number;
  final_amount: number;
  discount_amount: number;
  create_at: string;
  user: {
    id: number;
    firstName: string | null;
    lastName: string | null;
    mobile: string;
    role: string;
  };
  payment: any;
}

// اضافه کن: اینترفیس جدید
export interface OrderStatusFlow {
  step: number;
  status: string;
  label: string;
  icon: string;
  description: string;
  color: string;
  canGoTo: string[];
  isActive?: boolean;
  isCompleted?: boolean;
  isCancelled?: boolean;
}

export interface OrderStats {
  total: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  revenue: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private baseUrl = '/admin/orders';

  constructor(
    private http: HttpClient,
    private baseService: BaseService
  ) {}

  // ======== متدهای اصلی موجود ========
  getOrders(filters?: any): Observable<Order[]> {
    const headers = this.baseService.getAuthHeader();
    let params = new HttpParams();
    if (filters?.status) params = params.set('status', filters.status);
    if (filters?.search) params = params.set('search', filters.search);
    
    return this.http.get<Order[]>(this.baseUrl, { headers, params });
  }

  getOrder(id: number): Observable<Order> {
    const headers = this.baseService.getAuthHeader();
    return this.http.get<Order>(`${this.baseUrl}/${id}`, { headers });
  }

  advanceStatus(orderId: number): Observable<any> {
    const headers = this.baseService.getAuthHeader();
    return this.http.patch(`${this.baseUrl}/${orderId}/next`, {}, { headers });
  }

  revertStatus(orderId: number): Observable<any> {
    const headers = this.baseService.getAuthHeader();
    return this.http.patch(`${this.baseUrl}/${orderId}/revert`, {}, { headers });
  }

  cancelOrder(orderId: number): Observable<any> {
    const headers = this.baseService.getAuthHeader();
    return this.http.patch(`${this.baseUrl}/${orderId}/cancel`, {}, { headers });
  }

  // ======== متدهای جدید Status Flow ========
  getOrderStatusFlow(currentStatus?: string): OrderStatusFlow[] {
    const flow: OrderStatusFlow[] = [
      {
        step: 1,
        status: 'pending',
        label: 'در انتظار پرداخت',
        icon: 'pending',
        description: 'سفارش ثبت شده و منتظر پرداخت مشتری',
        color: 'warning',
        canGoTo: ['ordered', 'canceled']
      },
      {
        step: 2,
        status: 'ordered',
        label: 'ثبت شده',
        icon: 'verified',
        description: 'پرداخت تأیید شده، سفارش آماده پردازش',
        color: 'info',
        canGoTo: ['inProcess', 'canceled']
      },
      {
        step: 3,
        status: 'inProcess',
        label: 'در حال پردازش',
        icon: 'settings',
        description: 'در حال بررسی و آماده‌سازی سفارش',
        color: 'primary',
        canGoTo: ['packed', 'ordered']
      },
      {
        step: 4,
        status: 'packed',
        label: 'بسته‌بندی شده',
        icon: 'inventory',
        description: 'سفارش بسته‌بندی و آماده ارسال',
        color: 'accent',
        canGoTo: ['inTransit', 'inProcess']
      },
      {
        step: 5,
        status: 'inTransit',
        label: 'در حال ارسال',
        icon: 'local_shipping',
        description: 'سفارش تحویل پست یا پیک شده',
        color: 'teal',
        canGoTo: ['delivered', 'packed']
      },
      {
        step: 6,
        status: 'delivered',
        label: 'تحویل داده شده',
        icon: 'check_circle',
        description: 'سفارش به دست مشتری رسیده',
        color: 'success',
        canGoTo: ['completed']
      },
      {
        step: 7,
        status: 'completed',
        label: 'تکمیل شده',
        icon: 'done_all',
        description: 'سفارش با موفقیت به پایان رسید',
        color: 'green',
        canGoTo: []
      },
      {
        step: 0,
        status: 'canceled',
        label: 'لغو شده',
        icon: 'cancel',
        description: 'سفارش لغو شده است',
        color: 'danger',
        canGoTo: []
      }
    ];

    if (currentStatus) {
      const currentStep = flow.find(item => item.status === currentStatus)?.step || 0;
      
      return flow.map(item => ({
        ...item,
        isActive: item.status === currentStatus,
        isCompleted: item.step > 0 && item.step < currentStep,
        isCancelled: currentStatus === 'canceled' && item.status === 'canceled'
      }));
    }

    return flow;
  }

    calculateStats(orders: Order[]): OrderStats {
    const stats: OrderStats = {
      total: 0,
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      revenue: 0
    };
    
    stats.total = orders.length;
    
    orders.forEach(order => {
      // افزایش تعداد بر اساس وضعیت
      switch (order.status) {
        case 'pending':
          stats.pending++;
          break;
        case 'ordered':
        case 'inProcess':
        case 'packed':
          stats.processing++;
          break;
        case 'inTransit':
          stats.shipped++;
          break;
        case 'delivered':
        case 'completed':
          stats.delivered++;
          break;
        case 'canceled':
          stats.cancelled++;
          break;
      }
      
      // محاسبه درآمد فقط سفارشات تحویل شده
      if (['delivered', 'completed'].includes(order.status)) {
        stats.revenue += order.final_amount;
      }
    });
    
    return stats;
  }

  canChangeStatus(fromStatus: string, toStatus: string): boolean {
    const flow = this.getOrderStatusFlow(fromStatus);
    const current = flow.find(item => item.status === fromStatus);
    
    if (!current) return false;
    
    if (toStatus === 'canceled') {
      return !['delivered', 'completed', 'canceled'].includes(fromStatus);
    }
    
    return current.canGoTo.includes(toStatus);
  }

  getNextPossibleStatuses(currentStatus: string): OrderStatusFlow[] {
    const flow = this.getOrderStatusFlow(currentStatus);
    const current = flow.find(item => item.status === currentStatus);
    
    if (!current) return [];
    
    return current.canGoTo
      .map(status => flow.find(item => item.status === status))
      .filter(Boolean) as OrderStatusFlow[];
  }

  // ======== Helper Methods موجود ========
  getStatusLabel(status: string): string {
    const map: { [key: string]: string } = {
      'pending': 'در انتظار پرداخت',
      'ordered': 'ثبت شده',
      'inProcess': 'در حال پردازش',
      'packed': 'بسته‌بندی شده',
      'inTransit': 'در حال ارسال',
      'delivered': 'تحویل داده شده',
      'canceled': 'لغو شده'
    };
    return map[status] || status;
  }

  getStatusColor(status: string): string {
    const map: { [key: string]: string } = {
      'pending': 'warning',
      'ordered': 'info',
      'inProcess': 'primary',
      'packed': 'accent',
      'inTransit': 'teal',
      'delivered': 'success',
      'canceled': 'danger'
    };
    return map[status] || 'secondary';
  }

  getStatusIcon(status: string): string {
    const map: { [key: string]: string } = {
      'pending': 'pending',
      'ordered': 'inventory_2',
      'inProcess': 'settings',
      'packed': 'inventory',
      'inTransit': 'local_shipping',
      'delivered': 'check_circle',
      'canceled': 'cancel'
    };
    return map[status] || 'help';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatPrice(price: number): string {
    if (!price) return '۰ تومان';
    return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
  }

  canAdvance(status: string): boolean {
    return ['pending', 'ordered', 'inProcess', 'packed', 'inTransit'].includes(status);
  }

  canRevert(status: string): boolean {
    return ['ordered', 'inProcess', 'packed', 'inTransit', 'delivered'].includes(status);
  }

  canCancel(status: string): boolean {
    return !['delivered', 'canceled'].includes(status);
  }
}