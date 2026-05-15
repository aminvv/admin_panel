import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  loading = false;
  saving = false;
  editMode = false;
  activeTab: 'info' | 'settings' | 'activity' | 'security' = 'info';
  profileForm: FormGroup;
  profile: any = null;

  // تنظیمات (ذخیره در localStorage)
  settings = {
    emailNotifications: true,
    systemNotifications: true,
    darkMode: false
  };

  // امنیت
  newPassword = '';
  confirmPassword = '';

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private authService: AuthService
  ) {
    this.profileForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: [{ value: '', disabled: true }],
      avatar: ['']
    });
    this.loadSettings();
  }

  ngOnInit(): void {
    this.getCurrentUser();
  }

  loadSettings(): void {
    const saved = localStorage.getItem('profile_settings');
    if (saved) {
      try {
        this.settings = JSON.parse(saved);
      } catch(e) {}
    }
  }

  saveSettings(): void {
    localStorage.setItem('profile_settings', JSON.stringify(this.settings));
    if (this.settings.darkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }


  getCurrentUser(): void {
    this.loading = true;
    this.authService.getCurrentUserInfo().subscribe({
      next: (res) => {
        this.profile = res;
        this.profileForm.patchValue({
          fullName: res.fullName || '',
          email: res.email || '',
          avatar: res.avatar || ''
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('خطا:', err);
        this.toastr.error('خطا در دریافت اطلاعات پروفایل');
        this.loading = false;
      }
    });
  }

  toggleEditMode(): void {
    this.editMode = !this.editMode;
    if (!this.editMode && this.profile) {
      this.profileForm.patchValue({
        fullName: this.profile.fullName,
        email: this.profile.email,
        avatar: this.profile.avatar || ''
      });
    }
  }

  onSave(): void {
    if (this.profileForm.invalid) {
      this.toastr.error('لطفاً اطلاعات را صحیح وارد کنید');
      return;
    }

    this.saving = true;
    const formValue = this.profileForm.value;
    const dto: any = {
      fullName: formValue.fullName,
      avatar: formValue.avatar || undefined
    };

    this.authService.updateProfile(dto).subscribe({
      next: (res) => {
        this.toastr.success(res.message || 'پروفایل با موفقیت به‌روزرسانی شد');
        this.editMode = false;
        this.saving = false;
        this.getCurrentUser();
      },
      error: (err) => {
        console.error('خطا:', err);
        const msg = err.error?.message || 'خطا در به‌روزرسانی پروفایل';
        this.toastr.error(msg);
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
        avatar: this.profile.avatar || '',
      });
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
      error: (err) => {
        const msg = err.error?.message || 'خطا در تغییر رمز عبور';
        this.toastr.error(msg);
      }
    });
  }

  getInitials(): string {
    if (!this.profile || !this.profile.fullName) return '';
    const name = this.profile.fullName;
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
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
    return date.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getRoleLabel(role: string): string {
    return role === 'superAdmin' ? 'سوپر ادمین' : 'ادمین';
  }

  getRoleIcon(role: string): string {
    return role === 'superAdmin' ? 'star' : 'shield';
  }
}