import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

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
  
  // برای نمایش در UI
  showPercentField = false;
  showAmountField = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
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

    // مدیریت تغییرات نوع تخفیف
    this.discountForm.get('type')?.valueChanges.subscribe(type => {
      this.handleTypeChange(type);
    });

    // مدیریت تغییرات درصد و مبلغ
    this.discountForm.get('percent')?.valueChanges.subscribe(() => {
      this.clearOtherValue('amount');
    });

    this.discountForm.get('amount')?.valueChanges.subscribe(() => {
      this.clearOtherValue('percent');
    });

    // مقداردهی اولیه بر اساس نوع پیش‌فرض
    this.handleTypeChange(DiscountType.PRODUCT_WITHOUT_CODE);
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
      this.productId = +params['id'] || null;
      this.isEditMode = this.router.url.includes('/edit/');
      
      if (this.isEditMode) {
        this.discountId = +params['discountId'] || null;
        this.loadDiscountData();
      }
      
      if (this.productId) {
        this.loadProductInfo();
      }
    });
  }

  loadProductInfo(): void {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state as any;
    
    if (state?.product) {
      this.productName = state.product.title || state.product.name || 'محصول ناشناس';
      this.discountForm.get('productId')?.setValue(state.product.id);
    } else {
      this.productName = `محصول ${this.productId}`;
    }
  }

  loadDiscountData(): void {
    if (this.discountId) {
      // اینجا سرویس خودتان را فراخوانی کنید
      console.log('لود کردن تخفیف با آیدی:', this.discountId);
    }
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
      // اعتبارسنجی اضافی: حداقل یکی از percent یا amount باید پر باشد
      const percent = this.discountForm.get('percent')?.value;
      const amount = this.discountForm.get('amount')?.value;
      
      if (!percent && !amount) {
        this.toastr.error('لطفا یکی از فیلدهای "درصد تخفیف" یا "مبلغ تخفیف" را پر کنید');
        return;
      }
      
      this.loading = true;
      
      const formData = this.prepareFormData();
      
      console.log('داده‌های فرم:', formData);
      
      // شبیه‌سازی درخواست
      setTimeout(() => {
        this.loading = false;
        this.toastr.success(
          this.isEditMode ? 'تخفیف با موفقیت ویرایش شد' : 'تخفیف با موفقیت ایجاد شد'
        );
        this.router.navigate(['/products']);
      }, 1500);
    } else {
      this.markFormGroupTouched(this.discountForm);
      this.toastr.error('لطفا تمام فیلدهای ضروری را پر کنید');
    }
  }

  prepareFormData(): any {
    const rawData = this.discountForm.getRawValue();
    
    // تبدیل تاریخ به فرمت مناسب
    if (rawData.expires_in) {
      rawData.expires_in = new Date(rawData.expires_in).toISOString();
    }
    
    // حذف مقادیر null و undefined
    Object.keys(rawData).forEach(key => {
      if (rawData[key] === null || rawData[key] === undefined || rawData[key] === '') {
        delete rawData[key];
      }
    });
    
    // برای سبد خرید، productId را حذف کن
    if (rawData.type === DiscountType.BASKET_WITH_CODE && rawData.productId) {
      delete rawData.productId;
    }
    
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
    this.router.navigate(['/products']);
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