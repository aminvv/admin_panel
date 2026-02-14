// src/app/modules/admin/orders/containers/management-page/order-list.component.ts
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { OrderService, Order, OrderStats } from '../../services/order.service';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as XLSX from 'xlsx';


@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss']
})
export class OrderListComponent implements OnInit, AfterViewInit {
  // ============ TABLE SETUP ============
  displayedColumns: string[] = [
    'select',
    'id',
    'customer',
    'date',
    'amount',
    'status',
    'payment',
    'actions'
  ];

  dataSource = new MatTableDataSource<Order>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // ============ DATA ============
  orders: Order[] = [];
  loading = true;
  error: string | null = null;

  // ============ STATS ============
  stats: OrderStats = {
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    revenue: 0
  };

  // ============ FILTERS ============
  statusFilter = 'all';
  searchQuery = '';
  dateFrom = '';
  dateTo = '';

  // ============ SELECTION ============
  selectedOrders = new Set<number>();
  isAllSelected = false;

  // ============ PAGINATION ============
  pageSize = 10;
  pageSizeOptions = [5, 10, 20, 50];

  // ============ MODAL STATE ============
  selectedOrderForFlow: Order | null = null;
  showStatusFlowModal = false;

  // ============ STATUS OPTIONS ============
  statusOptions = [
    { value: '', label: 'همه وضعیت‌ها', icon: 'list' },
    { value: 'pending', label: 'در انتظار پرداخت', icon: 'pending' },
    { value: 'ordered', label: 'ثبت شده', icon: 'verified' },
    { value: 'inProcess', label: 'در حال پردازش', icon: 'settings' },
    { value: 'packed', label: 'در حال بارگیری', icon: 'forklift' },
    { value: 'inTransit', label: 'در حال ارسال', icon: 'local_shipping' },
    { value: 'delivered', label: 'تحویل شده', icon: 'check_circle' },
    { value: 'canceled', label: 'لغو شده', icon: 'cancel' }
  ];

  constructor(
    public orderService: OrderService,
    private dialog: MatDialog,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadOrders();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }




  getStatusIcon(statusValue: string): string {
    const status = this.statusOptions.find(s => s.value === statusValue);
    return status ? status.icon : '';
  }

  getStatusLabel(statusValue: string): string {
    const status = this.statusOptions.find(s => s.value === statusValue);
    return status ? status.label : '';
  }

  // ============ LOAD ORDERS ============
  loadOrders(): void {
    this.loading = true;
    this.error = null;

    const filters: any = {};
    if (this.statusFilter) filters.status = this.statusFilter;
    if (this.searchQuery) filters.search = this.searchQuery;

    this.orderService.getOrders(filters).subscribe({
      next: (data) => {
        this.orders = data;
        this.dataSource.data = data;
        this.calculateStats();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading orders:', err);
        this.error = 'خطا در دریافت سفارشات';
        this.loading = false;
      }
    });
  }

  // ============ CALCULATE STATS ============
  // در order-list.component.ts
  calculateStats(): void {
    console.log('Orders for stats calculation:', this.orders);

    this.stats = {
      total: this.orders.length,
      pending: this.orders.filter(o => o.status === 'pending').length,
      processing: this.orders.filter(o => o.status === 'inProcess' || o.status === 'ordered').length,
      shipped: this.orders.filter(o => o.status === 'inTransit').length,
      delivered: this.orders.filter(o => o.status === 'delivered').length,
      cancelled: this.orders.filter(o => o.status === 'canceled').length,
      revenue: this.orders
        .filter(o => o.status === 'delivered')
        .reduce((sum, order) => sum + (order.final_amount || 0), 0)
    };

    console.log('Calculated stats:', this.stats);
  }

  // ============ FILTER METHODS ============
  applyFilter(): void {
    let filtered = this.orders;

    // Filter by status
    if (this.statusFilter) {
      filtered = filtered.filter(order => order.status === this.statusFilter);
    }

    // Filter by search
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(order =>
        order.id.toString().includes(query) ||
        order.user?.mobile?.includes(query) ||
        (order.user?.firstName + ' ' + order.user?.lastName)?.toLowerCase().includes(query) ||
        order.street?.toLowerCase().includes(query)
      );
    }

