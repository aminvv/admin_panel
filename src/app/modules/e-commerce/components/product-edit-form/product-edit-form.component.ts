import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { UntypedFormArray, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ProductDetails } from '../../models/product-details';
import { routes } from '../../../../consts';
import { CloudinaryService } from 'src/app/shared/services/cloudinary-upload.service';
import { ProductService } from '../../services';
import { SelectedFile } from '../../models/selectedFile';
import { MyUploadAdapter } from 'src/app/modules/content/components/Blog-edit-form/upload-adapter';
import DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';

@Component({
  selector: 'app-product-edit-form',
  templateUrl: './product-edit-form.component.html',
  styleUrls: ['./product-edit-form.component.scss']
})
export class ProductEditFormComponent implements OnChanges {
  @Input() product!: ProductDetails;
  @Output() editProduct = new EventEmitter<ProductDetails>();
  @Output() createProduct = new EventEmitter<ProductDetails>();

  public router = routes;
  public form!: UntypedFormGroup;
  public selectedFiles: SelectedFile[] = [];
  public isDragOver = false;
    public Editor = DecoupledEditor;
    public editorConfig: any = {};

  constructor(
    private cloudinaryService: CloudinaryService,
    private productService: ProductService,
    
  ) {
    this.initForm();
  }

  private initForm(): void {
    this.form = new UntypedFormGroup({
      productCode: new UntypedFormControl('', Validators.required),
      slug: new UntypedFormControl('', Validators.required),
      active_discount: new UntypedFormControl(false),
      productName: new UntypedFormControl('', Validators.required),
      price: new UntypedFormControl(0, Validators.required),
      quantity: new UntypedFormControl(0, Validators.required),
      description: new UntypedFormControl(''),
      image: new UntypedFormControl([]),
      status: new UntypedFormControl(true),
      details: new UntypedFormArray([]),
      lifespan: new UntypedFormControl(''),
      weight: new UntypedFormControl(''),
      thickness: new UntypedFormControl(''),
      saleType: new UntypedFormControl('CASH'),
      deliveryTime: new UntypedFormControl(""),
      deliveryCost: new UntypedFormControl(""),
      returnable: new UntypedFormControl(true),
      insurance: new UntypedFormControl(false),
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
      slug: this.product.slug,
      productName: this.product.productName,
      price: this.product.price,
      active_discount: this.product.active_discount,
      quantity: this.product.quantity,
      description: this.product.description,
      status: this.product.status,
      image: this.product.image || [],
      lifespan: this.product.lifespan || '',
      weight: this.product.weight ?? null,
      thickness: this.product.thickness ?? '',
      saleType: this.product.saleType || 'CASH',
      deliveryTime: this.product.deliveryTime ?? null,
      deliveryCost: this.product.deliveryCost ?? null,
      returnable: this.product.returnable ?? true,
      insurance: this.product.insurance ?? false,
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

  addFeature(): void {
    this.details.push(
      new UntypedFormGroup({
        key: new UntypedFormControl('', Validators.required),
        value: new UntypedFormControl('', Validators.required)
      })
    );
  }

  removeFeature(index: number): void {
    this.details.removeAt(index);
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
    if (event.dataTransfer?.files) {
      this.handleFiles(event.dataTransfer.files);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onFileChange(event: any): void {
    const files: FileList = event.target.files;
    if (!files?.length) return;
    this.handleFiles(files);
    event.target.value = '';
  }

  private handleFiles(files: FileList): void {
    const fileArray = Array.from(files).filter(file => file.type.match('image.*'));
    if (fileArray.length === 0) {
      alert('لطفاً فقط فایل‌های تصویری انتخاب کنید');
      return;
    }

    fileArray.forEach(file => {
      const controller = new AbortController();
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
            item.preview = fileData.url;
            item.publicId = fileData.publicId;
            item.file = null;
            item.isUploading = false;
            item.uploadError = false;
          }
        });
      },
      error: () => {
        for (let i = this.selectedFiles.length - fileArray.length; i < this.selectedFiles.length; i++) {
          if (this.selectedFiles[i]) {
            this.selectedFiles[i].isUploading = false;
            this.selectedFiles[i].uploadError = true;
          }
        }
        alert('خطا در آپلود برخی تصاویر!');
      }
    });
  }

  removeFile(index: number): void {
    const img = this.selectedFiles[index];
    if (img.isUploading && img.controller) {
      img.controller.abort();
    }
    this.selectedFiles.splice(index, 1);
    if (img.publicId) {
      this.productService.removeUploadedImage(img.publicId).subscribe();
    }
  }

  getFileSize(size: number): string {
    return size > 1024 * 1024
      ? (size / (1024 * 1024)).toFixed(1) + ' MB'
      : (size / 1024).toFixed(1) + ' KB';
  }

  public save(): void {
    
    if (this.form.invalid) {
      alert('لطفاً همه فیلدها را پر کنید');
      return;
    }

    const uploadingFiles = this.selectedFiles.filter(f => f.isUploading);
    if (uploadingFiles.length > 0) {
      alert('لطفاً صبر کنید تا همه عکس‌ها آپلود شوند.');
      return;
    }

    const finalImageUrls: { url: string, publicId: string }[] = this.selectedFiles
      .filter(item => item.preview && item.publicId)
      .map(item => ({ url: item.preview, publicId: item.publicId }));

    const productData: ProductDetails = {
      id: this.product?.id,
      ...this.form.value,
      image: finalImageUrls,
      details: this.details.value
    };

    this.editProduct.emit(productData);
  }







    onReady(editor: any) {
      const editable = editor.ui.getEditableElement();
      editable.parentElement.insertBefore(
        editor.ui.view.toolbar.element,
        editable
      );
      editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => {
        return new MyUploadAdapter(loader, this.cloudinaryService);
      };
    }
  
}