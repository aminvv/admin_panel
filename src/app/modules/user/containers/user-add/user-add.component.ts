import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService, User } from '../../services/user.service';

@Component({
  selector: 'app-user-add',
  templateUrl: './user-add.component.html',
  styleUrls: ['./user-add.component.scss']
})
export class UserAddComponent implements OnInit {
  form: FormGroup;
  loading = false;
  isEdit = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UserAddComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'add' | 'edit'; user?: User },
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {
    this.isEdit = data.mode === 'edit';
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.form = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      mobile: ['', [Validators.required, Validators.pattern(/^09\d{9}$/)]]
    });

    if (this.isEdit && this.data.user) {
      this.form.patchValue({
        firstName: this.data.user.firstName,
        lastName: this.data.user.lastName,
        mobile: this.data.user.mobile
      });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    if (this.isEdit && this.data.user) {
      this.userService.updateUser(this.data.user.id, this.form.value).subscribe({
        next: () => {
          this.snackBar.open('کاربر با موفقیت ویرایش شد', 'بستن', { duration: 3000, panelClass: 'success-snackbar' });
          this.dialogRef.close(true);
        },
        error: () => {
          this.snackBar.open('خطا در ویرایش کاربر', 'بستن', { duration: 3000, panelClass: 'error-snackbar' });
          this.loading = false;
        }
      });
    } else {
      this.userService.createUser(this.form.value).subscribe({
        next: () => {
          this.snackBar.open('کاربر با موفقیت ایجاد شد', 'بستن', { duration: 3000, panelClass: 'success-snackbar' });
          this.dialogRef.close(true);
        },
        error: () => {
          this.snackBar.open('خطا در ایجاد کاربر', 'بستن', { duration: 3000, panelClass: 'error-snackbar' });
          this.loading = false;
        }
      });
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}