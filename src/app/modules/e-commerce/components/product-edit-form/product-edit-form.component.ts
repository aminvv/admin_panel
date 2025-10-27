import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { routes } from '../../../../consts';
import { ProductDetails } from '../../models/product-details';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-product-edit-form',
  templateUrl: './product-edit-form.component.html',
  styleUrls: ['./product-edit-form.component.css'],
})
export class ProductEditFormComponent implements OnInit {
  @Input() product: ProductDetails;
  @Output() editProduct: EventEmitter<ProductDetails> = new EventEmitter<ProductDetails>();
  public router: typeof routes = routes;
  public form: FormGroup;

  selected = 'option';
  selectedFiles: { file: File; preview: string }[] = [];












onFileChange(event: any) {
    const files: FileList = event.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        this.selectedFiles.push({
          file: file,
          preview: e.target.result,
        });
      };

      reader.readAsDataURL(file); // برای ساخت preview
    });

    event.target.value = '';
  }

  removeFile(index: number) {
    this.selectedFiles.splice(index, 1);
  }

  getFileSize(size: number): string {
    return size > 1024 * 1024
      ? (size / (1024 * 1024)).toFixed(1) + ' MB'
      : (size / 1024).toFixed(1) + ' KB';
  }
















  constructor() {
    this.form = new FormGroup({
      productCode: new FormControl('', Validators.required),
      productName: new FormControl('', Validators.required),
      price: new FormControl('', Validators.required),
      quantity: new FormControl('', Validators.required),
      discountPercent: new FormControl(''),
      discountAmount: new FormControl(''),
      description: new FormControl(''),
      image: new FormControl([]),
      rating: new FormControl('', Validators.required),
      status: new FormControl('', Validators.required),
      features: new FormArray([this.createFeature()])

    });
  }

  ngOnInit(): void {
    if (this.product) {
      this.productCode.setValue(this.product.productCode);
      this.productName.setValue(this.product.productName);
      this.price.setValue(this.product.price);
      this.quantity.setValue(this.product.quantity);
      this.discountPercent.setValue(this.product.discountPercent);
      this.discountAmount.setValue(this.product.discountAmount);
      this.description.setValue(this.product.description);
      this.image.setValue(this.product.image || []);
      this.rating.setValue(this.product.rating);
      this.status.setValue(this.product.status);
    }
  }





  createFeature(): FormGroup {
    return new FormGroup({
      name: new FormControl('', Validators.required),
      value: new FormControl('', Validators.required)
    });
  }

  // گرفتن لیست ویژگی‌ها
  get features(): FormArray {
    return this.form.get('features') as FormArray;
  }

  // افزودن ویژگی جدید
  addFeature() {
    this.features.push(this.createFeature());
  }

  // حذف ویژگی بر اساس ایندکس
  removeFeature(index: number) {
    this.features.removeAt(index);
  }





  public save(): void {
    this.editProduct.emit({
      id: this.product?.id ?? undefined,
      productCode: this.productCode.value,
      productName: this.productName.value,
      price: this.price.value,
      quantity: this.quantity.value,
      discountPercent: this.discountPercent.value,
      discountAmount: this.discountAmount.value,
      description: this.description.value,
      image: this.product?.image || [],
      rating: this.rating.value,
      status: this.status.value,
      features: this.features.value
    });
  }














  get productCode() { return this.form.get('productCode') as FormControl; }
  get productName() { return this.form.get('productName') as FormControl; }
  get price() { return this.form.get('price') as FormControl; }
  get quantity() { return this.form.get('quantity') as FormControl; }
  get discountPercent() { return this.form.get('discountPercent') as FormControl; }
  get discountAmount() { return this.form.get('discountAmount') as FormControl; }
  get description() { return this.form.get('description') as FormControl; }
  get image() { return this.form.get('image') as FormControl; }
  get rating() { return this.form.get('rating') as FormControl; }
  get status() { return this.form.get('status') as FormControl; }
}