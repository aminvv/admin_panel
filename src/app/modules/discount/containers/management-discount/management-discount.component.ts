// management-discount.component.ts
import { Component, OnInit, ViewChild, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DiscountService } from '../../services';
import { DiscountDetails } from '../../models/discount-details';
import { DeletePopupComponent } from '../../../../shared/popups/delete-popup/delete-popup.component';
import { ProductService } from 'src/app/modules/e-commerce/services';
import { ProductDetails } from 'src/app/modules/e-commerce/models/product-details';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-management-discount',
  templateUrl: './management-discount.component.html',
  styleUrls: ['./management-discount.component.scss']
})
export class ManagementDiscountComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private deleteConfirmSubscription!: Subscription;
  public dataSource = new MatTableDataSource<DiscountDetails>();
  public displayedColumns: string[] = [
    'code',
    'type',
    'value',
    'usage',
    'limit',
    'expires_in',
    'status',
    'actions'
  ];

  public discountForm!: FormGroup;
  public showModal = false;
  public modalTitle = 'ایجاد تخفیف جدید';
  public isEditMode = false;
  public selectedDiscountId: number | null = null;
  public loading = false;
  public tableLoading = false;

  public stats = {
    active: 0,
    expired: 0,
    used: 0,
    total: 0
  };

  public searchText = '';
  public filterType = 'all';
  public filterStatus = 'all';

  // تغییر به محصولات واقعی از ProductService

  public products: ProductDetails[] = [];
  public productsLoading = false;

  constructor(
    private discountService: DiscountService,
    private productService: ProductService, 
    private toastr: ToastrService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) { }


  ngOnDestroy(): void {
    if (this.deleteConfirmSubscription) {
      this.deleteConfirmSubscription.unsubscribe();
    }
  }


  ngOnInit(): void {
    this.initializeForm();
    this.loadProducts(); // بارگذاری محصولات از دیتابیس
    this.loadDiscounts();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  private initializeForm(): void {
    this.discountForm = this.fb.group({
      code: [''],
      type: ['product', [Validators.required]],
      percent: [null],
      amount: [''],
      limit: [0, [Validators.min(0)]],
      expires_in: ['', [Validators.required]],
      productId: [0]
    });

    this.discountForm.get('type')?.valueChanges.subscribe(type => {
      this.updateValidatorsBasedOnType(type);
    });


    this.discountForm.get('percent')?.valueChanges.subscribe(value => {
      if (value) {
        this.discountForm.get('amount')?.setValue('');
      }
    });

    this.discountForm.get('amount')?.valueChanges.subscribe(value => {
      if (value) {
        this.discountForm.get('percent')?.setValue(null);
      }
    });

    this.updateValidatorsBasedOnType('product');
  }

  private updateValidatorsBasedOnType(type: string): void {
    const codeControl = this.discountForm.get('code');
    const productIdControl = this.discountForm.get('productId');

    // پاک کردن validators قبلی
    codeControl?.clearValidators();
    productIdControl?.clearValidators();

    if (type === 'product') {
      // تخفیف محصول - کد اختیاری، productId اجباری
      productIdControl?.setValidators([Validators.required, Validators.min(1)]);
      codeControl?.setValidators([Validators.maxLength(50)]);
    } else if (type === 'basket') {
      // تخفیف سبد خرید - کد اجباری
      codeControl?.setValidators([Validators.required, Validators.maxLength(50)]);
    }

    codeControl?.updateValueAndValidity();
    productIdControl?.updateValueAndValidity();
  }

  // بارگذاری محصولات واقعی از دیتابیس
  private loadProducts(): void {
    this.productsLoading = true;

    this.productService.getProducts().subscribe({
      next: (products: ProductDetails[]) => {
        // تبدیل ProductDetails[] به {id: number, name: string}[]
        this.products = products
        this.productsLoading = false;
      },
      error: (error) => {
        console.error('خطا در دریافت محصولات از دیتابیس:', error);
        this.toastr.error('خطا در دریافت لیست محصولات');
        this.productsLoading = false;
      }
    });
  }

  private loadDiscounts(preservePosition: boolean = false): void {
    // ذخیره صفحه فعلی
    const currentPage = this.paginator?.pageIndex || 0;

    this.tableLoading = true;

    this.discountService.getDiscounts().subscribe({
      next: (discounts: DiscountDetails[]) => {
        // مرتب‌سازی: جدیدترین اول (بر اساس expires_in)
        const processedDiscounts = discounts
          .map(discount => ({
            ...discount,
            percent: discount.percent ? Number(discount.percent) : null,
            usage: discount.usage || 0,
            limit: discount.limit || 0,
            productId: discount.productId || 0,
            expires_in: new Date(discount.expires_in)
          }))
          .sort((a, b) => {
            // جدیدترین اول (بیشترین تاریخ)
            return new Date(b.expires_in).getTime() - new Date(a.expires_in).getTime();
          });

        this.dataSource.data = processedDiscounts;
        this.calculateStats(processedDiscounts);
        this.tableLoading = false;

        // اگر preservePosition true بود، صفحه قبلی رو نگه دار
        if (preservePosition && this.paginator) {
          setTimeout(() => {
            this.paginator.pageIndex = currentPage;
            this.dataSource.paginator = this.paginator;
          }, 50); // تاخیر کوتاه
        }

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('خطا در دریافت داده:', error);
        this.toastr.error('خطا در دریافت داده‌ها از سرور');
        this.tableLoading = false;
        this.cdr.detectChanges();
      }
    });
  }





  getProductImage(productId: number): string {
    const product = this.products.find(p => p.id === productId);
    if (product?.image && product.image.length > 0 && product.image[0].url) {
      return product.image[0].url;
    }

      return null

  }


  private calculateStats(discounts: DiscountDetails[]): void {
    const now = new Date();

    let active = 0;
    let expired = 0;
    let used = 0;

    discounts.forEach(discount => {
      try {
        const expiry = new Date(discount.expires_in);

        if (expiry > now) {
          if (discount.limit > 0 && discount.usage >= discount.limit) {
            // تکمیل ظرفیت
          } else {
            active++;
          }
        } else {
          expired++;
        }

        used += discount.usage;
      } catch (e) {
        console.warn('خطا در پردازش تخفیف:', discount);
      }
    });

    this.stats = {
      total: discounts.length,
      active: active,
      expired: expired,
      used: used
    };
  }

  // ==================== توابع نمایش ====================
  getStatus(discount: DiscountDetails): string {
    try {
      const now = new Date();
      const expiry = new Date(discount.expires_in);

      if (expiry < now) return 'expired';
      if (discount.limit > 0 && discount.usage >= discount.limit) return 'limit';
      return 'active';
    } catch {
      return 'expired';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'active': return 'فعال';
      case 'expired': return 'منقضی';
      case 'limit': return 'تکمیل ظرفیت';
      default: return 'نامشخص';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'active': return 'check_circle';
      case 'expired': return 'schedule';
      case 'limit': return 'block';
      default: return 'help';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active': return 'success';
      case 'expired': return 'danger';
      case 'limit': return 'warning';
      default: return 'secondary';
    }
  }

  getTypeLabel(type: string): string {
    return type === 'product' ? 'تخفیف محصول' : 'تخفیف سبد خرید';
  }

  getTypeIcon(type: string): string {
    return type === 'product' ? 'inventory_2' : 'shopping_cart';
  }

  getTypeColor(type: string): string {
    return type === 'product' ? 'primary' : 'success';
  }

  getValueDisplay(discount: DiscountDetails): string {
    if (discount.percent && discount.percent > 0) {
      return `${discount.percent}%`;
    } else if (discount.amount) {
      const amountNum = parseFloat(discount.amount);
      return !isNaN(amountNum) ? `${amountNum.toLocaleString('fa-IR')} تومان` : '---';
    }
    return '---';
  }

  formatDate(date: Date): string {
    try {
      return new Date(date).toLocaleDateString('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'تاریخ نامعتبر';
    }
  }

  getRemainingDays(date: Date): string {
    try {
      const now = new Date();
      const expiry = new Date(date);
      const diffTime = expiry.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) return 'منقضی شده';
      if (diffDays === 0) return 'امروز';
      if (diffDays === 1) return 'فردا';
      if (diffDays < 30) return `${diffDays} روز دیگر`;

      const diffMonths = Math.floor(diffDays / 30);
      return `${diffMonths} ماه دیگر`;
    } catch {
      return '---';
    }
  }

  getUsagePercentage(discount: DiscountDetails): number {
    if (!discount.limit || discount.limit === 0) return 0;
    return Math.min((discount.usage / discount.limit) * 100, 100);
  }

  // این تابع تغییر نکرده، فقط products از دیتابیس می‌آید
  getProductName(productId: number): string {
    const product = this.products.find(p => p.id === productId);
    return product?.productName || `محصول ${productId}`;
  }

  // ==================== فیلترینگ ====================
  applyFilter(): void {
    let filteredData = this.dataSource.data;

    if (this.filterStatus !== 'all') {
      filteredData = filteredData.filter(discount => {
        return this.getStatus(discount) === this.filterStatus;
      });
    }

    if (this.filterType !== 'all') {
      filteredData = filteredData.filter(discount => discount.type === this.filterType);
    }

    if (this.searchText) {
      const searchLower = this.searchText.toLowerCase();
      filteredData = filteredData.filter(discount =>
        (discount.code || '').toLowerCase().includes(searchLower) ||
        this.getTypeLabel(discount.type).toLowerCase().includes(searchLower) ||
        this.getProductName(discount.productId).toLowerCase().includes(searchLower)
      );
    }

    this.dataSource.data = filteredData;
  }

  clearFilters(): void {
    this.searchText = '';
    this.filterType = 'all';
    this.filterStatus = 'all';
    this.loadDiscounts();
    this.toastr.success('فیلترها پاک شدند');
  }

  // ==================== عملیات CRUD ====================
  openCreateModal(): void {
    this.isEditMode = false;
    this.modalTitle = 'ایجاد تخفیف جدید';
    this.selectedDiscountId = null;

    // اگر محصولات هنوز لود نشده، لود کنیم
    if (this.products.length === 0 && !this.productsLoading) {
      this.loadProducts();
    }

    this.discountForm.reset({
      code: '',
      type: 'product',
      percent: null,
      amount: '',
      limit: 0,
      expires_in: '',
      productId: 0
    });

    this.showModal = true;
  }

  // تغییر در متد prepareFormData
  private prepareFormData(): any {
    const formValue = this.discountForm.getRawValue();

    const payload: any = {
      type: formValue.type,
      limit: formValue.limit || 0,
      expires_in: new Date(formValue.expires_in).toISOString()
    };

    // ارسال کد - مهمترین تغییر اینجاست
    if (formValue.code !== undefined && formValue.code !== null) {
      if (formValue.code.trim() === '') {
        // اگر کد خالی است، null ارسال کن
        payload.code = null;
      } else {
        // اگر کد دارد، trim شده ارسال کن
        payload.code = formValue.code.trim();
      }
    } else {
      // اگر کد undefined یا null است
      payload.code = null;
    }

    // ارسال productId - فقط برای تخفیف محصول
    if (formValue.type === 'product') {
      payload.productId = formValue.productId || null;
    } else {
      // برای سبد خرید، productId باید null باشد
      payload.productId = null;
    }

    // مقدار تخفیف
    if (formValue.percent && formValue.percent > 0) {
      payload.percent = formValue.percent.toString();
      payload.amount = null;
    } else if (formValue.amount && formValue.amount.trim() !== '') {
      payload.amount = formValue.amount;
      payload.percent = null;
    } else {
      // اگر هیچکدام پر نشده
      payload.percent = null;
      payload.amount = null;
    }

    console.log('Payload for save:', payload);
    return payload;
  }
  // همچنین در متد openEditModal این تغییر را اعمال کنید:
  openEditModal(discount: DiscountDetails): void {
    this.isEditMode = true;
    this.modalTitle = 'ویرایش تخفیف';
    this.selectedDiscountId = discount.id || null;

    let formattedDate = '';
    try {
      const expiryDate = new Date(discount.expires_in);
      formattedDate = expiryDate.toISOString().slice(0, 16);
    } catch (error) {
      console.error('خطا در فرمت تاریخ:', error);
    }

    // پر کردن فرم - بسیار مهم: کد را دقیقاً به همان صورت که از سرور آمده قرار دهید
    this.discountForm.patchValue({
      code: discount.code === null ? '' : discount.code, // این خط بسیار مهم است
      type: discount.type || 'product',
      percent: discount.percent || null,
      amount: discount.amount || '',
      limit: discount.limit || 0,
      expires_in: formattedDate,
      productId: discount.productId || 0
    });

    // validators را بر اساس نوع به‌روزرسانی کن
    this.updateValidatorsBasedOnType(discount.type || 'product');

    this.showModal = true;
  }

  openDeleteModal(id: number): void {
    console.log('🔴 openDeleteModal فراخوانی شد! ID:', id);

    const dialogRef = this.dialog.open(DeletePopupComponent, {
      width: '512px',
      data: {
        title: 'حذف تخفیف',
        message: 'آیا از حذف این تخفیف اطمینان دارید؟ این عمل قابل بازگشت نیست.'
      }
    });

    // این خط مهمه
    this.deleteConfirmSubscription = dialogRef.componentInstance.deleteConfirmed.subscribe(() => {
      console.log('🟢 Event deleteConfirmed دریافت شد');
      this.deleteDiscount(id);
    });
  }

  copyToClipboard(text: string): void {
    if (!text) {
      this.toastr.warning('کد تخفیفی برای کپی وجود ندارد');
      return;
    }

    navigator.clipboard.writeText(text).then(() => {
      this.toastr.success(`کد "${text}" در کلیپ‌بورد کپی شد`);
    }).catch(err => {
      console.error('خطا در کپی کردن:', err);
      this.toastr.error('خطا در کپی کردن کد');
    });
  }

  // ==================== متد onSubmit ====================
  onSubmit(): void {
    if (this.discountForm.invalid) {
      this.markFormGroupTouched(this.discountForm);
      this.toastr.error('لطفا تمام فیلدهای الزامی را پر کنید');
      return;
    }

    const type = this.discountForm.get('type')?.value;
    const code = this.discountForm.get('code')?.value;
    const productId = this.discountForm.get('productId')?.value;

    // اعتبارسنجی خاص بر اساس نوع
    if (type === 'basket' && (!code || code.trim() === '')) {
      this.toastr.error('برای تخفیف سبد خرید، کد الزامی است');
      return;
    }

    if (type === 'product' && (!productId || productId === 0)) {
      this.toastr.error('برای تخفیف محصول، انتخاب محصول الزامی است');
      return;
    }

    const percent = this.discountForm.get('percent')?.value;
    const amount = this.discountForm.get('amount')?.value;

    if (!percent && !amount) {
      this.toastr.error('لطفا یکی از فیلدهای "درصد تخفیف" یا "مبلغ تخفیف" را پر کنید');
      return;
    }

    this.loading = true;
    const formData = this.prepareFormData();

    if (this.isEditMode && this.selectedDiscountId) {
      this.updateDiscount(formData);
    } else {
      this.createDiscount(formData);
    }
  }



  private createDiscount(discountData: any): void {
    this.discountService.creatediscount(discountData).subscribe({
      next: (response) => {
        this.handleSuccess('تخفیف با موفقیت ایجاد شد');
      },
      error: (error) => {
        this.handleError('خطا در ایجاد تخفیف', error);
      }
    });
  }

  private updateDiscount(discountData: any): void {
    if (!this.selectedDiscountId) return;

    discountData.id = this.selectedDiscountId;
    this.discountService.saveChangeddiscount(discountData).subscribe({
      next: (response) => {
        this.handleSuccess('تخفیف با موفقیت ویرایش شد');
      },
      error: (error) => {
        this.handleError('خطا در ویرایش تخفیف', error);
      }
    });
  }

  private deleteDiscount(id: number): void {
    console.log('🔴 deleteDiscount شروع شد. ID:', id);

    this.discountService.deleteDiscount(id).subscribe({
      next: (response) => {
        console.log('🟢 پاسخ موفق از سرور:', response);
        this.toastr.success('تخفیف با موفقیت حذف شد');
        this.loadDiscounts();
      },
      error: (error) => {
        console.error('🔴 خطای کامل:', {
          name: error.name,
          message: error.message,
          status: error.status,
          statusText: error.statusText,
          error: error.error,
          url: error.url
        });
        this.toastr.error('خطا در حذف تخفیف');
      }
    });
  }

  private handleSuccess(message: string): void {
    this.toastr.success(message);
    this.showModal = false;
    this.loadDiscounts();
    this.loading = false;
  }

  private handleError(defaultMessage: string, error: any): void {
    console.error('خطا در عملیات:', error);
    const errorMessage = error?.error?.message || defaultMessage;
    this.toastr.error(errorMessage);
    this.loading = false;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  closeModal(): void {
    this.showModal = false;
    this.discountForm.reset();
  }

  trackById(index: number, discount: DiscountDetails): number {
    return discount.id || index;
  }

  onPercentChange(): void {
    if (this.discountForm.get('percent')?.value) {
      this.discountForm.get('amount')?.setValue('');
    }
  }

  onAmountChange(): void {
    if (this.discountForm.get('amount')?.value) {
      this.discountForm.get('percent')?.setValue(null);
    }
  }

  shouldShowProductField(): boolean {
    return this.discountForm.get('type')?.value === 'product';
  }
}