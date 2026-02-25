import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminService } from '../../services/admin.service';
import { User } from '../../services/user.service';

@Component({
  selector: 'app-promote-dialog',
  template: `
    <h2 mat-dialog-title>ارتقا به ادمین</h2>
    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>ایمیل</mat-label>
          <input matInput formControlName="email" type="email">
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>نام کامل</mat-label>
          <input matInput formControlName="fullName">
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>رمز عبور</mat-label>
          <input matInput formControlName="password" type="password">
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="close()">انصراف</button>
      <button mat-raised-button color="primary" [disabled]="form.invalid" (click)="promote()">ارتقا</button>
    </mat-dialog-actions>
  `,
  styles: ['.full-width { width: 100%; margin-bottom: 15px; }']
})
export class PromoteDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<PromoteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user: User },
    private adminService: AdminService,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      fullName: [`${data.user.firstName} ${data.user.lastName}`, Validators.required],
      password: ['', Validators.required]
    });
  }

  promote(): void {
    this.adminService.promoteToAdmin(this.data.user.id, this.form.value).subscribe({
      next: () => {
        this.snackBar.open('کاربر با موفقیت به ادمین ارتقا یافت', 'بستن', { duration: 2000 });
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('خطا در ارتقا:', err);
        this.snackBar.open('خطا در ارتقا', 'بستن', { duration: 3000 });
      }
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}