import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import * as moment from 'moment-jalaali'; // برای تبدیل تاریخ

import { Payment, PaymentStatusMap } from '../../../models/payment.model';
import { PaymentService } from '../../../services/payment.service';
import { OrderService, OrderDetail } from '../../../services/order.service';
import { PaymentDetailDialogComponent } from '../payment-detail-dialog/payment-detail-dialog.component';

@Component({
  selector: 'app-payment-list',
  templateUrl: './payment-list.component.html',
  styleUrls: ['./payment-list.component.scss']
})
export class PaymentListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'invoice_number',
    'order_id',
    'products',
    'user',
    'amount',
    'status',
    'create_at',
    'actions'
  ];

  dataSource = new MatTableDataSource<Payment & { productNames?: string; productCodes?: string }>();
  private originalData: (Payment & { productNames?: string; productCodes?: string })[] = [];
  loading = false;
  totalItems = 0;
  pageSize = 10;
  currentPage = 0;
  pageSizeOptions = [5, 10, 25, 50];

  searchTerm = '';
  statusFilter: 'all' | 'success' | 'failed' = 'all';
  dateFrom: Date | null = null; // تاریخ شمسی به صورت Date (با adapter)
  dateTo: Date | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  statusMap = PaymentStatusMap;

  constructor(
    private paymentService: PaymentService,
    private orderService: OrderService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadPayments();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadPayments(): void {
    this.loading = true;
    this.paymentService.getPayments().subscribe({
      next: (payments) => {
        if (!payments || payments.length === 0) {
          this.originalData = [];
          this.dataSource.data = [];
          this.totalItems = 0;
          this.loading = false;
          return;
        }

        const orderRequests = payments.map(p => {
          if (!p.order?.id) {
            return of(null);
          }
          return this.orderService.getOrder(p.order.id).pipe(
            catchError(err => {
              console.warn(`⚠️ خطا در دریافت سفارش ${p.order.id}:`, err);
              return of(null);
            })
          );
        });

        forkJoin(orderRequests).subscribe({
          next: (orders) => {
            const enrichedPayments = payments.map((p, index) => {
              const order = orders[index] as OrderDetail | null;
              let productNames = '—';
              let productCodes = '—';

              if (order?.items && order.items.length > 0) {
                productNames = order.items
                  .map(item => item.product?.name)
                  .filter(Boolean)
                  .join('، ');
                productCodes = order.items
                  .map(item => item.product?.sku)
                  .filter(Boolean)
                  .join('، ');
              }

              return {
                ...p,
                productNames,
                productCodes
              };
            });

            this.originalData = enrichedPayments;
            this.dataSource.data = enrichedPayments;
            this.totalItems = enrichedPayments.length;
            this.loading = false;
          },
          error: (err) => {
            console.error('❌ خطای غیرمنتظره در forkJoin:', err);
            this.snackBar.open('خطا در دریافت اطلاعات محصولات.', 'بستن', { duration: 5000 });
            this.originalData = payments as any;
            this.dataSource.data = payments as any;
            this.totalItems = payments.length;
            this.loading = false;
          }
        });
      },
      error: (err) => {
        console.error('❌ خطا در دریافت پرداخت‌ها:', err);
        this.snackBar.open('خطا در دریافت اطلاعات پرداخت.', 'بستن', { duration: 5000 });
        this.originalData = [];
        this.dataSource.data = [];
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    if (!this.originalData.length) return;

    let filteredData = [...this.originalData];

    // جستجو روی همه فیلدها
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filteredData = filteredData.filter(p =>
        p.invoice_number?.toLowerCase().includes(term) ||
        p.user?.firstName?.toLowerCase().includes(term) ||
        p.user?.lastName?.toLowerCase().includes(term) ||
        p.user?.mobile?.includes(term) ||
        p.productNames?.toLowerCase().includes(term) ||
        p.productCodes?.toLowerCase().includes(term)
      );
    }

    // فیلتر وضعیت
    if (this.statusFilter !== 'all') {
      const statusBool = this.statusFilter === 'success';
      filteredData = filteredData.filter(p => p.status === statusBool);
    }

    // فیلتر تاریخ از (مقایسه با Date که از datepicker گرفته شده)
    if (this.dateFrom) {
      const from = new Date(this.dateFrom);
      from.setHours(0, 0, 0, 0);
      filteredData = filteredData.filter(p => new Date(p.create_at).getTime() >= from.getTime());
    }

    // فیلتر تاریخ تا
    if (this.dateTo) {
      const to = new Date(this.dateTo);
      to.setHours(23, 59, 59, 999);
      filteredData = filteredData.filter(p => new Date(p.create_at).getTime() <= to.getTime());
    }

    this.dataSource.data = filteredData;
    this.totalItems = filteredData.length;

    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.statusFilter = 'all';
    this.dateFrom = null;
    this.dateTo = null;
    this.dataSource.data = [...this.originalData];
    this.totalItems = this.originalData.length;
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  refresh(): void {
    this.loadPayments();
  }

  openPaymentDetail(payment: Payment): void {
    this.dialog.open(PaymentDetailDialogComponent, {
      width: '600px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: payment,
      panelClass: 'payment-detail-dialog'
    });
  }

  getStatusClass(status: boolean): string {
    return status ? 'status-success' : 'status-failed';
  }

  getStatusText(status: boolean): string {
    return status ? 'موفق' : 'ناموفق';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fa-IR') + ' ' + date.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
  }
} 