    this.dataSource.data = filtered;
    this.selectedOrders.clear();
    this.isAllSelected = false;
  }

  resetFilters(): void {
    this.statusFilter = '';
    this.searchQuery = '';
    this.dateFrom = '';
    this.dateTo = '';
    this.loadOrders();
  }

  // ============ SELECTION METHODS ============
  toggleOrderSelection(orderId: number): void {
    if (this.selectedOrders.has(orderId)) {
      this.selectedOrders.delete(orderId);
    } else {
      this.selectedOrders.add(orderId);
    }
    this.updateSelectAllState();
  }

  toggleSelectAll(): void {
    if (this.isAllSelected) {
      this.currentPageOrders.forEach(order => {
        this.selectedOrders.add(order.id);
      });
    } else {
      this.selectedOrders.clear();
    }
  }

  updateSelectAllState(): void {
    if (this.currentPageOrders.length === 0) {
      this.isAllSelected = false;
      return;
    }

    this.isAllSelected = this.currentPageOrders.every(order =>
      this.selectedOrders.has(order.id)
    );
  }

  // ============ ORDER ACTIONS ============
  viewOrder(orderId: number): void {
    this.router.navigate(['/order/detail', orderId]);
  }



  cancelOrder(orderId: number): void {
    console.log('Cancel order clicked for ID:', orderId);

    if (confirm('آیا از لغو این سفارش اطمینان دارید؟')) {
      console.log('Calling orderService.cancelOrder...');

      this.orderService.cancelOrder(orderId).subscribe({
        next: (response) => {
          console.log('Cancel order successful:', response);
          this.snackBar.open('✅ سفارش با موفقیت لغو شد', 'بستن', {
            duration: 3000,
            verticalPosition: 'top',
            panelClass: 'success-snackbar'
          });
          this.loadOrders();
        },
        error: (err) => {
          console.error('Cancel order error:', err);
          console.error('Error details:', err.status, err.message, err.error);

          let errorMessage = 'خطا در لغو سفارش';
          if (err.error?.message) {
            errorMessage = err.error.message;
          } else if (err.status === 404) {
            errorMessage = 'سفارش یافت نشد';
          } else if (err.status === 400) {
            errorMessage = 'سفارش قابل لغو نیست';
          }

          this.snackBar.open(`❌ ${errorMessage}`, 'بستن', {
            duration: 4000,
            verticalPosition: 'top',
            panelClass: 'error-snackbar'
          });
        },
        complete: () => {
          console.log('Cancel order observable completed');
        }
      });
    }
  }


  printInvoice(orderId: number): void {
    this.orderService.printInvoice(orderId).subscribe({
      next: () => {
        console.log('Invoice opened for printing');
      },
      error: (err) => {
        this.snackBar.open('❌ خطا در چاپ فاکتور', 'بستن', {
          duration: 3000,
          verticalPosition: 'top'
        });
      }
    });
  }
  downloadInvoice(orderId: number): void {
    this.orderService.downloadInvoice(orderId).subscribe({
      next: () => {
        this.snackBar.open('✅ فاکتور دانلود شد', 'بستن', {
          duration: 3000,
          verticalPosition: 'top'
        });
      },
      error: (err) => {
        this.snackBar.open('❌ خطا در دانلود فاکتور', 'بستن', {
          duration: 3000,
          verticalPosition: 'top'
        });
      }
    });
  }









  advanceOrder(orderId: number): void {
    if (confirm('آیا از تغییر وضعیت سفارش به مرحله بعد اطمینان دارید؟')) {
      this.orderService.advanceStatus(orderId).subscribe({
        next: () => {
          this.loadOrders();
        },
        error: (err) => {
          alert('خطا در تغییر وضعیت');
        }
      });
    }
  }

  revertOrder(orderId: number): void {
    if (confirm('آیا از بازگشت وضعیت سفارش اطمینان دارید؟')) {
      this.orderService.revertStatus(orderId).subscribe({
        next: () => {
          this.loadOrders();
        },
        error: (err) => {
          alert('خطا در بازگشت وضعیت');
        }
      });
    }
  }



  // ============ STATUS FLOW MODAL ============
  openStatusFlow(order: Order): void {
    this.selectedOrderForFlow = order;
    this.showStatusFlowModal = true;
  }

  closeStatusFlow(): void {
    this.selectedOrderForFlow = null;
    this.showStatusFlowModal = false;
    this.loadOrders(); // Refresh list after status change
  }

  // ============ BULK ACTIONS ============
  bulkCancel(): void {
    if (this.selectedOrders.size === 0) {
      alert('لطفاً حداقل یک سفارش را انتخاب کنید');
      return;
    }

    if (confirm(`آیا از لغو ${this.selectedOrders.size} سفارش انتخاب شده اطمینان دارید؟`)) {
      // Implement bulk cancel
      this.selectedOrders.clear();
      this.isAllSelected = false;
    }
  }

  bulkExport(): void {
    if (this.selectedOrders.size === 0) {
      alert('لطفاً حداقل یک سفارش را انتخاب کنید');
      return;
    }

    alert(`خروجی ${this.selectedOrders.size} سفارش در حال آماده‌سازی...`);
    // Implement export
  }

  // ============ HELPER METHODS ============
  get currentPageOrders(): Order[] {
    const startIndex = (this.dataSource.paginator?.pageIndex || 0) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.dataSource.filteredData.slice(startIndex, endIndex);
  }

  getCustomerName(user: any): string {
    if (!user) return 'نامشخص';
    const name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    return name || user.mobile || 'نامشخص';
  }

  getShortAddress(address: string): string {
    if (!address) return 'آدرس ندارد';
    return address.length > 30 ? address.substring(0, 30) + '...' : address;
  }

  // ============ EXPORT & PRINT ============
