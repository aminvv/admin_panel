import { Component, OnInit } from '@angular/core';
import { CertificateService } from '../../../services/certificate.service';
import { CertificateDetails } from '../model/certificate-details.model';

@Component({
  selector: 'app-certificate-list',
  templateUrl: './certificate-list.component.html',
  styleUrls: ['./certificate-list.component.scss']
})
export class CertificateListComponent implements OnInit {
  certificates: CertificateDetails[] = [];
  selectedCertificate: CertificateDetails | null = null;
  loading = false;
  showForm = false; // 👈 جدید

  constructor(private certificateService: CertificateService) {}

  ngOnInit(): void {
    this.fetchAll();
  }

  fetchAll(): void {
    this.loading = true;
    this.certificateService.getAllAdmin().subscribe({
      next: (data) => {
        this.certificates = data;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  onEdit(cert: CertificateDetails): void {
    this.selectedCertificate = cert;
    this.showForm = true; // 👈 نمایش فرم
  }

  onAddNew(): void {
    this.selectedCertificate = null;
    this.showForm = true; // 👈 نمایش فرم
  }

  onCancel(): void {
    this.selectedCertificate = null;
    this.showForm = false; // 👈 مخفی کردن فرم
  }

  onCreate(data: CertificateDetails): void {
    this.certificateService.create(data).subscribe({
      next: () => {
        this.fetchAll();
        this.selectedCertificate = null;
        this.showForm = false; // 👈 بعد از ثبت، فرم بسته بشه
      },
      error: (err) => {
        console.log('❌ خطای سرور:', err.error);
      }
    });
  }

  onUpdate(data: CertificateDetails): void {
    this.certificateService.update(data.id as number, data).subscribe({
      next: () => {
        this.fetchAll();
        this.selectedCertificate = null;
        this.showForm = false; // 👈 بعد از ویرایش، فرم بسته بشه
      },
      error: (err) => {
        console.log('❌ خطای سرور:', err.error);
      }
    });
  }

  onDelete(id: number): void {
    if (!confirm('آیا از حذف این لوح تقدیر مطمئن هستید؟')) return;
    this.certificateService.remove(id).subscribe(() => this.fetchAll());
  }
}