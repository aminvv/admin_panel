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
      features: new FormArray([])
    });
  }









ngOnChanges(changes: SimpleChanges): void {
    if (!this.product) {
      this.form.reset();
      this.features.clear();
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

  this.features.clear();

  // ✅ نسخه امن و بدون خطا
  const featuresArray = (
    (this.product.features?.length
      ? this.product.features
      : (this.product as any).details) || []
  )
    .filter((f: any) => f && (f.key || f.name || f.value))
    .map((f: any) => ({
      key: f.key ?? f.name ?? '',
      value: f.value ?? ''
    }));

  featuresArray.forEach(f => {
    this.features.push(
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













  // ✅ getter برای features
  get features(): FormArray {
    return this.form.get('features') as FormArray;
  }

  addFeature(): void {
    this.features.push(
      new FormGroup({
        key: new FormControl('', Validators.required),
        value: new FormControl('', Validators.required)
      })
    );
  }

  removeFeature(index: number): void {
    this.features.removeAt(index);
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

  public save(): void {
    if (this.form.invalid) return;

    const productData: ProductDetails = {
      id: this.product?.id, // در حالت create این undefined میشه
      ...this.form.value,
      image: this.selectedFiles.map(f => f.file || f.preview),
      features: this.features.value
    };

    console.log('🟢 ارسال محصول:', productData);
    this.editProduct.emit(productData);
  }
}
