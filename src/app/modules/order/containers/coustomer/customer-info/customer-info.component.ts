// src/app/modules/admin/customers/components/customer-info/customer-info.component.ts

import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomerOrderListItem, CustomerService } from '../../../services/customer.service';
import { CustomerDetailDialogComponent } from '../customer-detail-dialog/customer-detail-dialog.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-customer-info',
  templateUrl: './customer-info.component.html',
  styleUrls: ['./customer-info.component.scss']
})
export class CustomerInfoComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'index',
    'orderNumber',
    'customerName',
    'address',
    'phone',
    'orderStatus',
    'paymentStatus',
    'actions'
  ];

  dataSource = new MatTableDataSource<CustomerOrderListItem>();
  loading = false;
  totalItems = 0;
  pageSize = 10;
  currentPage = 0;
  pageSizeOptions = [5, 10, 25, 50];

  searchTerm = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private customerService: CustomerService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }


  loadData(): void {
    this.loading = true;
    this.customerService.getCustomerOrderList().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.totalItems = data.length;
        this.loading = false;
      },
      error: (err) => {
        console.error('خطا در دریافت لیست سفارشات:', err);
        this.snackBar.open('خطا در دریافت اطلاعات. لطفاً دوباره تلاش کنید.', 'بستن', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.dataSource.data = [];
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    this.dataSource.filter = this.searchTerm.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
  }


  refresh(): void {
    this.searchTerm = '';
    this.dataSource.filter = '';
    this.loadData();
  }





  // ...

  openCustomerDetail(customerId: number): void {
    this.dialog.open(CustomerDetailDialogComponent, {
      width: '900px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: { customerId },
      panelClass: 'customer-detail-dialog'
    });
  }

  // ========== وضعیت سفارش ==========
  getOrderStatusClass(status: any): string {
    if (!status || typeof status !== 'string') {
      return 'status-default';
    }
    const map: Record<string, string> = {
      pending: 'status-pending',
      ordered: 'status-ordered',
      inProcess: 'status-processing',
      packed: 'status-packed',
      inTransit: 'status-shipped',
      delivered: 'status-delivered',
      canceled: 'status-cancelled'
    };
    return map[status.toLowerCase()] || 'status-default';
  }

  getOrderStatusText(status: any): string {
    if (!status || typeof status !== 'string') {
      return 'نامشخص';
    }
    const map: Record<string, string> = {
      pending: 'در انتظار پرداخت',
      ordered: 'ثبت شده',
      inProcess: 'در حال پردازش',
      packed: 'در حال بارگیری',
      inTransit: 'در حال ارسال',
      delivered: 'تحویل شده',
      canceled: 'لغو شده'
    };
    return map[status.toLowerCase()] || status;
  }

  // ========== وضعیت پرداخت ==========
getPaymentStatusClass(status: string): string {
  if (!status) return 'payment-default';
  
  const map: Record<string, string> = {
    pending: 'payment-pending',
    paid: 'payment-paid',
    success: 'payment-paid',
    failed: 'payment-failed',
    refunded: 'payment-refunded',
    unknown: 'payment-default'   // <-- اضافه شد
  };
  return map[status.toLowerCase()] || 'payment-default';
}

getPaymentStatusText(status: string): string {
  if (!status) return 'نامشخص';
  
  if (status.toLowerCase() === 'unknown') return 'نامشخص';
  
  const map: Record<string, string> = {
    pending: 'در انتظار',
    paid: 'پرداخت شده',
    success: 'پرداخت شده',
    failed: 'ناموفق',
    refunded: 'بازپرداخت'
  };
  return map[status.toLowerCase()] || status;
}


  viewOrder(orderId: number): void {
    this.router.navigate(['/order/detail', orderId]);
  }





}