import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ContactService } from '../../services/contact.service';
import { ContactPage } from '../../models/contact.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-contact-management',
  templateUrl: './contact-management.component.html',
  styleUrls: ['./contact-management.component.scss'],
})
export class ContactManagementComponent implements OnInit {
  form: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private contactService: ContactService,
    private toastr: ToastrService,
  ) {
    this.form = this.fb.group({
      address: [''],
      phone: [''],
      mobile: [''],
      email: [''],
      workHours: [''],
      mapLat: [null],
      mapLng: [null],
      socialLinks: this.fb.array([]),
    });
  }

  get socialLinks(): FormArray {
    return this.form.get('socialLinks') as FormArray;
  }

  ngOnInit(): void {
    this.loading = true;
    this.contactService.get().subscribe({
      next: (data) => this.patchForm(data),
      error: () => (this.loading = false),
      complete: () => (this.loading = false),
    });
  }

  private patchForm(data: ContactPage): void {
    this.form.patchValue(data);
    this.socialLinks.clear();
    data.socialLinks?.forEach((s) =>
      this.socialLinks.push(this.fb.group({ platform: [s.platform], url: [s.url] })),
    );
  }

  addSocial(): void {
    this.socialLinks.push(this.fb.group({ platform: [''], url: [''] }));
  }

  removeSocial(index: number): void {
    this.socialLinks.removeAt(index);
  }

 save(): void {
    this.contactService.update(this.form.value).subscribe({
      next: (response: any) => {
        this.toastr.success(response?.message || 'اطلاعات تماس با ما با موفقیت ذخیره شد');
      },
      error: (err) => {
        this.toastr.error(err?.error?.message || 'خطا در ذخیره‌سازی اطلاعات');
      },
    });
  }
}