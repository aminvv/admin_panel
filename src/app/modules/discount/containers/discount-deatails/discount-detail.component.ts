import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DiscountService } from '../../services';
import { routes } from 'src/app/consts';
import * as moment from 'moment-jalaali';

export enum DiscountType {
  PRODUCT_WITH_CODE = 'PRODUCT_WITH_CODE',
  PRODUCT_WITHOUT_CODE = 'PRODUCT_WITHOUT_CODE'
}

@Component({
  selector: 'app-discount-detail',
  templateUrl: './discount-detail.component.html',
  styleUrls: ['./discount-detail.component.scss']
})
export class DiscountDetailComponent implements OnInit {
  discountForm: FormGroup;
  discountTypes = [
    {
      value: DiscountType.PRODUCT_WITHOUT_CODE,
      label: 'تخفیف محصول (بدون کد)',
      icon: 'shopping_bag',
      description: 'تخفیف مستقیماً روی محصول اعمال می‌شود - نیازی به کد ندارد'
    },
    {
      value: DiscountType.PRODUCT_WITH_CODE,
      label: 'تخفیف محصول (با کد)',
      icon: 'local_offer',
      description: 'تخفیف با کد روی محصول خاص - مشتری باید کد را وارد کند'
    },
  ];

  minDate: Date;
  loading = false;
  isEditMode = false;
  discountId: number | null = null;
  productId: number | null = null;
  productName: string = '';
  public routes: typeof routes = routes;

  showPercentField = false;
  showAmountField = false;

