import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, UntypedFormArray } from '@angular/forms';
import { BlogService } from '../../services';
import DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import { MyCustomUploadAdapterPlugin } from './upload-adapter.plugin';
import { CloudinaryService } from 'src/app/shared/services/cloudinary-upload.service';
import { routes } from 'src/app/consts';
import { MyUploadAdapter } from './upload-adapter';
import { SelectedFile } from '../../models/selectedFile';
import { ProductService } from 'src/app/modules/e-commerce/services';

@Component({
  selector: 'app-blog-edit-form',
  templateUrl: './blog-edit-form.component.html',
  styleUrls: ['./blog-edit-form.component.scss'],
})
export class BlogEditFormComponent implements OnInit {
  @Input() blog: any = null;
  @Output() editBlog = new EventEmitter<UntypedFormGroup>();
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  blogForm!: UntypedFormGroup;
  imagePreviews: string[] = [];
  public router = routes;
  public Editor = DecoupledEditor;
  public editorConfig: any = {};
  public selectedFiles: SelectedFile[] = []

  isUploading = false;
  uploadError = false;

  constructor(
    private fb: UntypedFormBuilder,
    private blogService: BlogService,
    private cloudinaryService: CloudinaryService,
  ) { }

  ngOnInit(): void {
    this.blogForm = this.fb.group({
      title: [this.blog?.title || '', Validators.required],
      slug: [this.blog?.slug || ''],
      description: [this.blog?.description || '', Validators.required],
      content: [this.blog?.content || '', Validators.required],
      thumbnail: [this.blog?.image || ''],
      status: [this.blog?.status || 'draft', Validators.required],
      images: this.fb.array([])
    });

    this.editorConfig = {
      language: 'fa',
      cloudinaryService: this.cloudinaryService,
      extraPlugins: [MyCustomUploadAdapterPlugin],
    };
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


  get image(): UntypedFormArray {
    return this.blogForm.get('images') as UntypedFormArray;
  }

  onImageChange(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      for (let file of files) {
        if (this.image.length >= 5) break;
        const reader = new FileReader();
        reader.onload = (e: any) => this.imagePreviews.push(e.target.result);
        reader.readAsDataURL(file);
        this.image.push(this.fb.control(file));
      }
    }
  }

  removeImage(index: number) {
    this.image.removeAt(index);
    this.imagePreviews.splice(index, 1);
  }







  // ================= FILE UPLOAD =================
  onFileChange(event: any): void {
    const file: File = event.target.files?.[0];
    if (!file) return;

    const controller = new AbortController();
    const reader = new FileReader();

    reader.onload = (e: any) => {
      this.selectedFiles = [{
        file,
        preview: e.target.result,
        publicId: null,
        isUploading: true,
        uploadError: false,
        controller
      }];
    };
    reader.readAsDataURL(file);

    const { observable, controller: ctrl } = this.cloudinaryService.uploadWithAbort(file);
    this.selectedFiles[0].controller = ctrl;

    observable.subscribe({
      next: (res) => {
        const item = this.selectedFiles[0];
        if (!item) return;
        item.preview = res.url;
        item.publicId = res.publicId;
        item.file = null;
        item.isUploading = false;
        item.uploadError = false;
      },
      error: () => {
        const item = this.selectedFiles[0];
        if (item) {
          item.isUploading = false;
          item.uploadError = true;
        }
      }
    });

    event.target.value = '';
  }

  // ================= REMOVE FILE =================
  removeFile(): void {
    const img = this.selectedFiles[0];
    if (img.isUploading && img.controller) {
      img.controller.abort();
    }

    if (img.publicId) {
      this.blogService.removeUploadedImage(img.publicId).subscribe();
    }

    this.selectedFiles = [];
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }


  onSubmit() {
    if (this.blogForm.invalid) return;

    console.log("Final CKEditor content:", this.blogForm.value.content);
    console.log("Form full payload:", this.blogForm.value);

    this.editBlog.emit(this.blogForm);
  }
}