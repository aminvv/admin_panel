
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { UntypedFormArray, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ProductDetails } from '../../models/product-details';
import { routes } from '../../../../consts';
import { CloudinaryService } from 'src/app/shared/services/cloudinary-upload.service';
import { ProductService } from '../../services';
import { SelectedFile } from '../../models/selectedFile';

@Component({
  selector: 'app-product-edit-form',
  templateUrl: './product-edit-form.component.html',
  styleUrls: ['./product-edit-form.component.css']
})
export class ProductEditFormComponent implements OnChanges {
  @Input() product!: ProductDetails;
  @Output() editProduct = new EventEmitter<ProductDetails>();
  @Output() createProduct = new EventEmitter<ProductDetails>();

  public router = routes;
  public form!: UntypedFormGroup;
  public selectedFiles: SelectedFile[] = [];

  constructor(
    private cloudinaryService: CloudinaryService,
    private productService: ProductService,
  ) {
    this.initForm();
  }




  private initForm(): void {
    this.form = new UntypedFormGroup({
      productCode: new UntypedFormControl('', Validators.required),
      productName: new UntypedFormControl('', Validators.required),
      price: new UntypedFormControl(0, Validators.required),
      quantity: new UntypedFormControl(0, Validators.required),
      discountPercent: new UntypedFormControl(0),
      discountAmount: new UntypedFormControl(0),
      description: new UntypedFormControl(''),
      image: new UntypedFormControl([]),
      rating: new UntypedFormControl(0, Validators.required),
      status: new UntypedFormControl('1', Validators.required),
      details: new UntypedFormArray([])
    });
  }














  ngOnChanges(changes: SimpleChanges): void {
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

    const detailsArray =
      (this.product.details?.length
        ? this.product.details
        : (this.product as any).details) || [];

    const fixedDetails = detailsArray
      .filter((f: any) => f && (f.key || f.name || f.value))
      .map((f: any) => ({
        id: f.id ?? null,
        key: f.key ?? f.name ?? '',
        value: f.value ?? '',
      }));

    fixedDetails.forEach(f =>
      this.details.push(
        new UntypedFormGroup({
          key: new UntypedFormControl(f.key, Validators.required),
          value: new UntypedFormControl(f.value, Validators.required)
        })
      )
    );

    this.product._initialDetailIds = fixedDetails
      .filter(d => d.id)
      .map(d => d.id!);



    if (Array.isArray(this.product.image)) {
      this.selectedFiles = this.product.image.map((img: { url: string, publicId: string }) => ({
        file: null,
        preview: img.url,
        publicId: img.publicId,
        isUploading: false,
        uploadError: false,
      }));
    }
  }

  get details(): UntypedFormArray {
    return this.form.get('details') as UntypedFormArray;
  }







  // ================= ADD FEATURE =================
  addFeature(): void {
    this.details.push(
      new UntypedFormGroup({
        key: new UntypedFormControl('', Validators.required),
        value: new UntypedFormControl('', Validators.required)
      })
    );
  }






  // ================= REMOVE FEATURE =================
  removeFeature(index: number): void {
    this.details.removeAt(index);
  }






  // ================= FILE UPLOAD =================
  onFileChange(event: any): void {
    const files: FileList = event.target.files;
    if (!files?.length) return;

    const fileArray = Array.from(files);

    fileArray.forEach(file => {
      const controller = new AbortController()
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedFiles.push({
          file,
          preview: e.target.result,
          publicId: null,
          isUploading: true,
          uploadError: false,
          controller
        });
      };
      reader.readAsDataURL(file);
    });

    this.cloudinaryService.upload(fileArray).subscribe({
      next: (uploadedUrls: { url: string; publicId: string }[]) => {
        uploadedUrls.forEach((fileData, index) => {
          const item = this.selectedFiles[this.selectedFiles.length - fileArray.length + index];
          if (item) {
            item.preview = fileData.url
            item.publicId = fileData.publicId
            item.file = null;
            item.isUploading = false;
            item.uploadError = false;
          }
        });
      },
      error: () => alert('آپلود نشد!')
    });

    event.target.value = '';
  }





  // ================= REMOVE FILE =================
  removeFile(index: number): void {
    const img = this.selectedFiles[index]
    if (img.isUploading && img.controller) {
      img.controller.abort();
    }
    this.selectedFiles.splice(index, 1)

    if (img.publicId) {
      this.productService.removeUploadedImage(img.publicId).subscribe()
    }
  }





  // ================= GET FILE SIZE =================
  getFileSize(size: number): string {
    return size > 1024 * 1024
      ? (size / (1024 * 1024)).toFixed(1) + ' MB'
      : (size / 1024).toFixed(1) + ' KB';
  }








  // ================= SAVE =================
  public save(): void {
    if (this.form.invalid) {
      alert('لطفاً همه فیلدها را پر کنید');
      return;
    }

    // const uploadingFiles = (this.selectedFiles ?? [])
    const uploadingFiles = this.selectedFiles.filter(f => f.isUploading);
    if (uploadingFiles.length > 0) {
      alert('لطفاً صبر کنید تا همه عکس‌ها آپلود شوند.');
      return;
    }

    const finalImageUrls: { url: string, publicId: string }[] = this.selectedFiles
      .filter(item => item.preview && item.publicId)
      .map(item => ({ url: item.preview, publicId: item.publicId }))

    const productData: ProductDetails = {
      id: this.product?.id,
      ...this.form.value,
      image: finalImageUrls,
      details: this.details.value
    }; 

    this.editProduct.emit(productData);
  }


}
