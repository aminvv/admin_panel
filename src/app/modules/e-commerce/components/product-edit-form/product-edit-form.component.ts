import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { routes } from '../../../../consts';
import { ProductDetails } from '../../models/product-details';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-product-edit-form',
  templateUrl: './product-edit-form.component.html',
  styleUrls: ['./product-edit-form.component.scss'],
})
export class ProductEditFormComponent implements OnInit {
  @Input() product: ProductDetails;
  @Output() editProduct: EventEmitter<ProductDetails> = new EventEmitter<ProductDetails>();
  public router: typeof routes = routes;
  public form: FormGroup;

  selected = 'option';
  selectedFiles: File[] = []; // اضافه شد

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
      
      // اگر محصول موجود هست، selectedFiles رو هم مقداردهی کن
      if (this.product.image) {
        this.selectedFiles = this.product.image as any;
      }
    }
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
      image: this.product?.image||[], // استفاده از selectedFiles به جای image.value
      rating: this.rating.value,
      status: this.status.value,
    });
  }

  public onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const filesArray = Array.from(input.files);
      this.selectedFiles = filesArray; // ذخیره در selectedFiles
      this.image.setValue(filesArray); // ذخیره در form control هم
    }
  }

  // اضافه کردن متد removeFile
  public removeFile(fileToRemove: File) {
    this.selectedFiles = this.selectedFiles.filter(file => file !== fileToRemove);
    this.image.setValue(this.selectedFiles); // آپدیت form control
  }

  // اضافه کردن متد getFileSize
  public getFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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