  productDiscounts: any[] = [];
  selectedDiscountId: number | null = null;
  showDiscountList = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private discountService: DiscountService
  ) {
    this.minDate = new Date();
  }

  ngOnInit(): void {
    this.initializeForm();
    this.loadPageData();
  }

  initializeForm(): void {
    this.discountForm = this.fb.group({
      code: [''],
      type: [DiscountType.PRODUCT_WITHOUT_CODE, [Validators.required]],
      percent: [null],
      amount: [null],
      limit: [null, [Validators.min(1)]],
      expires_in: ['', [Validators.required]],
      productId: [null]
    });

    this.discountForm.get('type')?.valueChanges.subscribe(type => {
      this.handleTypeChange(type);
    });

    this.discountForm.get('percent')?.valueChanges.subscribe(() => {
      this.clearOtherValue('percent');
    });

    this.discountForm.get('amount')?.valueChanges.subscribe(() => {
      this.clearOtherValue('amount');
    });

    this.updateFieldVisibility();
  }

  handleTypeChange(type: DiscountType): void {
    const codeControl = this.discountForm.get('code');
    const productIdControl = this.discountForm.get('productId');

    codeControl?.clearValidators();
    productIdControl?.clearValidators();

    if (type === DiscountType.PRODUCT_WITHOUT_CODE) {
      productIdControl?.setValidators([Validators.required, Validators.min(1)]);
    }
    else if (type === DiscountType.PRODUCT_WITH_CODE) {
      codeControl?.setValidators([Validators.required, Validators.pattern('^[a-zA-Z0-9]+$')]);
      productIdControl?.setValidators([Validators.required, Validators.min(1)]);
    }

    codeControl?.updateValueAndValidity();
    productIdControl?.updateValueAndValidity();

    this.updateFieldVisibility();
  }

  clearOtherValue(fieldToKeep: string): void {
    if (fieldToKeep === 'percent') {
      this.discountForm.get('amount')?.setValue(null);
      this.showPercentField = true;
      this.showAmountField = false;
    } else {
      this.discountForm.get('percent')?.setValue(null);
      this.showPercentField = false;
      this.showAmountField = true;
    }
  }

  updateFieldVisibility(): void {
    const percent = this.discountForm.get('percent')?.value;
    const amount = this.discountForm.get('amount')?.value;

    if (percent) {
      this.showPercentField = true;
      this.showAmountField = false;
    } else if (amount) {
      this.showPercentField = false;
      this.showAmountField = true;
    } else {
      this.showPercentField = true;
      this.showAmountField = false;
    }
  }

  onDeleteDiscount(id: number, event: Event): void {
    event.stopPropagation();

    if (confirm('آیا از حذف این تخفیف اطمینان دارید؟')) {
      this.loading = true;
      this.discountService.deleteDiscount(id).subscribe({
        next: () => {
          this.loading = false;
          this.toastr.success('تخفیف با موفقیت حذف شد');
          this.loadProductDiscounts();
        },
        error: (error) => {
          console.error('خطا در حذف تخفیف:', error);
          this.loading = false;
          this.toastr.error('خطا در حذف تخفیف');
        }
      });
    }
  }

  loadPageData(): void {
    this.route.params.subscribe(params => {
      const productIdParam = params['productId'];
      const discountIdParam = params['discountId'];

      this.productId = null;
      this.discountId = null;
      this.isEditMode = false;
      this.selectedDiscountId = null;
      this.showDiscountList = false;

      if (productIdParam) {
        this.productId = +productIdParam;
        this.loadProductInfo();
        this.loadProductDiscounts();
      }
      else if (discountIdParam) {
        this.discountId = +discountIdParam;
        this.isEditMode = true;
        this.selectedDiscountId = this.discountId;

        this.discountService.getDiscount(this.discountId).subscribe({
          next: (discount) => {
            if (discount?.productId) {
              this.productId = discount.productId;
              this.loadProductInfo();
              this.loadProductDiscounts();
            }
            this.populateFormWithDiscountData(discount);
          },
          error: () => {
            this.toastr.error("خطا در دریافت اطلاعات تخفیف");
          }
        });
      }
    });
  }

  loadProductInfo(): void {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state as any;

    if (state?.product) {
      this.productName = state.product.title || state.product.name || 'محصول ناشناس';
      this.discountForm.get('productId')?.setValue(state.product.id);
    } else if (this.productId) {
      this.productName = `محصول ${this.productId}`;
      this.discountForm.get('productId')?.setValue(this.productId);
    }

    this.discountForm.get('productId')?.disable();
  }

  loadProductDiscounts(): void {
    if (!this.productId) {
      return;
    }

    this.loading = true;
    this.productDiscounts = [];

    this.discountService.getProductDiscounts(this.productId).subscribe({
      next: (data) => {
        this.productDiscounts = Array.isArray(data) ? [...data] : [];
        this.loading = false;
      },
      error: (err) => {
        console.error('خطا:', err);
        this.loading = false;
      }
    });
  }

  loadDiscountData(): void {
    if (this.discountId) {
      this.loading = true;

      this.discountService.getDiscount(this.discountId).subscribe({
        next: (discount) => {
          this.populateFormWithDiscountData(discount);
          this.loading = false;
        },
        error: (error) => {
          console.error('خطا در دریافت اطلاعات تخفیف:', error);
          this.toastr.error('خطا در دریافت اطلاعات تخفیف');
          this.loading = false;
          this.router.navigate(['/products']);
        }
      });
    }
  }

  populateFormWithDiscountData(discount: any): void {
    let expiresDate: string = '';

    if (discount.expires_in) {
      const m = moment(discount.expires_in);
      if (m.isValid()) {
        expiresDate = m.format('jYYYY/jMM/jDD');
      }
    }

    let formType: DiscountType;
    if (discount.type === 'product') {
      formType = discount.code ? DiscountType.PRODUCT_WITH_CODE : DiscountType.PRODUCT_WITHOUT_CODE;
    } else {
      formType = DiscountType.PRODUCT_WITHOUT_CODE;
    }

    const percentValue = discount.percent ? Number(discount.percent) : null;
    const amountValue = discount.amount ? Number(discount.amount) : null;

    this.discountForm.patchValue({
      code: discount.code || '',
      type: formType,
      percent: percentValue,
      amount: amountValue,
      limit: discount.limit || null,
      expires_in: expiresDate,
      productId: discount.productId || null
    }, { emitEvent: false });

    if (discount.productId) {
      this.productId = discount.productId;
      this.productName = `محصول ${discount.productId}`;
      this.discountForm.get('productId')?.setValue(discount.productId);
      this.discountForm.get('productId')?.disable();
    } else if (this.productId) {
      this.productName = `محصول ${this.productId}`;
      this.discountForm.get('productId')?.setValue(this.productId);
      this.discountForm.get('productId')?.disable();
    }

    if (percentValue !== null && percentValue !== undefined) {
      this.showPercentField = true;
      this.showAmountField = false;
    } else if (amountValue !== null && amountValue !== undefined) {
      this.showPercentField = false;
      this.showAmountField = true;
    } else {
      this.showPercentField = true;
      this.showAmountField = false;
    }

    this.handleTypeChange(formType);
  }

  onSelectDiscount(discount: any): void {
    this.selectedDiscountId = discount.id;
    this.isEditMode = true;
    this.discountId = discount.id;
    this.loadDiscountData();
    this.scrollToForm();
  }

  onShowDiscountList(): void {
    this.showDiscountList = true;
  }

  onCreateNewDiscount(): void {
    this.selectedDiscountId = null;
    this.discountId = null;
    this.isEditMode = false;

    this.discountForm.reset({
      type: DiscountType.PRODUCT_WITHOUT_CODE,
      productId: this.productId,
      expires_in: ''
    });
    this.handleTypeChange(DiscountType.PRODUCT_WITHOUT_CODE);
  }

  onValueTypeChange(showPercent: boolean): void {
    if (showPercent) {
      this.showPercentField = true;
      this.showAmountField = false;
      this.discountForm.get('amount')?.setValue(null);
    } else {
      this.showPercentField = false;
      this.showAmountField = true;
      this.discountForm.get('percent')?.setValue(null);
    }
  }

  onSubmit(): void {
    if (this.isEditMode && !this.discountId) {
      this.toastr.error('لطفاً یک تخفیف را برای ویرایش انتخاب کنید');
      return;
    }

    if (this.discountForm.valid) {
      const percent = this.discountForm.get('percent')?.value;
      const amount = this.discountForm.get('amount')?.value;

      if (!percent && !amount) {
        this.toastr.error('لطفا یکی از فیلدهای "درصد تخفیف" یا "مبلغ تخفیف" را پر کنید');
        return;
      }

      this.loading = true;
      const formData = this.prepareFormData();

      if (this.isEditMode && this.discountId) {
        const discountToUpdate: any = { id: this.discountId, ...formData };
        this.discountService.saveChangeddiscount(discountToUpdate).subscribe({
          next: () => {
            this.loading = false;
            this.toastr.success('تخفیف با موفقیت ویرایش شد');
            this.router.navigate([routes.MANAGEMENT]);
          },
          error: (error) => {
            console.error('خطا در ویرایش تخفیف:', error);
            this.handleError(error, 'ویرایش');
            this.loading = false;
          }
        });
      } else {
        this.discountService.creatediscount(formData).subscribe({
          next: () => {
            this.loading = false;
            this.toastr.success('تخفیف با موفقیت ایجاد شد');
            this.router.navigate([routes.MANAGEMENT]);
          },
          error: (error) => {
            console.error('خطا در ایجاد تخفیف:', error);
            this.handleError(error, 'ایجاد');
            this.loading = false;
          }
        });
      }
    } else {
      this.markFormGroupTouched(this.discountForm);
      this.toastr.error('لطفا تمام فیلدهای ضروری را پر کنید');
    }
  }

  private handleError(error: any, action: string): void {
    if (action === 'ویرایش') {
      if (error.status === 409) {
        const code = this.discountForm.get('code')?.value;
        if (code) {
          this.toastr.error(`کد تخفیف "${code}" قبلاً استفاده شده است`, 'کد تکراری');
        } else {
          this.toastr.warning('این محصول قبلاً دارای تخفیف بدون کد است!', 'تخفیف تکراری');
        }
      } else if (error.error?.message) {
        this.toastr.error(error.error.message);
      } else {
        this.toastr.error('خطا در ویرایش تخفیف');
      }
      return;
    }

    if (error.status === 409) {
      const code = this.discountForm.get('code')?.value;
      if (!code || code === '') {
        this.toastr.warning('این محصول قبلاً دارای تخفیف بدون کد است!', 'تخفیف تکراری');
      } else {
        this.toastr.error(`کد تخفیف "${code}" قبلاً استفاده شده است`, 'کد تکراری');
      }
    } else if (error.error?.message) {
      this.toastr.error(error.error.message);
    } else {
      this.toastr.error(`خطا در ${action} تخفیف`);
    }
  }

  prepareFormData(): any {
    const rawData = this.discountForm.getRawValue();

    if (rawData.expires_in && rawData.expires_in !== '') {
      const jalaliMoment = moment(rawData.expires_in, 'jYYYY/jMM/jDD');
      if (jalaliMoment.isValid()) {
        const gregorianDate = jalaliMoment.toDate();
        gregorianDate.setHours(23, 59, 59, 999);
        rawData.expires_in = gregorianDate.toISOString();
      } else {
        delete rawData.expires_in;
      }
    } else {
      delete rawData.expires_in;
    }

    if (rawData.type === DiscountType.PRODUCT_WITH_CODE || rawData.type === DiscountType.PRODUCT_WITHOUT_CODE) {
      rawData.type = 'product';
    }

    if (rawData.code === '' || rawData.code === null || rawData.code === undefined) {
      delete rawData.code;
    }

    Object.keys(rawData).forEach(key => {
      if (rawData[key] === null || rawData[key] === undefined || rawData[key] === '') {
        delete rawData[key];
      }
    });

    return rawData;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  onCancel(): void {
    this.router.navigate([routes.MANAGEMENT]);
  }

  getFieldError(fieldName: string): string {
    const field = this.discountForm.get(fieldName);

    if (!field?.errors || !field.touched) return '';

    const errors = field.errors;

    if (errors['required']) return 'این فیلد الزامی است';
    if (errors['min']) return `حداقل مقدار ${errors['min'].min} است`;
    if (errors['pattern']) return 'فقط حروف انگلیسی و اعداد مجاز است';

    return 'مقدار نامعتبر';
  }

  getTypeDescription(type: DiscountType): string {
    const typeObj = this.discountTypes.find(t => t.value === type);
    return typeObj?.description || '';
  }

  shouldShowCodeField(): boolean {
    const type = this.discountForm.get('type')?.value;
    return type === DiscountType.PRODUCT_WITH_CODE;
  }

  shouldShowProductIdField(): boolean {
    const type = this.discountForm.get('type')?.value;
    return type === DiscountType.PRODUCT_WITH_CODE || type === DiscountType.PRODUCT_WITHOUT_CODE;
  }

  isProductIdReadonly(): boolean {
    return !!this.productId;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const m = moment(dateString);
    if (!m.isValid()) return '-';
    return m.format('jYYYY/jMM/jDD');
  }

  getDiscountTypeLabel(discount: any): string {
    if (discount.type === 'product') {
      return discount.code ? 'با کد' : 'بدون کد';
    }
    return '-';
  }

  getDiscountValue(discount: any): string {
    if (discount.percent) {
      return `${discount.percent}%`;
    } else if (discount.amount) {
      return `${discount.amount.toLocaleString()} تومان`;
    }
    return '-';
  }

  isDiscountActive(discount: any): boolean {
    if (!discount.expires_in) return true;
    const now = new Date();
    const expiresDate = new Date(discount.expires_in);
    return expiresDate > now;
  }

  scrollToForm(): void {
    const formElement = document.querySelector('.discount-card');
    if (formElement) {
      formElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }
}