import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { AboutService } from '../../services/about.service';
import { AboutPage } from '../../models/about.model';
import DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import { MyCustomUploadAdapterPlugin } from '../../../content/components/Blog-edit-form/upload-adapter.plugin';
import { CloudinaryService } from 'src/app/shared/services/cloudinary-upload.service';
import { ToastrService } from 'ngx-toastr';

interface SelectedFile {
  file: File;
  preview: string;        // 👈 برگشت به string
  isUploading: boolean;
  uploadError: boolean;
  url?: string;
}

@Component({
  selector: 'app-about-management',
  templateUrl: './about-management.component.html',
  styleUrls: ['./about-management.component.scss'],
})
export class AboutManagementComponent implements OnInit {
  form: FormGroup;
  loading = false;
  selectedFiles: SelectedFile[] = [];

  public Editor = DecoupledEditor;
  public editorConfig: any = {};

  constructor(
    private fb: FormBuilder,
    private aboutService: AboutService,
    private cloudinaryService: CloudinaryService,
    private toastr: ToastrService,
  ) {
    this.form = this.fb.group({
      title: [''],
      description: [''],
      imageUrl: [''],
      stats: this.fb.array([]),
    });
  }

  get stats(): FormArray {
    return this.form.get('stats') as FormArray;
  }

  ngOnInit(): void {
    this.editorConfig = {
      language: 'fa',
      cloudinaryService: this.cloudinaryService,
      extraPlugins: [MyCustomUploadAdapterPlugin],
    };

    this.loading = true;
    this.aboutService.get().subscribe({
      next: (data) => this.patchForm(data),
      error: () => (this.loading = false),
      complete: () => (this.loading = false),
    });
  }

  //==============  CKEDITOR =================
  onReady(editor: any): void {
    const editable = editor.ui.getEditableElement();
    editable.parentElement.insertBefore(
      editor.ui.view.toolbar.element,
      editable,
    );
  }

  private patchForm(data: AboutPage): void {
    this.form.patchValue(data);
    this.stats.clear();
    data.stats?.forEach((s) =>
      this.stats.push(this.fb.group({ label: [s.label], value: [s.value] })),
    );

    if (data.imageUrl) {
      this.selectedFiles = [
        {
          file: null as any,
          preview: data.imageUrl,
          isUploading: false,
          uploadError: false,
          url: data.imageUrl,
        },
      ];
    }
  }

  addStat(): void {
    this.stats.push(this.fb.group({ label: [''], value: [''] }));
  }

  removeStat(index: number): void {
    this.stats.removeAt(index);
  }

onFileChange(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;

  const file = input.files[0];

  // بدون preview محلی — فقط وضعیت لودینگ
  this.selectedFiles = [
    { file, preview: '', isUploading: true, uploadError: false },
  ];

  this.cloudinaryService.upload(file).subscribe(
    (res: { url: string; publicId: string } | { url: string; publicId: string }[]) => {
      const result = Array.isArray(res) ? res[0] : res;
      this.selectedFiles[0].isUploading = false;
      this.selectedFiles[0].preview = result.url; // URL واقعی و امن (https)
      this.selectedFiles[0].url = result.url;
      this.form.patchValue({ imageUrl: result.url });
    },
    () => {
      this.selectedFiles[0].isUploading = false;
      this.selectedFiles[0].uploadError = true;
    },
  );

  input.value = '';
}

  removeFile(): void {
    this.selectedFiles = [];
    this.form.patchValue({ imageUrl: '' });
  }

  save(): void {
    this.aboutService.update(this.form.value).subscribe({
      next: (response: any) => {
        this.toastr.success(response?.message || 'اطلاعات درباره ما با موفقیت ذخیره شد');
      },
      error: (err) => {
        this.toastr.error(err?.error?.message || 'خطا در ذخیره‌سازی اطلاعات');
      },
    });
  }
}