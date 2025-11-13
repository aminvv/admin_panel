import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ProductDetails } from '../../models/product-details';
import { routes } from '../../../../consts';

@Component({
  selector: 'app-product-edit-form',
  templateUrl: './product-edit-form.component.html',
  styleUrls: ['./product-edit-form.component.css']
})
export class ProductEditFormComponent implements OnChanges {
  @Input() product!: ProductDetails;
  @Output() editProduct = new EventEmitter<ProductDetails>();

  public router = routes;
  public form!: FormGroup;
  public selectedFiles: { file: File | null; preview: string }[] = [];

  constructor() {
    this.initForm();
  }

  private initForm(): void {
    this.form = new FormGroup({
      productCode: new FormControl('', Validators.required),
      productName: new FormControl('', Validators.required),
      price: new FormControl(0, Validators.required),
      quantity: new FormControl(0, Validators.required),
      discountPercent: new FormControl(0),
      discountAmount: new FormControl(0),
      description: new FormControl(''),
      image: new FormControl([]),
      rating: new FormControl(0, Validators.required),
      status: new FormControl('1', Validators.required),
      details: new FormArray([])
    });
  }









ngOnChanges(changes: SimpleChanges): void {
  console.log(' this product', this.product);
    if (!this.product) {
      this.form.reset();
      this.details.clear();
      this.selectedFiles = [];
      return;
    }
  this.form.patchValue({
    productCode: this.product.productCode,
    productName: this.product.productName,
    price: this.product.price,
    quantity: this.product.quantity,
    discountPercent: this.product.discountPercent,
    discountAmount: this.product.discountAmount,
    description: this.product.description,
    rating: this.product.rating,
    status: this.product.status,
    image: this.product.image || []
  });

  this.details.clear();

  const detailsArray = (
    (this.product.details?.length
      ? this.product.details
      : (this.product as any).details) || []
  )
    .filter((f: any) => f && (f.key || f.name || f.value))
    .map((f: any) => ({
      key: f.key ?? f.name ?? '',
      value: f.value ?? ''
    }));

  detailsArray.forEach(f => {
    this.details.push(
      new FormGroup({
        key: new FormControl(f.key, Validators.required),
        value: new FormControl(f.value, Validators.required)
      })
    );
  });

if (this.product.image && Array.isArray(this.product.image)) {
  Promise.resolve().then(() => {
    this.selectedFiles = this.product.image.map((url: string) => ({
      file: null,
      preview: url
    }));
  });
}

}














  get details(): FormArray {
    return this.form.get('details') as FormArray;
  }




  addFeature(): void {
    this.details.push(
      new FormGroup({
        key: new FormControl('', Validators.required),
        value: new FormControl('', Validators.required)
      })
    );
  }

  removeFeature(index: number): void {
    this.details.removeAt(index);
  }

  // ✅ مدیریت عکس‌ها
  onFileChange(event: any): void {
    const files: FileList = event.target.files;
    if (!files?.length) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedFiles.push({
          file: file,
          preview: e.target.result
        });
      };
      reader.readAsDataURL(file);
    });
    event.target.value = '';
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  getFileSize(size: number): string {
    return size > 1024 * 1024
      ? (size / (1024 * 1024)).toFixed(1) + ' MB'
      : (size / 1024).toFixed(1) + ' KB';
  }











  //=============================SAVE======================
public save(): void {
  console.log('🟣 دکمه ذخیره کلیک شد');

  if (this.form.invalid) {
    console.log('⚠️ فرم نامعتبر است. وضعیت کنترل‌ها:', this.form.controls);
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      if (control?.invalid) {
        console.warn(`❌ فیلد '${key}' نامعتبر است:`, control.errors);
      }
    });
    return;
  }


  const imagesArray = this.selectedFiles.map(f => {
    return f.file ? f.file : f.preview; 
  });

  const productData: ProductDetails = {
    id: this.product?.id,
    ...this.form.value,
    image: imagesArray,
    details: this.details.value
  };

  console.log('🟢 ارسال محصول به والد:', productData);
  console.log('🟢 تصاویر ارسالی:', imagesArray);
  this.editProduct.emit(productData);
}

}
