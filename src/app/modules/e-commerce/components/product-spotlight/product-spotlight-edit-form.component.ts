import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { UntypedFormArray, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { CloudinaryService } from 'src/app/shared/services/cloudinary-upload.service';
import { SelectedFile } from '../../models/selectedFile';
import { ProductSpotlightDetails } from './model/product-spotlight.model';

@Component({
  selector: 'app-product-spotlight-edit-form',
  templateUrl: './product-spotlight-edit-form.component.html',
  styleUrls: ['./product-spotlight-edit-form.component.scss']
})
export class ProductSpotlightEditFormComponent implements OnChanges {
  @Input() spotlight: ProductSpotlightDetails | null = null;
  @Output() editSpotlight = new EventEmitter<ProductSpotlightDetails>();
  @Output() createSpotlight = new EventEmitter<ProductSpotlightDetails>();

  public form!: UntypedFormGroup;
  public selectedFiles: SelectedFile[] = [];
  public isDragOver = false;

  private annotationPositions = ['annotation--1', 'annotation--2', 'annotation--3'];

  constructor(private cloudinaryService: CloudinaryService) {
    this.initForm();
  }

  private initForm(): void {
    this.form = new UntypedFormGroup({
      tag: new UntypedFormControl('', Validators.required),
      title: new UntypedFormControl('', Validators.required),
      description: new UntypedFormControl('', Validators.required),
      ctaText: new UntypedFormControl('', Validators.required),
      ctaLink: new UntypedFormControl('', Validators.required),
      isActive: new UntypedFormControl(true),
      stats: new UntypedFormArray([]),
      annotations: new UntypedFormArray([]),
    });

    this.resetStatsAndAnnotations();
  }

  private resetStatsAndAnnotations(): void {
    this.stats.clear();
    for (let i = 0; i < 3; i++) {
      this.stats.push(new UntypedFormGroup({
        value: new UntypedFormControl('', Validators.required),
        label: new UntypedFormControl('', Validators.required),
      }));
    }

    this.annotations.clear();
    this.annotationPositions.forEach(position => {
      this.annotations.push(new UntypedFormGroup({
        value: new UntypedFormControl('', Validators.required),
        label: new UntypedFormControl('', Validators.required),
        position: new UntypedFormControl(position),
      }));
    });
  }

  get stats(): UntypedFormArray {
    return this.form.get('stats') as UntypedFormArray;
  }

  get annotations(): UntypedFormArray {
    return this.form.get('annotations') as UntypedFormArray;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.spotlight) {
      this.form.reset({ tag: '', title: '', description: '', ctaText: '', ctaLink: '', isActive: true });
      this.resetStatsAndAnnotations();
      this.selectedFiles = [];
      return;
    }

    this.form.patchValue({
      tag: this.spotlight.tag,
      title: this.spotlight.title,
      description: this.spotlight.description,
      ctaText: this.spotlight.ctaText,
      ctaLink: this.spotlight.ctaLink,
      isActive: this.spotlight.isActive,
    });

    this.stats.clear();
    (this.spotlight.stats || []).forEach(s => {
      this.stats.push(new UntypedFormGroup({
        value: new UntypedFormControl(s.value, Validators.required),
        label: new UntypedFormControl(s.label, Validators.required),
      }));
    });

    this.annotations.clear();
    (this.spotlight.annotations || []).forEach(a => {
      this.annotations.push(new UntypedFormGroup({
        value: new UntypedFormControl(a.value, Validators.required),
        label: new UntypedFormControl(a.label, Validators.required),
        position: new UntypedFormControl(a.position),
      }));
    });

    this.selectedFiles = this.spotlight.image
      ? [{ file: null, preview: this.spotlight.image, publicId: null, isUploading: false, uploadError: false }]
      : [];
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
    if (event.dataTransfer?.files) this.handleFiles(event.dataTransfer.files);
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
  const fileArray = Array.from(files).filter(f => f.type.match('image.*')).slice(0, 1);
  if (fileArray.length === 0) {
    alert('لطفاً یک فایل تصویری انتخاب کنید');
    return;
  }

  this.selectedFiles = [];

  fileArray.forEach(file => {
    const controller = new AbortController();
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.selectedFiles.push({
        file, preview: e.target.result, publicId: null,
        isUploading: true, uploadError: false, controller
      });
    };
    reader.readAsDataURL(file);
  });

  this.cloudinaryService.upload(fileArray).subscribe({
    next: (uploadedUrls) => {
      const urls = Array.isArray(uploadedUrls) ? uploadedUrls : [uploadedUrls]; 
      urls.forEach((fileData, index) => {
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
      this.selectedFiles.forEach(f => { f.isUploading = false; f.uploadError = true; });
      alert('خطا در آپلود تصویر!');
    }
  });
}

  removeFile(index: number): void {
    const img = this.selectedFiles[index];
    if (img.isUploading && img.controller) img.controller.abort();
    this.selectedFiles.splice(index, 1);
  }

  public resetForm(): void {
    this.form.reset({ title: '', description: '', link: '', linkText: '', order: 0, isActive: true });
    this.selectedFiles = [];
}

  public save(): void {
    if (this.selectedFiles.length === 0) {
      alert('لطفاً یک تصویر انتخاب کنید');
      return;
    }
    if (this.form.invalid) {
      alert('لطفاً همه فیلدها را پر کنید');
      return;
    }
    if (this.selectedFiles.some(f => f.isUploading)) {
      alert('لطفاً صبر کنید تا آپلود تصویر تمام شود.');
      return;
    }

    const data: ProductSpotlightDetails = {
      id: this.spotlight?.id,
      ...this.form.value,
      image: this.selectedFiles[0]?.preview || '',
    };

    if (this.spotlight?.id) {
      this.editSpotlight.emit(data);
    } else {
      this.createSpotlight.emit(data);
        this.resetForm(); 
    }
  }
}