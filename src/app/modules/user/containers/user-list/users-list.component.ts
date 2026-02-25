import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService, User } from '../../services/user.service';
import { UserAddComponent } from '../user-add/user-add.component';
import { DeletePopupComponent } from 'src/app/shared/popups/delete-popup/delete-popup.component';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  displayedColumns: string[] = [
    'index',
    'fullName',
    'mobile',
    'address',          // ستون آدرس
    'lastLogin',         // ستون آخرین ورود
    'role',
    'createdAt',
    'actions'
  ];
  dataSource = new MatTableDataSource<User>();
  loading = false;
  totalItems = 0;
  pageSize = 10;
  currentPage = 0;
  pageSizeOptions = [5, 10, 25, 50];
  searchTerm = '';

  // آمار کاربران
  totalUsers = 0;
  activeToday = 0;
  newThisMonth = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private userService: UserService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.filterPredicate = (data: User, filter: string) => {
      const searchStr = (
        data.firstName + ' ' + data.lastName + data.mobile +
        (data.addresses?.[0]?.city || '') + (data.addresses?.[0]?.street || '')
      ).toLowerCase();
      return searchStr.includes(filter.toLowerCase());
    };
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getUsers().subscribe({
      next: (data) => {
        const activeUsers = data.filter(user => !user.deleted_at);
        this.dataSource.data = activeUsers;
        this.totalItems = activeUsers.length;
        this.calculateStats(activeUsers);
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('خطا در دریافت اطلاعات', 'بستن', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  calculateStats(users: User[]): void {
    this.totalUsers = users.length;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    this.activeToday = users.filter(u => {
      if (!u.last_login) return false;
      const lastLogin = new Date(u.last_login).getTime();
      return lastLogin >= today;
    }).length;

    this.newThisMonth = users.filter(u => {
      const createdAt = new Date(u.create_at).getTime();
      return createdAt >= firstDayOfMonth;
    }).length;
  }

  applyFilter(): void {
    this.dataSource.filter = this.searchTerm.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(UserAddComponent, {
      width: '600px',
      maxWidth: '95vw',
      data: { mode: 'add' }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadUsers();
    });
  }

  openEditDialog(user: User): void {
    const dialogRef = this.dialog.open(UserAddComponent, {
      width: '600px',
      maxWidth: '95vw',
      data: { mode: 'edit', user }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadUsers();
    });
  }

  openDeleteDialog(user: User): void {
    const dialogRef = this.dialog.open(DeletePopupComponent, {
      width: '400px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.userService.deleteUser(user.id).subscribe({
          next: () => {
            this.snackBar.open('کاربر با موفقیت حذف شد', 'بستن', { duration: 2000 });
            this.loadUsers();
          },
          error: () => {
            this.snackBar.open('خطا در حذف کاربر', 'بستن', { duration: 3000 });
          }
        });
      }
    });
  }




  // داخل user-list.component.ts
  getFullAddress(user: User): string {
    if (!user.addresses || user.addresses.length === 0) {
      return 'آدرسی ثبت نشده';
    }
    const addr = user.addresses.find(a => a.isDefault) || user.addresses[0];
    return `${addr.province}، ${addr.city}، ${addr.street}${addr.plaque ? '، پلاک ' + addr.plaque : ''} - کدپستی: ${addr.postalCode}`;
  }

  // توابع کمکی
  getPrimaryAddress(user: User): string {
    if (!user.addresses || user.addresses.length === 0) {
      return '—';
    }
    // اگر آدرس پیش‌فرض وجود دارد، آن را نشان بده
    const defaultAddr = user.addresses.find(a => a.isDefault);
    const addr = defaultAddr || user.addresses[0];
    return `${addr.city}، ${addr.street}`;
  }

  formatLastLogin(dateString?: string): string {
    if (!dateString) return '—';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'چند لحظه پیش';
    if (diffMins < 60) return `${diffMins} دقیقه پیش`;
    if (diffHours < 24) return `${diffHours} ساعت پیش`;
    if (diffDays === 1) return 'دیروز';
    return date.toLocaleDateString('fa-IR');
  }

  maskMobile(mobile: string): string {
    if (!mobile) return '—';
    return mobile.replace(/(\d{2})\d+(\d{2})/, '$1****$2');
  }

  formatDate(dateString: string): string {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('fa-IR');
  }

  getUserStatus(lastLogin?: string): 'online' | 'offline' {
    if (!lastLogin) return 'offline';
    const diff = Date.now() - new Date(lastLogin).getTime();
    return diff < 5 * 60 * 1000 ? 'online' : 'offline'; // 5 دقیقه
  }
}