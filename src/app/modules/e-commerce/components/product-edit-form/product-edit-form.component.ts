import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ProductDetails } from '../../models/product-details';
import { routes } from '../../../../consts';
import { CloudinaryService } from 'src/app/shared/services/cloudinary-upload.service';

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
  public selectedFiles: { file: File | null; preview: string, isUploading: boolean, uploadError: boolean }[] = [];

  constructor(private cloudinaryService: CloudinaryService) {
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
        this.selectedFiles = (this.product.image || []).map((url: string) => ({
          file: null,
          preview: url,
          isUploading: false,
          uploadError: false,
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

  onFileChange(event: any): void {
    const files: FileList = event.target.files;
    if (!files?.length) return;

    const fileArray = Array.from(files);

    fileArray.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedFiles.push({
          file: file,
          preview: e.target.result,
          isUploading: true,
          uploadError: false,
        });
      };
      reader.readAsDataURL(file);
    });

    this.cloudinaryService.upload(fileArray).subscribe({
      next: (uploadedUrls: any) => {
        const urls = Array.isArray(uploadedUrls) ? uploadedUrls : [uploadedUrls];

        urls.forEach((url, index) => {
          const item = this.selectedFiles[this.selectedFiles.length - fileArray.length + index];
          if (item) {
            item.preview = url;
            item.file = null;
            item.isUploading= false
              item.uploadError= false
          }
          console.log('آپلود شد و اضافه شد:', urls);
        });
      },
      error: (err) => {
        alert('آپلود نشد!');
        console.error(err);
      }
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
  // این بخش رو جایگزین کن (ساده و تمیز!)
  public save(): void {
    if (this.form.invalid) return;

    // دیگه هیچ File نداریم! فقط preview که همیشه string هست
    const finalImageUrls: string[] = this.selectedFiles
      .map(item => item.preview)
      .filter((url): url is string => typeof url === 'string' && url.trim() !== '');

    const productData: ProductDetails = {
      id: this.product?.id,
      ...this.form.value,
      image: finalImageUrls,  // فقط URLهای خالص
      details: this.details.value
    };

    console.log('ارسال نهایی به والد (فقط URL):', finalImageUrls);
    this.editProduct.emit(productData);
  }
}
