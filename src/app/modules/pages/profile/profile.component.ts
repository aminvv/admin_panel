import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../shared/services/auth.service';
import { ProfileService } from './profile.service';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  loading = false;
  saving = false;
  uploading = false;
  editMode = false;
  activeTab: 'info' | 'security' = 'info';
  profileForm: FormGroup;
  profile: any = null;
  previewAvatar: string | null = null;

  newPassword = '';
  confirmPassword = '';

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private authService: AuthService,
    private profileService: ProfileService
  ) {
    this.profileForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: [{ value: '', disabled: true }],
    });
  }

  ngOnInit(): void {
    this.getCurrentUser();
  }

  getCurrentUser(): void {
    this.loading = true;
    this.authService.getCurrentUserInfo().subscribe({
      next: (res) => {
        this.profile = res;
        this.profileForm.patchValue({
          fullName: res.fullName || '',
          email: res.email || '',
        });
        
        // ساخت آدرس کامل عکس
        if (res.avatar) {
          const cleanPath = res.avatar.replace(/\\/g, '/');
          this.previewAvatar = `${environment.apiUrl}/${cleanPath}`;
        } else {
          this.previewAvatar = null;
        }
        
        this.loading = false;
      },
      error: () => {
        this.toastr.error('خطا در دریافت اطلاعات پروفایل');
        this.loading = false;
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];

    if (!file.type.startsWith('image/')) {
      this.toastr.error('لطفاً فقط فایل تصویر انتخاب کنید');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      this.toastr.error('حجم فایل باید کمتر از ۲ مگابایت باشد');
      return;
    }

    // پیش‌نمایش موقت
    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewAvatar = e.target?.result as string;
    };
    reader.readAsDataURL(file);

    this.uploading = true;
    const fileName = `profile_${Date.now()}`;
    const altName = 'تصویر پروفایل';

    this.profileService.uploadAvatar(file, altName, fileName).subscribe({
      next: () => {
        this.toastr.success('تصویر با موفقیت آپلود شد');
        this.getCurrentUser(); // بارگذاری مجدد پروفایل برای دریافت آواتار جدید
        this.uploading = false;
      },
      error: () => {
        this.toastr.error('خطا در آپلود تصویر');
        this.uploading = false;
      }
    });
  }

  toggleEditMode(): void {
    this.editMode = !this.editMode;
    if (!this.editMode && this.profile) {
      this.profileForm.patchValue({
        fullName: this.profile.fullName,
        email: this.profile.email,
      });
      
      // بازگرداندن آواتار قبلی
      if (this.profile.avatar) {
        const cleanPath = this.profile.avatar.replace(/\\/g, '/');
        this.previewAvatar = `${environment.apiUrl}/${cleanPath}`;
      } else {
        this.previewAvatar = null;
      }
    }
  }

  onSave(): void {
    if (this.profileForm.invalid) {
      this.toastr.error('لطفاً اطلاعات را صحیح وارد کنید');
      return;
    }

    this.saving = true;
    const dto = { fullName: this.profileForm.value.fullName };

    this.profileService.updateProfile(dto).subscribe({
      next: (res) => {
        this.toastr.success(res.message || 'پروفایل با موفقیت به‌روزرسانی شد');
        this.editMode = false;
        this.saving = false;
        this.getCurrentUser();
      },
      error: () => {
        this.toastr.error('خطا در به‌روزرسانی پروفایل');
        this.saving = false;
      }
    });
  }

  onCancel(): void {
    this.editMode = false;
    if (this.profile) {
      this.profileForm.patchValue({
        fullName: this.profile.fullName,
        email: this.profile.email,
      });
      
      if (this.profile.avatar) {
        const cleanPath = this.profile.avatar.replace(/\\/g, '/');
        this.previewAvatar = `${environment.apiUrl}/${cleanPath}`;
      } else {
        this.previewAvatar = null;
      }
    }
  }

  changePassword(): void {
    if (!this.newPassword) {
      this.toastr.error('رمز عبور جدید را وارد کنید');
      return;
    }
    if (this.newPassword.length < 6) {
      this.toastr.error('رمز عبور باید حداقل ۶ کاراکتر باشد');
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.toastr.error('رمز عبور و تکرار آن مطابقت ندارند');
      return;
    }

    this.authService.updateProfile({ password: this.newPassword }).subscribe({
      next: (res) => {
        this.toastr.success(res.message || 'رمز عبور با موفقیت تغییر کرد');
        this.newPassword = '';
        this.confirmPassword = '';
      },
      error: () => {
        this.toastr.error('خطا در تغییر رمز عبور');
      }
    });
  }

  getInitials(): string {
    if (!this.profile?.fullName) return '';
    const parts = this.profile.fullName.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return this.profile.fullName.substring(0, 2).toUpperCase();
  }

  getMemberDays(): number {
    if (!this.profile?.create_at && !this.profile?.createdAt) return 0;
    const dateStr = this.profile.create_at || this.profile.createdAt;
    const registerDate = new Date(dateStr);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - registerDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }




formatDate(dateString: string): string {
  if (!dateString) return '—';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return '—';
  }
  
  return date.toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}




  getRoleLabel(role: string): string {
    return role === 'superAdmin' ? 'سوپر ادمین' : 'ادمین';
  }

  getRoleIcon(role: string): string {
    return role === 'superAdmin' ? 'verified_user' : 'security';
  }
}