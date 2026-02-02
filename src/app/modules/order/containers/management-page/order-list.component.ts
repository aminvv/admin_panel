// src/app/modules/admin/orders/containers/management-page/order-list.component.ts
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { OrderService, Order, OrderStats } from '../../services/order.service';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

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
  statusFilter = '';
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
    { value: 'packed', label: 'بسته‌بندی شده', icon: 'inventory' },
    { value: 'inTransit', label: 'در حال ارسال', icon: 'local_shipping' },
    { value: 'delivered', label: 'تحویل شده', icon: 'check_circle' },
    { value: 'canceled', label: 'لغو شده', icon: 'cancel' }
  ];

  constructor(
    public orderService: OrderService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
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
  calculateStats(): void {
    this.stats = this.orderService.calculateStats(this.orders);
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
        order.address?.toLowerCase().includes(query)
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
    console.log('View order:', orderId);
    // Navigate to order detail
  }

  editOrder(orderId: number): void {
    console.log('Edit order:', orderId);
  }

  deleteOrder(orderId: number): void {
    if (confirm('آیا از حذف این سفارش اطمینان دارید؟')) {
      // Call delete API
      this.loadOrders();
    }
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

  cancelOrder(orderId: number): void {
    if (confirm('آیا از لغو این سفارش اطمینان دارید؟')) {
      this.orderService.cancelOrder(orderId).subscribe({
        next: () => {
          this.loadOrders();
        },
        error: (err) => {
          alert('خطا در لغو سفارش');
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
    alert('خروجی Excel در حال آماده‌سازی...');
  }

  printReport(): void {
    window.print();
  }

  // ============ REFRESH ============
  refresh(): void {
    this.loadOrders();
  }
}