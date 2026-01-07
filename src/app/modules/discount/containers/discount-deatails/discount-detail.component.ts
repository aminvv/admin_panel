import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DiscountService } from '../../services';
import { routes } from 'src/app/consts';

// منطق شما - سه حالت تخفیف
export enum DiscountType {
  BASKET_WITH_CODE = 'BASKET_WITH_CODE',     // سبد خرید (با کد)
  PRODUCT_WITH_CODE = 'PRODUCT_WITH_CODE',    // محصول (با کد)
  PRODUCT_WITHOUT_CODE = 'PRODUCT_WITHOUT_CODE' // محصول (بدون کد)
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
    {
      value: DiscountType.BASKET_WITH_CODE,
      label: 'تخفیف سبد خرید',
      icon: 'shopping_cart',
      description: 'تخفیف عمومی با کد برای کل سبد خرید'
    }
  ];

  minDate: Date;
  loading = false;
  isEditMode = false;
  discountId: number | null = null;
  productId: number | null = null;
  productName: string = '';
   public routes: typeof routes = routes;

  // برای نمایش در UI
  showPercentField = false;
  showAmountField = false;

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

this.discountForm.get('type')?.valueChanges
  .subscribe(type => {
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

    // پاک کردن validators قبلی
    codeControl?.clearValidators();
    productIdControl?.clearValidators();

    // تنظیم validators بر اساس نوع
    if (type === DiscountType.PRODUCT_WITHOUT_CODE) {
      // فقط برای محصولات - productId اجباری، کد اختیاری
      productIdControl?.setValidators([Validators.required, Validators.min(1)]);
    }
    else if (type === DiscountType.PRODUCT_WITH_CODE) {
      // برای محصولات با کد - هر دو اجباری
      codeControl?.setValidators([Validators.required, Validators.pattern('^[a-zA-Z0-9]+$')]);
      productIdControl?.setValidators([Validators.required, Validators.min(1)]);
    }
    else if (type === DiscountType.BASKET_WITH_CODE) {
      // برای سبد خرید - فقط کد اجباری
      codeControl?.setValidators([Validators.required, Validators.pattern('^[a-zA-Z0-9]+$')]);
      // برای سبد خرید، productId نباید داشته باشیم
      productIdControl?.setValue(null);
    }

    codeControl?.updateValueAndValidity();
    productIdControl?.updateValueAndValidity();

    // مقادیر فیلدها را بر اساس نوع به‌روزرسانی کن
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
      // اگر هیچکدام پر نبود، پیش‌فرض درصد نشان داده شود
      this.showPercentField = true;
      this.showAmountField = false;
    }
  }
loadPageData(): void {
  this.route.params.subscribe(params => {
    const productIdParam = params['productId'];
    const discountIdParam = params['discountId'];

    this.productId = null;
    this.discountId = null;
    this.isEditMode = false;

    if (productIdParam) {
      this.productId = +productIdParam;
      this.isEditMode = false;
      this.loadProductInfo();
    }

    if (discountIdParam) {
      this.discountId = +discountIdParam;
      this.isEditMode = true;
      this.loadDiscountData();
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

loadDiscountData(): void {
  if (this.discountId) {
    this.loading = true;
    
    // فراخوانی سرویس برای دریافت اطلاعات تخفیف
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
  let expiresDate: Date | null = null;
  if (discount.expires_in) {
    const date = new Date(discount.expires_in);
    if (!isNaN(date.getTime())) {
      expiresDate = date;
    }
  }

  let formType: DiscountType;
  if (discount.type === 'product') {
    formType = discount.code ? DiscountType.PRODUCT_WITH_CODE : DiscountType.PRODUCT_WITHOUT_CODE;
  } else {
    formType = DiscountType.BASKET_WITH_CODE;
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

  // اینجا اصلاح اصلی برای نمایش درست ID محصول
  if (discount.productId) {
    this.productId = discount.productId;  // مثلاً 8
    this.productName = `محصول ${discount.productId}`;  // محصول 8
    this.discountForm.get('productId')?.setValue(discount.productId);
    this.discountForm.get('productId')?.disable();
  } else if (this.productId) {
    // اگر از route آمده بود (حالت افزودن)
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
            this.toastr.error('خطا در ویرایش تخفیف');
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
            this.toastr.error('خطا در ایجاد تخفیف');
            this.loading = false;
          }
        });
      }
    } else {
      this.markFormGroupTouched(this.discountForm);
      this.toastr.error('لطفا تمام فیلدهای ضروری را پر کنید');
    }
  }
prepareFormData(): any {
  const rawData = this.discountForm.getRawValue();

  // تبدیل تاریخ به فرمت ISO
  if (rawData.expires_in) {
    rawData.expires_in = new Date(rawData.expires_in).toISOString();
  }

  // تبدیل type فرانت به type بک‌اند
  if (rawData.type === DiscountType.PRODUCT_WITH_CODE || rawData.type === DiscountType.PRODUCT_WITHOUT_CODE) {
    rawData.type = 'product';
  } else if (rawData.type === DiscountType.BASKET_WITH_CODE) {
    rawData.type = 'basket';
    delete rawData.productId; // برای سبد خرید productId نباید باشه
  }

  // حذف مقادیر null، undefined و خالی
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

  // تابع کمکی برای گرفتن توضیح نوع تخفیف
  getTypeDescription(type: DiscountType): string {
    const typeObj = this.discountTypes.find(t => t.value === type);
    return typeObj?.description || '';
  }

  // تابع کمکی برای چک کردن نمایش فیلدها
  shouldShowCodeField(): boolean {
    const type = this.discountForm.get('type')?.value;
    return type !== DiscountType.PRODUCT_WITHOUT_CODE;
  }

  shouldShowProductIdField(): boolean {
    const type = this.discountForm.get('type')?.value;
    return type !== DiscountType.BASKET_WITH_CODE;
  }

  // آیا فیلد productId فقط خواندنی است؟
  isProductIdReadonly(): boolean {
    return !!this.productId;
  }
}