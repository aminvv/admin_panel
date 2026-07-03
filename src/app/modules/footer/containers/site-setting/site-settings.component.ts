import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SiteSettingsService } from '../../services/site-settings.service';
import { SiteSettings } from '../../models/interface SiteSettings-model';

@Component({
  selector: 'app-site-settings',
  templateUrl: './site-settings.component.html',
  styleUrls: ['./site-settings.component.scss'],
})
export class SiteSettingsComponent implements OnInit {
  settings: SiteSettings = {
    siteName: '',
    siteDescription: '',
    email: '',
    phone: '',
    address: '',
    instagram: '',
    telegram: '',
    whatsapp: '',
    linkedin: '',
    enamad: '',
    samandehi: '',
    paymentGateways: [],
    newsletterEnabled: true,
    newsletterText: '',
    footerLinks: [],
  };

  loading = true;
  saving = false;
  activeTab: 'general' | 'social' | 'trust' | 'links' | 'newsletter' = 'general';

  gatewayOptions = [
    { value: 'zarinpal', label: 'زرین‌پال' },
    { value: 'idpay', label: 'آیدی پی' },
    { value: 'parsian', label: 'پارسیان' },
  ];

  constructor(
    private siteSettingsService: SiteSettingsService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.siteSettingsService.getSettings().subscribe({
      next: (data) => {
        this.settings = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastr.error('خطا در دریافت تنظیمات');
      },
    });
  }

  save() {
    this.saving = true;
    this.siteSettingsService.updateSettings(this.settings).subscribe({
      next: (data) => {
        this.settings = data;
        this.saving = false;
        this.toastr.success('تنظیمات با موفقیت ذخیره شد');
      },
      error: () => {
        this.saving = false;
        this.toastr.error('خطا در ذخیره تنظیمات');
      },
    });
  }

  toggleGateway(value: string) {
    const idx = this.settings.paymentGateways.indexOf(value);
    if (idx > -1) this.settings.paymentGateways.splice(idx, 1);
    else this.settings.paymentGateways.push(value);
  }

  hasGateway(value: string): boolean {
    return this.settings.paymentGateways.includes(value);
  }

  addColumn() {
    this.settings.footerLinks.push({ title: '', links: [] });
  }

  removeColumn(i: number) {
    this.settings.footerLinks.splice(i, 1);
  }

  addLink(colIndex: number) {
    this.settings.footerLinks[colIndex].links.push({ label: '', url: '' });
  }

  removeLink(colIndex: number, linkIndex: number) {
    this.settings.footerLinks[colIndex].links.splice(linkIndex, 1);
  }
}