import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { CloudinaryService } from 'src/app/shared/services/cloudinary-upload.service';
import { SelectedFile } from '../../models/selectedFile';
import { SlideDetails } from './model/slide.model';

@Component({
  selector: 'app-slide-edit-form',
  templateUrl: './slide-edit-form.component.html',
  styleUrls: ['./slide-edit-form.component.scss']
})
export class SlideEditFormComponent implements OnChanges {
  @Input() slide: SlideDetails | null = null;
  @Output() editSlide = new EventEmitter<SlideDetails>();
  @Output() createSlide = new EventEmitter<SlideDetails>();

  public form!: UntypedFormGroup;
  public selectedFiles: SelectedFile[] = [];
  public isDragOver = false;

  constructor(private cloudinaryService: CloudinaryService) {
    this.initForm();
  }

  private initForm(): void {
    this.form = new UntypedFormGroup({
      title: new UntypedFormControl('', Validators.required),
      description: new UntypedFormControl(''),
      link: new UntypedFormControl(''),
      linkText: new UntypedFormControl(''),
      order: new UntypedFormControl(0),
      isActive: new UntypedFormControl(true),
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.slide) {
      this.form.reset({ title: '', description: '', link: '', linkText: '', order: 0, isActive: true });
      this.selectedFiles = [];
      return;
    }

    this.form.patchValue({
      title: this.slide.title,
      description: this.slide.description,
      link: this.slide.link,
      linkText: this.slide.linkText,
      order: this.slide.order ?? 0,
      isActive: this.slide.isActive ?? true,
    });

    this.selectedFiles = this.slide.image
      ? [{ file: null, preview: this.slide.image, publicId: null, isUploading: false, uploadError: false }]
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
      alert('لطفاً فیلدهای الزامی را پر کنید');
      return;
    }
    if (this.selectedFiles.some(f => f.isUploading)) {
      alert('لطفاً صبر کنید تا آپلود تصویر تمام شود.');
      return;
    }

    const data: SlideDetails = {
      id: this.slide?.id,
      ...this.form.value,
      image: this.selectedFiles[0]?.preview || '',
    };

    if (this.slide?.id) {
      this.editSlide.emit(data);
    } else {
      this.createSlide.emit(data);
        this.resetForm();
    }
  }
}