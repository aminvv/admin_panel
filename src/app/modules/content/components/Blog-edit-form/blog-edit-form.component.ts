import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, } from '@angular/forms';
import { BlogService } from '../../services';
import DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import { MyCustomUploadAdapterPlugin } from './upload-adapter.plugin';
import { CloudinaryService } from 'src/app/shared/services/cloudinary-upload.service';
import { routes } from 'src/app/consts';
import { MyUploadAdapter } from './upload-adapter';
import { SelectedFile } from '../../models/selectedFile';
import { BlogDetails } from '../../models/blog-details';

@Component({
  selector: 'app-blog-edit-form',
  templateUrl: './blog-edit-form.component.html',
  styleUrls: ['./blog-edit-form.component.scss'],
})
export class BlogEditFormComponent implements OnInit, OnChanges {
  @Input() blog!: BlogDetails
  @Output() editBlog = new EventEmitter<BlogDetails>();
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
      category: [this.blog?.category || '', Validators.required],
      slug: [this.blog?.slug || ''],
      description: [this.blog?.description || '', Validators.required],
      content: [this.blog?.content || '', Validators.required],
      status: [this.blog?.status || 'draft', Validators.required],
      thumbnail: this.fb.group([{ url: [''], publicId: [''], }, Validators.required]),
    })
    this.editorConfig = {
      language: 'fa',
      cloudinaryService: this.cloudinaryService,
      extraPlugins: [MyCustomUploadAdapterPlugin],
    }
  }












  ngOnChanges(): void {
    if (!this.blog || !this.blogForm) return;

    const blogData = (this.blog as any).blog ?? this.blog;

    this.blogForm.patchValue({
      title: blogData.title,
      category: blogData.category,
      slug: blogData.slug,
      description: blogData.description,
      content: blogData.content,
      status: blogData.status,
      thumbnail: {
        url: blogData.thumbnail?.[0] || '', publicId: ''
      }
    });

    if (Array.isArray(blogData.thumbnail)) {
      this.selectedFiles = blogData.thumbnail.map((img: { url: string, publicId: string }) => ({
        file: null,
        preview: img.url,
        publicId: img.publicId,
        isUploading: false,
        uploadError: false
      }));
    }
  }











  //==============  CKEDITOR =================
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










  // ================= FILE UPLOAD =================
  onFileChange(event: any): void {
    const file: File = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const controller = new AbortController();
      this.selectedFiles = [{
        file,
        preview: e.target.result,
        publicId: null,
        isUploading: true,
        uploadError: false,
        controller
      }];

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
          this.blogForm.patchValue({
            thumbnail: {
              url: res.url,
              publicId: res.publicId
            }
          })
        },
        error: (err) => {
          console.error("Upload error", err);
          const item = this.selectedFiles[0];
          if (item) {
            item.isUploading = false;
            item.uploadError = true;
          }
        }
      });
    };
    reader.readAsDataURL(file);

    event.target.value = '';
  }


  // ================= REMOVE FILE =================
  removeFile(): void {
    const img = this.selectedFiles[0];
    if (!img) return;

    if (img.isUploading && img.controller) {
      img.controller.abort();
      console.log('Upload aborted');
    }

    if (!img.isUploading && img.publicId) {
      this.blogService.removeUploadedImage(img.publicId).subscribe({
        next: () => console.log('Deleted on server'),
        error: (err) => console.error('Error deleting:', err)
      });
    }

    this.selectedFiles = [];
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }





  onSubmit() {
    if (this.blogForm.invalid) {
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
      .map(item => ({ url: item.preview, publicId: item.publicId }))


    const blogData: BlogDetails = {
      ...this.blogForm.value,
      thumbnail: finalImageUrls
    }

    console.log('=== FULL BLOG PAYLOAD ===');
    console.log(blogData);

    this.editBlog.emit(blogData);
  }

}