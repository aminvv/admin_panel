import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DiscountService } from '../../services';
import { routes } from 'src/app/consts';

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




    setTimeout(() => {
      console.log("وضعیت نهایی بعد ۲ ثانیه:");
      console.log("productDiscounts.length →", this.productDiscounts.length);
      console.log("productDiscounts →", this.productDiscounts);
    }, 2000);



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

  loadPageData(): void {
    this.route.params.subscribe(params => {
      console.log("پارام‌های route:", params);

      const productIdParam = params['productId'];
      const discountIdParam = params['discountId'];

      this.productId = null;
      this.discountId = null;
      this.isEditMode = false;
      this.selectedDiscountId = null;
      this.showDiscountList = false;

      // اولویت ۱: اگر productId مستقیم در URL بود
      if (productIdParam) {
        this.productId = +productIdParam;
      }

      // اولویت ۲: اگر فقط discountId بود، اول تخفیف رو بگیر تا productId رو ازش استخراج کنی
      else if (discountIdParam) {
        this.discountId = +discountIdParam;
        this.isEditMode = true;
        this.selectedDiscountId = this.discountId;

        // تخفیف رو بگیر تا productId رو پیدا کنیم
        this.discountService.getDiscount(this.discountId).subscribe({
          next: (discount) => {
            if (discount?.productId) {
              this.productId = discount.productId;
              console.log("productId از تخفیف استخراج شد:", this.productId);
              this.loadProductInfo();
              this.loadProductDiscounts();   // حالا لیست رو لود کن
            } else {
              console.warn("این تخفیف productId ندارد!");
            }
            this.populateFormWithDiscountData(discount);
          },
          error: () => {
            this.toastr.error("خطا در دریافت اطلاعات تخفیف");
          }
        });
      }

      // اگر productId داشتیم (از هر راهی)، اطلاعات محصول و لیست تخفیف رو لود کن
      if (this.productId) {
        this.loadProductInfo();
        this.loadProductDiscounts();
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

    console.log("loadProductDiscounts شروع شد، productId =", this.productId);
    if (!this.productId) {
      console.log("productId نیست → لود نمی‌کنم");
      return;
    }

    console.log("===== شروع درخواست برای productId:", this.productId, " =====");

    this.loading = true;
    this.productDiscounts = []; // ریست

    this.discountService.getProductDiscounts(this.productId).subscribe({

      next: (data) => {
        console.log("NEXT بلوک اجرا شد! داده خام:", data);
        console.log("طول داده:", data?.length ?? "نامعلوم");

        this.productDiscounts = Array.isArray(data) ? [...data] : [];

        console.log("بعد از ست کردن → طول:", this.productDiscounts.length);
        console.log("محتویات:", this.productDiscounts);

        this.loading = false;
      },
      error: (err) => {
        console.log("ERROR بلوک اجرا شد!");
        console.error("جزئیات خطا:", err);
        console.error("status:", err.status);
        console.error("message:", err.message);
        this.loading = false;
      },
      complete: () => {
        console.log("===== درخواست کامل شد (complete) =====");
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

  // ============ متدهای جدید ============
  onSelectDiscount(discount: any): void {
    this.selectedDiscountId = discount.id;
    this.isEditMode = true;
    this.discountId = discount.id;
    this.loadDiscountData();
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
      productId: this.productId
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

    if (rawData.expires_in) {
      rawData.expires_in = new Date(rawData.expires_in).toISOString();
    }

    if (rawData.type === DiscountType.PRODUCT_WITH_CODE || rawData.type === DiscountType.PRODUCT_WITHOUT_CODE) {
      rawData.type = 'product';
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
    return type !== DiscountType.PRODUCT_WITHOUT_CODE;
  }

  shouldShowProductIdField(): boolean {
    const type = this.discountForm.get('type')?.value;
    return type
  }

  isProductIdReadonly(): boolean {
    return !!this.productId;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fa-IR');
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

    this.onCreateNewDiscount();
  }


}