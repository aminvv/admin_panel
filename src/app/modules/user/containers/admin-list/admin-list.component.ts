import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminService, Admin } from '../../services/admin.service';
import { AuthService } from '../../../../shared/services/auth.service';
import { AdminAddComponent } from '../admin-add/admin-add.component';
import { DeletePopupComponent } from 'src/app/shared/popups/delete-popup/delete-popup.component';

@Component({
  selector: 'app-admin-list',
  templateUrl: './admin-list.component.html',
  styleUrls: ['./admin-list.component.scss']
})
export class AdminListComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = [
    'index',
    'fullName',
    'email',
    'role',
    'isActive',
    'createdAt',
    'actions'
  ];
  dataSource = new MatTableDataSource<Admin>();
  loading = false;
  totalItems = 0;
  pageSize = 10;
  currentPage = 0;
  pageSizeOptions = [5, 10, 25, 50];
  searchTerm = '';

  totalAdmins = 0;
  activeAdmins = 0;
  superAdmins = 0;
  currentUserId: number | null = null;

  isSuperAdmin = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.isSuperAdmin = this.authService.isSuperAdmin();
     this.currentUserId = this.authService.getCurrentUser()?.id || null;
    this.loadAdmins();
  }

  ngOnDestroy(): void { }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.filterPredicate = (data: Admin, filter: string) => {
      const searchStr = (data.fullName + data.email).toLowerCase();
      return searchStr.includes(filter.toLowerCase());
    };
  }

  loadAdmins(): void {
    this.loading = true;
    this.adminService.getAdmins().subscribe({
      next: (data) => {
        const activeAdmins = data.filter(admin => !admin.deleted_at);
        this.dataSource.data = activeAdmins;
        this.totalItems = activeAdmins.length;
        this.calculateStats(activeAdmins);
        this.loading = false;
      },
      error: (err) => {
        console.error('خطا در دریافت ادمین‌ها:', err);
        this.snackBar.open('خطا در دریافت اطلاعات', 'بستن', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  calculateStats(admins: Admin[]): void {
    this.totalAdmins = admins.length;
    this.activeAdmins = admins.filter(a => a.isActive).length;
    this.superAdmins = admins.filter(a => a.role === 'superAdmin').length;
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
    const dialogRef = this.dialog.open(AdminAddComponent, {
      width: '600px',
      maxWidth: '95vw',
      data: { mode: 'add' }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadAdmins();
    });
  }

  openEditDialog(admin: Admin): void {
    const dialogRef = this.dialog.open(AdminAddComponent, {
      width: '600px',
      maxWidth: '95vw',
      data: { mode: 'edit', admin }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadAdmins();
    });
  }

  openDeleteDialog(admin: Admin): void {
    const dialogRef = this.dialog.open(DeletePopupComponent, {
      width: '400px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.adminService.deleteAdmin(admin.id).subscribe({
          next: () => {
            this.snackBar.open('ادمین با موفقیت حذف شد', 'بستن', { duration: 2000 });
            this.loadAdmins();
          },
          error: (err) => {
            console.error('خطا در حذف:', err);
            this.snackBar.open('خطا در حذف ادمین', 'بستن', { duration: 3000 });
          }
        });
      }
    });
  }

  toggleStatus(admin: Admin): void {
    const newStatus = !admin.isActive;
    this.adminService.updateAdmin(admin.id, { isActive: newStatus }).subscribe({
      next: () => {
        admin.isActive = newStatus;
        this.snackBar.open('وضعیت با موفقیت تغییر کرد', 'بستن', { duration: 2000 });
      },
      error: (err) => {
        console.error('خطا در تغییر وضعیت:', err);
        this.snackBar.open('خطا در تغییر وضعیت', 'بستن', { duration: 3000 });
      }
    });
  }

  changeRole(admin: Admin, newRole: 'admin' | 'superAdmin'): void {
    if (admin.role === newRole) return;

    const confirmMsg = `آیا از تغییر نقش "${admin.fullName}" به ${newRole === 'superAdmin' ? 'سوپر ادمین' : 'ادمین'} اطمینان دارید؟`;
    if (!confirm(confirmMsg)) return;

    this.adminService.updateAdminRole(admin.id, newRole).subscribe({
      next: () => {
        admin.role = newRole;
        this.snackBar.open('نقش با موفقیت تغییر کرد', 'بستن', { duration: 2000 });
        this.calculateStats(this.dataSource.data);
      },
      error: (err) => {
        console.error('خطا در تغییر نقش:', err);
        const errorMsg = err.error?.message || 'خطا در تغییر نقش';
        this.snackBar.open(errorMsg, 'بستن', { duration: 3000 });
      }
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('fa-IR');
  }

  getRoleLabel(role: string): string {
    return role === 'superAdmin' ? 'سوپر ادمین' : 'ادمین';
  }
} 