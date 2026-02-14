// src/app/modules/admin/orders/services/order.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from 'src/app/shared/services/base.service';
import { catchError, map, tap } from 'rxjs/operators';

// اینترفیس پایه‌ای که قبلاً استفاده کردید
export interface Order {
  id: number;
  status: string;
  street:string;
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

// اینترفیس توسعه‌یافته برای صفحه جزئیات (Optional fields)
export interface OrderDetail extends Order {

  city?: string;
  postal_code?: string;
  phone?: string;



  shippingAddress?: {
    province: string;
    city: string;
    street: string;
    postalCode: string;
    plaque?: string;
  };

  // توسعه فیلد user
  user: Order['user'] & {
    email?: string;
    created_at?: string;
    total_orders?: number;
  };

  // توسعه فیلد payment
  payment: Order['payment'] & {
    invoice_number?: string;
    paid_at?: string;
    amount?: number;
    method?: string;
  };

  items?: OrderItem[];
  order_items?: OrderItem[];
}

// اینترفیس‌های کمکی جدید
export interface OrderItem {
  id?: number;
  product_id?: number;
  order_id?: number;
  quantity?: number;
  price?: number;
  product?: {
    id?: number;
    name?: string;
    sku?: string;
    image?: string;
  };
}

export interface OrderNote {
  id?: number;
  order_id?: number;
  author?: string;
  content?: string;
  created_at?: string;
}

// اینترفیس‌های دیگر که قبلاً داشتید
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
  ) { }

  // ======== متدهای موجود ========
  getOrders(filters?: any): Observable<Order[]> {
    const headers = this.baseService.getAuthHeader();
    let params = new HttpParams();
    if (filters?.status) params = params.set('status', filters.status);
    if (filters?.search) params = params.set('search', filters.search);

    return this.http.get<Order[]>(this.baseUrl, { headers, params });
  }

  getOrder(id: number): Observable<OrderDetail> {
    const headers = this.baseService.getAuthHeader();
    return this.http.get<any>(`${this.baseUrl}/${id}`, { headers }).pipe(
      map(response => {
        console.log('📦 API Response:', response);

        // تبدیل orderItems به items با ساختار درست
        const items = (response.orderItems || []).map((orderItem: any) => {
          const price = orderItem.price || orderItem.product?.price || 0;
          const quantity = orderItem.quantity || 0;

          return {
            id: orderItem.id,
            product_id: orderItem.productId,
            order_id: orderItem.orderId,
            quantity: quantity,
            price: price,
            product: {
              id: orderItem.product?.id,
              name: orderItem.product?.productName || orderItem.product?.name || 'محصول',
              sku: orderItem.product?.productCode || orderItem.product?.sku || 'ندارد',
              image: orderItem.product?.image?.[0]?.url || orderItem.product?.image
            }
          };
        });
        const shippingAddress = response.shippingAddress;

        return {
          ...response,
          items: items,
          city: shippingAddress?.city || '',               
          postal_code: shippingAddress?.postalCode || '',  
          phone: response.user?.mobile || '',
          street: shippingAddress?.street || response.street || ''
        };
      })
    );
  }




  calculateStats(orders: Order[]): OrderStats {
    console.log('Calculating stats for orders:', orders);
    console.log('Orders count:', orders.length);

    const stats: OrderStats = {
      total: orders.length,
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      revenue: 0
    };

    // محاسبه
    orders.forEach(order => {
      console.log(`Order ${order.id}: status=${order.status}, amount=${order.final_amount}`);

      switch (order.status) {
        case 'pending':
          stats.pending++;
          break;
        case 'inProcess':
          stats.processing++;
          break;
        case 'inTransit':
          stats.shipped++;
          break;
        case 'delivered':
          stats.delivered++;
          stats.revenue += order.final_amount || 0;
          break;
        case 'canceled':
          stats.cancelled++;
          break;
        case 'ordered':
          stats.processing++;
          break;
      }
    });

    console.log('Final stats:', stats);
    return stats;
  }

  // ======== بقیه متدها ========
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





  // ======== متدهای Status Flow ========
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
        label: 'در حال بارگیری',
        icon: 'forklift',
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

  canChangeStatus(fromStatus: string, toStatus: string): boolean {
    const flow = this.getOrderStatusFlow(fromStatus);
    const current = flow.find(item => item.status === fromStatus);

    if (!current) return false;

    if (toStatus === 'canceled') {
      return !['delivered', 'canceled'].includes(fromStatus);
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

  // ======== Helper Methods ========
  getStatusLabel(status: string): string {
    const map: { [key: string]: string } = {
      'pending': 'در انتظار پرداخت',
      'ordered': 'ثبت شده',
      'inProcess': 'در حال پردازش',
      'packed': 'در حال بارگیری',
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
      'ordered': 'verified',
      'inProcess': 'settings',
      'packed': 'forklift',
      'inTransit': 'local_shipping',
      'delivered': 'check_circle',
      'canceled': 'cancel'
    };
    return map[status] || 'help';
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'نامشخص';
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








  printInvoice(orderId: number): Observable<void> {
    return this.http.get(`${this.baseUrl}/invoice/${orderId}/html`, { // تغییر از /invoice/${orderId}/html به این
      responseType: 'text'
    }).pipe(
      tap(html => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(html);
          printWindow.document.close();

          printWindow.onload = () => {
            printWindow.focus();
            printWindow.print();
          };
        }
      }),
      map(() => { }),
      catchError(err => {
        console.error('Print error:', err);
        throw err;
      })
    );
  }

  downloadInvoice(orderId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/invoice/${orderId}/pdf`, { // تغییر از /invoice/${orderId}/pdf به این
      responseType: 'blob'
    }).pipe(
      tap(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${orderId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }),
      catchError(err => {
        console.error('Download error:', err);
        throw err;
      })
    );
  }



  exportOrderExcel(orderId: number): Observable<any> {
    const headers = this.baseService.getAuthHeader();
    return this.http.get(`${this.baseUrl}/invoice/${orderId}/export/excel`, { // اضافه کردن /invoice/ قبل
      responseType: 'blob',
      headers
    }).pipe(
      tap(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `order-${orderId}-details.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }),
      catchError(err => {
        console.error('Export Excel error:', err);
        throw err;
      })
    );
  }
}