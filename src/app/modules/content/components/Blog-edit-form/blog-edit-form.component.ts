import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { BlogService } from '../../services';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';

@Component({
  selector: 'app-blog-edit-form',
  templateUrl: './blog-edit-form.component.html',
  styleUrls: ['./blog-edit-form.component.scss']
})
export class BlogEditFormComponent implements OnInit {
  @Input() blog: any = null
  @Output() editBlog = new EventEmitter<FormData>();

  blogForm!: FormGroup;
  imagePreviews: string[] = [];

  constructor(private fb: FormBuilder, private blogService: BlogService) { }

  ngOnInit(): void {
    this.blogForm = this.fb.group({
      title: [this.blog?.title || '', Validators.required],
      slug: [this.blog?.slug || ''],
      category: [this.blog?.category || '', Validators.required],
      description: [this.blog?.description || '', Validators.required],
      content: [this.blog?.content || '', Validators.required],
      images: this.fb.array([]),
      status: [this.blog?.status || 'draft', Validators.required]
    });

    if (this.blog?.images?.length) {
      this.imagePreviews = [...this.blog.images.map((i: any) => i.url)];
    }
  }

  get images(): FormArray {
    return this.blogForm.get('images') as FormArray;
  }

  onImageChange(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      for (let file of files) {
        if (this.images.length >= 5) break;
        const reader = new FileReader();
        reader.onload = (e: any) => this.imagePreviews.push(e.target.result);
        reader.readAsDataURL(file);
        this.images.push(this.fb.control(file));
      }
    }
  }

  removeImage(index: number) {
    this.images.removeAt(index);
    this.imagePreviews.splice(index, 1);
  }




  public Editor = ClassicEditor;

  content = ''; // این رو می‌تونی به FormControl وصل کنی



  onSubmit() {
    if (this.blogForm.invalid) return;

    const formData = new FormData();
    Object.keys(this.blogForm.controls).forEach(key => {
      if (key === 'images') {
        this.images.controls.forEach(fileCtrl => formData.append('image', fileCtrl.value));
      } else {
        formData.append(key, this.blogForm.get(key)?.value);
      }
    });

    this.editBlog.emit(formData);
  }
}