exportToExcel(): void {
  const data = this.orders.map(order => ({
    'شماره': order.id,
    'مشتری': this.getCustomerName(order.user),
    'تلفن': order.user?.mobile || '',
    'تاریخ': this.orderService.formatDate(order.create_at),
    'آدرس': order.street,
    'مبلغ کل': order.total_amount,
    'تخفیف': order.discount_amount,
    'مبلغ نهایی': order.final_amount,
    'وضعیت': this.getStatusLabel(order.status)
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'سفارشات');
  XLSX.writeFile(workbook, 'orders-report.xlsx');
  
  this.snackBar.open('✅ گزارش Excel دانلود شد', 'بستن', {
    duration: 3000,
    verticalPosition: 'top'
  });
}

// در order-list.component.ts
printReport(): void {
  // ساخت HTML برای پرینت
  const printContent = this.generatePrintHTML();
  
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  }
}

private generatePrintHTML(): string {
  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="fa">
    <head>
      <meta charset="UTF-8">
      <title>گزارش سفارشات</title>
      <style>
        body { font-family: Tahoma, Arial; padding: 20px; }
        h1 { text-align: center; margin-bottom: 30px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #000; padding: 8px; text-align: center; }
        th { background-color: #f2f2f2; }
        @media print {
          button { display: none; }
        }
      </style>
    </head>
    <body>
      <h1>گزارش سفارشات</h1>
      <p>تعداد: ${this.orders.length} سفارش</p>
      <p>تاریخ گزارش: ${new Date().toLocaleDateString('fa-IR')}</p>
      
      <table>
        <thead>
          <tr>
            <th>شماره</th>
            <th>مشتری</th>
            <th>تاریخ</th>
            <th>مبلغ</th>
            <th>وضعیت</th>
          </tr>
        </thead>
        <tbody>
          ${this.orders.map(order => `
            <tr>
              <td>${order.id}</td>
              <td>${this.getCustomerName(order.user)}</td>
              <td>${this.orderService.formatDate(order.create_at)}</td>
              <td>${this.orderService.formatPrice(order.final_amount)}</td>
              <td>${this.getStatusLabel(order.status)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;
}

  // ============ REFRESH ============
  refresh(): void {
    this.loadOrders();
  }
}