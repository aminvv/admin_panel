import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { routes } from '../../../../consts';
import { CloudinaryService } from 'src/app/shared/services/cloudinary-upload.service';
import { SelectedFile } from '../../models/selectedFile';
import { CertificateDetails } from './model/certificate-details.model';

@Component({
  selector: 'app-certificate-edit-form',
  templateUrl: './certificate-edit-form.component.html',
  styleUrls: ['./certificate-edit-form.component.scss']
})
export class CertificateEditFormComponent implements OnChanges {
  @Input() certificate: CertificateDetails | null = null;
  @Output() editCertificate = new EventEmitter<CertificateDetails>();
  @Output() createCertificate = new EventEmitter<CertificateDetails>();

  public router = routes;
  public form!: UntypedFormGroup;
  public selectedFiles: SelectedFile[] = [];
  public isDragOver = false;

  constructor(private cloudinaryService: CloudinaryService) {
    this.initForm();
  }

  private initForm(): void {
    this.form = new UntypedFormGroup({
      title: new UntypedFormControl('', Validators.required),
      issuer: new UntypedFormControl('', Validators.required),
      issueDate: new UntypedFormControl('', Validators.required),
      order: new UntypedFormControl(0),
      isActive: new UntypedFormControl(true),
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.certificate) {
      this.resetForm(); 
      return;
    }

    this.form.patchValue({
      title: this.certificate.title,
      issuer: this.certificate.issuer,
      issueDate: this.certificate.issueDate,
      order: this.certificate.order ?? 0,
      isActive: this.certificate.isActive ?? true,
    });

    this.selectedFiles = this.certificate.image
      ? [{
          file: null,
          preview: this.certificate.image,
          publicId: null,
          isUploading: false,
          uploadError: false,
        }]
      : [];
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
    const fileArray = Array.from(files).filter(file => file.type.match('image.*')).slice(0, 1);
    if (fileArray.length === 0) {
      alert('لطفاً یک فایل تصویری انتخاب کنید');
      return;
    }

    if (this.selectedFiles.length > 0) {
      this.selectedFiles = [];
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
        alert('خطا در آپلود تصویر!');
      }
    });
  }




   public resetForm(): void {
    this.form.reset({
      title: '',
      issuer: '',
      issueDate: '',
      order: 0,
      isActive: true,
    });
    this.selectedFiles = [];
  }

  removeFile(index: number): void {
    const img = this.selectedFiles[index];
    if (img.isUploading && img.controller) {
      img.controller.abort();
    }
    this.selectedFiles.splice(index, 1);
    // بک‌اند اندپوینت remove-image نداره، پس فقط از حالت محلی حذف می‌کنیم
  }

  public save(): void {
    if (this.selectedFiles.length === 0) {
      alert('لطفاً یک تصویر برای لوح تقدیر انتخاب کنید'); 
      return;
    }

    if (this.form.invalid) {
      alert('لطفاً همه فیلدها را پر کنید');
      return;
    }

    const uploadingFiles = this.selectedFiles.filter(f => f.isUploading);
    if (uploadingFiles.length > 0) {
      alert('لطفاً صبر کنید تا آپلود تصویر تمام شود.');
      return;
    }

    const imageUrl = this.selectedFiles[0]?.preview || '';

    const certificateData: CertificateDetails = {
      id: this.certificate?.id,
      ...this.form.value,
      image: imageUrl,
    };

    if (this.certificate?.id) {
      this.editCertificate.emit(certificateData);
    } else {
      this.createCertificate.emit(certificateData);
      this.resetForm(); // 👈 بعد از افزودن، فوری فرم رو خالی کن
    }
  }
}