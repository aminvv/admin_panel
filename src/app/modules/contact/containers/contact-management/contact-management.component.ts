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
      phone: this.fb.array([]),
      mobile: this.fb.array([]),
      email: [''],
      workHours: [''],
      mapLat: [null],
      mapLng: [null],
      socialLinks: this.fb.array([]),
    });
  }

  get phone(): FormArray {
    return this.form.get('phone') as FormArray;
  }

  get mobile(): FormArray {
    return this.form.get('mobile') as FormArray;
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
    this.form.patchValue({
      address: data.address,
      email: data.email,
      workHours: data.workHours,
      mapLat: data.mapLat,
      mapLng: data.mapLng,
    });

    this.phone.clear();
    this.normalizeToArray(data.phone).forEach((v) =>
      this.phone.push(this.fb.control(v)),
    );

    this.mobile.clear();
    this.normalizeToArray(data.mobile).forEach((v) =>
      this.mobile.push(this.fb.control(v)),
    );

    this.socialLinks.clear();
    data.socialLinks?.forEach((s) =>
      this.socialLinks.push(this.fb.group({ platform: [s.platform], url: [s.url] })),
    );
  }

  // برای سازگاری با دیتای قدیمی که ممکنه هنوز رشته تکی (نه آرایه) باشه
  private normalizeToArray(value: any): string[] {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string' && value) return [value];
    return [];
  }

  addPhone(): void {
    this.phone.push(this.fb.control(''));
  }
  removePhone(index: number): void {
    this.phone.removeAt(index);
  }

  addMobile(): void {
    this.mobile.push(this.fb.control(''));
  }
  removeMobile(index: number): void {
    this.mobile.removeAt(index);
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