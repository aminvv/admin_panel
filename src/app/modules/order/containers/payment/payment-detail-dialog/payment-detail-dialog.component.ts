import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Payment } from '../../../models/payment.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payment-detail-dialog',
  templateUrl: './payment-detail-dialog.component.html',
  styleUrls: ['./payment-detail-dialog.component.scss']
})
export class PaymentDetailDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<PaymentDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public payment: Payment,
    private router: Router,
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  viewOrder(orderId: number): void {
    this.close();
    this.router.navigate(['/order/detail', orderId]);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fa-IR') + ' ' + date.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
  }

  getStatusText(status: boolean): string {
    return status ? 'موفق' : 'ناموفق';
  }

  // تابع ترجمه وضعیت سفارش
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

  // در صورت نبود نام، مقدار پیش‌فرض
  get fullName(): string {
    if (!this.payment.user) return '—';
    const firstName = this.payment.user.firstName || '';
    const lastName = this.payment.user.lastName || '';
    return (firstName + ' ' + lastName).trim() || 'بدون نام';
  }
}