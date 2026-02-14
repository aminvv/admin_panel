import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OrderService, OrderDetail } from '../../services/order.service';
import { DeletePopupComponent } from 'src/app/shared/popups/delete-popup/delete-popup.component';




@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss']
})
export class OrderDetailComponent implements OnInit {
  orderId!: number;
  order: OrderDetail | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    public orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.orderId = +params['id'];
      this.loadOrder();
    });
  }

loadOrder(): void {
  this.loading = true;
  this.error = null;
  
  this.orderService.getOrder(this.orderId).subscribe({
    next: (order) => {
      console.log('✅ سفارش بارگذاری شد:', order);
      console.log('📦 آیتم‌ها:', order.items);
      
      this.order = order;
      this.loading = false;
    },
    error: (err) => {
      console.error('❌ خطا:', err);
      this.error = 'خطا در دریافت اطلاعات سفارش';
      this.loading = false;
      this.showError(this.error);
    }
  });
}

// اضافه کردن متد برای گرفتن تصویر
getImageUrl(item: any): string {
  if (!item?.product?.image) {
    return 'https://via.placeholder.com/100x100/cccccc/969696?text=محصول';
  }
  
  const image = item.product.image;
  
  // اگر image یک آرایه است
  if (Array.isArray(image) && image.length > 0) {
    return image[0]?.url || image[0]?.path || image[0]?.src || 
           'https://via.placeholder.com/100x100/cccccc/969696?text=محصول';
  }
  
  // اگر image یک رشته است
  if (typeof image === 'string') {
    return image;
  }
  
  // اگر شیء است
  if (typeof image === 'object') {
    return image.url || image.path || image.src || 
           'https://via.placeholder.com/100x100/cccccc/969696?text=محصول';
  }
  
  return 'https://via.placeholder.com/100x100/cccccc/969696?text=محصول';
}






















  formatDate(dateString?: string): string {
    if (!dateString) return 'نامشخص';
    return this.orderService.formatDate(dateString);
  }

  formatPrice(price?: number): string {
    if (!price) return '۰ تومان';
    return this.orderService.formatPrice(price);
  }

  getCustomerName(user?: any): string {
    if (!user) return 'نامشخص';
    const name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    return name || user.mobile || 'نامشخص';
  }

  getStatusLabel(status?: string): string {
    if (!status) return 'نامشخص';
    return this.orderService.getStatusLabel(status);
  }

  getStatusColor(status?: string): string {
    if (!status) return '';
    return this.orderService.getStatusColor(status);
  }

  getStatusIcon(status?: string): string {
    if (!status) return 'help';
    return this.orderService.getStatusIcon(status);
  }

  // Actions
  onBack(): void {
    this.router.navigate(['/order/list']);
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

  onAdvanceStatus(): void {
    this.orderService.advanceStatus(this.orderId).subscribe({
      next: () => {
        this.showSuccess('وضعیت سفارش تغییر کرد');
        this.loadOrder();
      },
      error: (err) => {
        this.showError(err.error?.message || 'خطا در تغییر وضعیت');
      }
    });
  }

  onRevertStatus(): void {
    this.orderService.revertStatus(this.orderId).subscribe({
      next: () => {
        this.showSuccess('وضعیت سفارش بازگشت داده شد');
        this.loadOrder();
      },
      error: (err) => {
        this.showError(err.error?.message || 'خطا در بازگشت وضعیت');
      }
    });
  }




  onViewCustomer(): void {
    if (this.order?.user?.id) {
      this.router.navigate(['/user', this.order.user.id]);
    }
  }






// خروجی Excel سفارش
onExportExcel(): void {
  if (!this.order?.id) return;
  
  // نیاز به endpoint جدید در بک‌اند: GET /admin/orders/{id}/export/excel
  this.orderService.exportOrderExcel(this.order.id).subscribe({
    next: () => {
      this.showSuccess('Excel سفارش دانلود شد');
    },
    error: (err) => {
      this.showError('خطا در ایجاد Excel');
    }
  });
}






  onRefresh(): void {
    this.loadOrder();
  }

  // Helper Checks
  canCancelOrder(): boolean {
    return this.orderService.canCancel(this.order?.status || '');
  }

  canAdvanceStatus(): boolean {
    return this.orderService.canAdvance(this.order?.status || '');
  }

  canRevertStatus(): boolean {
    return this.orderService.canRevert(this.order?.status || '');
  }

  // Snackbar Helpers
  private showSuccess(message: string): void {
    this.snackBar.open(`✅ ${message}`, 'بستن', {
      duration: 3000,
      verticalPosition: 'top'
    });
  }

  private showError(message: string): void {
    this.snackBar.open(`❌ ${message}`, 'بستن', {
      duration: 4000,
      verticalPosition: 'top'
    });
  }

  private showWarning(message: string): void {
    this.snackBar.open(`⚠️ ${message}`, 'بستن', {
      duration: 3000,
      verticalPosition: 'top'
    });
  }

  private showInfo(message: string): void {
    this.snackBar.open(`ℹ️ ${message}`, 'بستن', {
      duration: 2000,
      verticalPosition: 'top'
    });
  }






  
}