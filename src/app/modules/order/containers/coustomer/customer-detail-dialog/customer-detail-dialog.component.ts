
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomerDetail, CustomerService } from '../../../services/customer.service';
import { Router } from '@angular/router';  


@Component({
  selector: 'app-customer-detail-dialog',
  templateUrl: './customer-detail-dialog.component.html',
  styleUrls: ['./customer-detail-dialog.component.scss']
})
export class CustomerDetailDialogComponent implements OnInit {
  customerDetail: CustomerDetail | null = null;
  loading = true;

  constructor(
    public dialogRef: MatDialogRef<CustomerDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { customerId: number },
    private customerService: CustomerService,
    private snackBar: MatSnackBar,
    private router: Router 
  ) { }

  ngOnInit(): void {
    this.loadCustomerDetail();
  }

  loadCustomerDetail(): void {
    this.loading = true;
    this.customerService.getCustomerDetail(this.data.customerId).subscribe({
      next: (detail) => {
        this.customerDetail = detail;
        this.loading = false;
      },
      error: (err) => {
        console.error('خطا در دریافت جزئیات مشتری:', err);
        this.snackBar.open('خطا در دریافت اطلاعات مشتری. لطفاً دوباره تلاش کنید.', 'بستن', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.loading = false;
      }
    });
  }

  close(): void {
    this.dialogRef.close(true);
  }

  // توابع کمکی برای فرمت‌دهی
  formatDate(dateString: string): string {
    if (!dateString) return 'نامشخص';
    const date = new Date(dateString);
    return date.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatPrice(price: number): string {
    if (!price) return '۰ تومان';
    return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
  }

  getFullName(): string {
    if (!this.customerDetail) return '';
    return `${this.customerDetail.firstName} ${this.customerDetail.lastName}`.trim() || 'بدون نام';
  }

  getOrderStatusClass(status: string): string {
    const map: Record<string, string> = {
      pending: 'status-pending',
      ordered: 'status-ordered',
      inProcess: 'status-processing',
      packed: 'status-packed',
      inTransit: 'status-shipped',
      delivered: 'status-delivered',
      canceled: 'status-cancelled'
    };
    return map[status] || 'status-default';
  }

  getOrderStatusText(status: string): string {
    const map: Record<string, string> = {
      pending: 'در انتظار پرداخت',
      ordered: 'ثبت شده',
      inProcess: 'در حال پردازش',
      packed: 'در حال بارگیری',
      inTransit: 'در حال ارسال',
      delivered: 'تحویل شده',
      canceled: 'لغو شده'
    };
    return map[status] || status;
  }

  getPaymentStatusClass(status: string): string {
    const map: Record<string, string> = {
      pending: 'payment-pending',
      paid: 'payment-paid',
      failed: 'payment-failed',
      refunded: 'payment-refunded'
    };
    return map[status?.toLowerCase()] || 'payment-default';
  }

  getPaymentStatusText(status: string): string {
    const map: Record<string, string> = {
      pending: 'در انتظار',
      paid: 'پرداخت شده',
      failed: 'ناموفق',
      refunded: 'بازپرداخت'
    };
    return map[status?.toLowerCase()] || status;
  }









// متد جدید: مشاهده همه سفارشات این مشتری
viewOrderDetails(orderId: number): void {
  this.dialogRef.close();
  this.router.navigate(['/order/detail', orderId], {
    queryParams: { customerId: this.data.customerId }
  });

}
}