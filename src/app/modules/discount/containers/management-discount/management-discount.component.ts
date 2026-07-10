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
import * as moment from 'moment-jalaali';

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
  public minDate: Date = new Date();

  public stats = {
    active: 0,
    expired: 0,
    used: 0,
    total: 0
  };

  public searchText = '';
  public filterType = 'all';
  public filterStatus = 'all';

  public products: ProductDetails[] = [];
  public productsLoading = false;

  constructor(
    private discountService: DiscountService,
    private productService: ProductService,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnDestroy(): void {
    if (this.deleteConfirmSubscription) {
      this.deleteConfirmSubscription.unsubscribe();
    }
  }

  ngOnInit(): void {
    this.initializeForm();
    this.loadProducts();
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
      expires_day: [null, [Validators.required]],
      expires_month: [null, [Validators.required]],
      expires_year: [null, [Validators.required]],
      productId: [0]
    });

    this.discountForm.get('type')?.valueChanges.subscribe(type => {
      this.updateValidatorsBasedOnType(type);
    });

    this.discountForm.get('percent')?.valueChanges.subscribe(value => {
      const numValue = parseFloat(value);
      if (value && !isNaN(numValue) && numValue > 0) {
        this.discountForm.get('amount')?.setValue('');
      }
    });

    this.discountForm.get('amount')?.valueChanges.subscribe(value => {
      const numValue = parseFloat(value);
      if (value && !isNaN(numValue) && numValue > 0) {
        this.discountForm.get('percent')?.setValue(null);
      }
    });

    this.updateValidatorsBasedOnType('product');
  }

  private updateValidatorsBasedOnType(type: string): void {
    const codeControl = this.discountForm.get('code');
    const productIdControl = this.discountForm.get('productId');

    codeControl?.clearValidators();
    productIdControl?.clearValidators();

    if (type === 'product') {
      productIdControl?.setValidators([Validators.required, Validators.min(1)]);
      codeControl?.setValidators([Validators.maxLength(50)]);
    } else if (type === 'basket') {
      codeControl?.setValidators([Validators.required, Validators.maxLength(50)]);
    }

    codeControl?.updateValueAndValidity();
    productIdControl?.updateValueAndValidity();
  }

  private loadProducts(): void {
    this.productsLoading = true;

    this.productService.getProducts().subscribe({
      next: (products: ProductDetails[]) => {
        this.products = products;
        this.productsLoading = false;
      },
      error: (error) => {
        console.error('خطا در دریافت محصولات:', error);
        this.toastr.error('خطا در دریافت لیست محصولات');
        this.productsLoading = false;
      }
    });
  }

  getAvgUsage(): number {
    if (this.stats.total === 0) return 0;
    return this.stats.used / this.stats.total;
  }

  private loadDiscounts(preservePosition: boolean = false): void {
    const currentPage = this.paginator?.pageIndex || 0;

    this.tableLoading = true;

    this.discountService.getDiscounts().subscribe({
      next: (discounts: DiscountDetails[]) => {
        const processedDiscounts = discounts
          .map(discount => ({
            ...discount,
            percent: discount.percent ? Number(discount.percent) : null,
            usage: discount.usage || 0,
            limit: discount.limit || 0,
            productId: discount.productId || 0,
            expires_in: discount.expires_in,
          }))
          .sort((a, b) => {
            return new Date(b.expires_in).getTime() - new Date(a.expires_in).getTime();
          });

        this.dataSource.data = processedDiscounts;
        this.calculateStats(processedDiscounts);
        this.tableLoading = false;

        if (preservePosition && this.paginator) {
          setTimeout(() => {
            this.paginator.pageIndex = currentPage;
            this.dataSource.paginator = this.paginator;
          }, 50);
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
    return null;
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

  formatDate(dateInput: Date | string | null): string {
    if (!dateInput) return '—';
    const m = moment(dateInput);
    if (!m.isValid()) {
      return 'نامعتبر';
    }
    return m.format('jYYYY/jMM/jDD');
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

  getProductName(productId: number): string {
    const product = this.products.find(p => p.id === productId);
    return product?.productName || `محصول ${productId}`;
  }

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

  openCreateModal(): void {
    this.isEditMode = false;
    this.modalTitle = 'ایجاد تخفیف جدید';
    this.selectedDiscountId = null;

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

  prepareFormData(): any {
    const rawData = this.discountForm.getRawValue();

    if (rawData.expires_in) {
      const m = moment.isMoment(rawData.expires_in)
        ? rawData.expires_in
        : moment(rawData.expires_in);
      rawData.expires_in = m.format('YYYY-MM-DD');
    }
    const day = rawData.expires_day;
    const month = rawData.expires_month;
    const year = rawData.expires_year;

    if (day && month && year) {
      const gregorianMoment = moment(`${year}/${month}/${day}`, 'jYYYY/jM/jD');
      rawData.expires_in = gregorianMoment.format('YYYY-MM-DD');
    }
    delete rawData.expires_day;
    delete rawData.expires_month;
    delete rawData.expires_year;

    if (rawData.type === 'product') {
      if (!rawData.code || rawData.code.trim() === '') delete rawData.code;
      if (!rawData.productId || rawData.productId === 0) delete rawData.productId;
    } else if (rawData.type === 'basket') {
      delete rawData.productId;
      if (!rawData.code || rawData.code.trim() === '') delete rawData.code;
    }

    Object.keys(rawData).forEach(key => {
      if (rawData[key] === null || rawData[key] === undefined || rawData[key] === '') {
        delete rawData[key];
      }
    });

    if (rawData.amount === '0' || rawData.amount === 0) delete rawData.amount;
    if (rawData.percent === 0) delete rawData.percent;
    if (rawData.percent && rawData.amount) delete rawData.amount;

    return rawData;
  }

  populateFormWithDiscountData(discount: any): void {
    let expiresDate: Date | null = null;

    if (discount.expires_in) {
      const date = new Date(discount.expires_in);
      if (!isNaN(date.getTime())) {
        expiresDate = date;
      }
    }

    const percentValue = discount.percent ? Number(discount.percent) : null;
    const amountValue = discount.amount ? String(discount.amount) : '';
    const codeValue = discount.code ?? '';
    const productIdValue = discount.productId || 0;
    const limitValue = discount.limit || 0;
    const expiresInValue = expiresDate ? moment(expiresDate) : null;
    let expires_day = null, expires_month = null, expires_year = null;
    if (discount.expires_in) {
      const m = moment(discount.expires_in);
      if (m.isValid()) {
        expires_day = +m.format('jD');
        expires_month = +m.format('jM');
        expires_year = +m.format('jYYYY');
      }
    }

    this.discountForm.patchValue({
      code: codeValue,
      type: discount.type || 'product',
      percent: percentValue,
      amount: amountValue,
      limit: limitValue,
      expires_day,
      expires_month,
      expires_year,
      productId: productIdValue
    }, { emitEvent: false });

    this.updateValidatorsBasedOnType(discount.type || 'product');
  }

  openEditModal(discount: DiscountDetails): void {
    this.isEditMode = true;
    this.modalTitle = 'ویرایش تخفیف';
    this.selectedDiscountId = discount.id || null;
    this.populateFormWithDiscountData(discount);
    this.showModal = true;
  }

  openDeleteModal(id: number): void {
    const dialogRef = this.dialog.open(DeletePopupComponent, {
      width: '512px',
      data: {
        title: 'حذف تخفیف',
        message: 'آیا از حذف این تخفیف اطمینان دارید؟ این عمل قابل بازگشت نیست.'
      }
    });

    this.deleteConfirmSubscription = dialogRef.componentInstance.deleteConfirmed.subscribe(() => {
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

  onSubmit(): void {
    if (this.discountForm.invalid) {
      this.markFormGroupTouched(this.discountForm);
      this.toastr.error('لطفا تمام فیلدهای الزامی را پر کنید');
      return;
    }

    const type = this.discountForm.get('type')?.value;
    const code = this.discountForm.get('code')?.value;
    const productId = this.discountForm.get('productId')?.value;

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
      next: () => {
        this.handleSuccess('تخفیف با موفقیت ایجاد شد');
      },
      error: (error) => {
        if (error.status === 409) {
          this.toastr.warning('تخفیف تکراری!', 'امکان ایجاد تخفیف جدید وجود ندارد', { timeOut: 4000 });

          if (discountData.code) {
            this.toastr.error(`کد "${discountData.code}" قبلاً استفاده شده است`);
          } else if (discountData.type === 'product' && discountData.productId) {
            this.toastr.info('این محصول قبلاً دارای تخفیف بدون کد است. لطفاً آن را ویرایش کنید');
          }
        } else {
          this.handleError('خطا در ایجاد تخفیف', error);
        }
        this.loading = false;
      }
    });
  }

  private updateDiscount(discountData: any): void {
    if (!this.selectedDiscountId) return;

    discountData.id = this.selectedDiscountId;
    this.discountService.saveChangeddiscount(discountData).subscribe({
      next: () => {
        this.handleSuccess('تخفیف با موفقیت ویرایش شد');
      },
      error: (error) => {
        this.handleError('خطا در ویرایش تخفیف', error);
      }
    });
  }

  private deleteDiscount(id: number): void {
    this.discountService.deleteDiscount(id).subscribe({
      next: () => {
        this.toastr.success('تخفیف با موفقیت حذف شد');
        this.loadDiscounts();
      },
      error: (error) => {
        console.error('خطا در حذف تخفیف:', error);
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


  public jalaliDays: number[] = Array.from({ length: 31 }, (_, i) => i + 1);
  public jalaliMonths = [
    { value: 1, label: 'فروردین' }, { value: 2, label: 'اردیبهشت' },
    { value: 3, label: 'خرداد' }, { value: 4, label: 'تیر' },
    { value: 5, label: 'مرداد' }, { value: 6, label: 'شهریور' },
    { value: 7, label: 'مهر' }, { value: 8, label: 'آبان' },
    { value: 9, label: 'آذر' }, { value: 10, label: 'دی' },
    { value: 11, label: 'بهمن' }, { value: 12, label: 'اسفند' },
  ];
  public jalaliYears: number[] = (() => {
    const currentJYear = +moment().format('jYYYY');
    return Array.from({ length: 6 }, (_, i) => currentJYear + i);
  })();
}