import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminService, Admin } from '../../services/admin.service';
import { AuthService } from '../../../../shared/services/auth.service';

@Component({
  selector: 'app-admin-add',
  templateUrl: './admin-add.component.html',
  styleUrls: ['./admin-add.component.scss']
})
export class AdminAddComponent implements OnInit {
  form: FormGroup;
  loading = false;
  isEdit = false;
  isSuperAdmin = false; // وضعیت سوپرادمین بودن کاربر جاری

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AdminAddComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'add' | 'edit'; admin?: Admin },
    private adminService: AdminService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.isEdit = data.mode === 'edit';
  }

  ngOnInit(): void {
    this.isSuperAdmin = this.authService.isSuperAdmin();
    this.initForm();
  }

  initForm(): void {
    this.form = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', this.isEdit ? [] : [Validators.required, Validators.minLength(6)]],
      role: [{ value: 'admin', disabled: !this.isSuperAdmin }, Validators.required], // غیرفعال اگر سوپرادمین نیست
      avatar: ['']
    });

    if (this.isEdit && this.data.admin) {
      this.form.patchValue({
        fullName: this.data.admin.fullName,
        email: this.data.admin.email,
        role: this.data.admin.role,
        avatar: this.data.admin.avatar || ''
      });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    // فعال کردن موقت کنترل role برای ارسال مقدار (اگر غیرفعال باشد)
    const roleControl = this.form.get('role');
    if (roleControl?.disabled) {
      roleControl.enable({ onlySelf: true, emitEvent: false });
    }

    const formValue = this.form.value;

    if (this.isEdit && this.data.admin) {
      const dto = { ...formValue };
      if (!dto.password) delete dto.password;
      this.adminService.updateAdmin(this.data.admin.id, dto).subscribe({
        next: () => {
          this.snackBar.open('ادمین با موفقیت ویرایش شد', 'بستن', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('خطا در ایجاد:', err);
          let errorMessage = 'خطا در ایجاد ادمین';
          if (err.error && err.error.message) {
            errorMessage = err.error.message;
          } else if (err.message) {
            errorMessage = err.message;
          }
          this.snackBar.open(errorMessage, 'بستن', { duration: 5000 });
          this.loading = false;
        }
      });
    } else {
      this.adminService.createAdmin(formValue).subscribe({
        next: (res) => {

          const message =
            typeof res === 'string'
              ? res
              : typeof res.message === 'string'
                ? res.message
                : JSON.stringify(res.message);

          this.snackBar.open(message, 'بستن', {
            duration: 3000
          });
        },
        error: (err) => {

          const msg = err?.error?.message || 'خطا در ایجاد ادمین';

          this.snackBar.open(msg, 'بستن', {
            duration: 3000
          });

          this.loading = false;

          if (!this.isSuperAdmin) {
            roleControl?.disable({ onlySelf: true, emitEvent: false });
          }
        }
      });
    }
  }

  close(): void {
    this.dialogRef.close();
  }



  getRoleLabel(role: string): string {
    return role === 'superAdmin' ? 'سوپر ادمین' : 'ادمین';
  }


}