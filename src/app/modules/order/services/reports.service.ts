import { Injectable } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { OrderService, Order } from './order.service';
import html2canvas from 'html2canvas';

export interface ReportStats {
  totalOrders: number;
  totalRevenue: number;
  totalDiscount: number;
  averageOrderValue: number;
  completedOrders: number;
  maxDailySale: number;
  maxDailySaleDate: string;
  ordersByStatus: { status: string; count: number; color: string }[];
  dailySales: { date: string; total: number }[];
  weeklySales: { week: string; total: number }[];
  topProducts: { name: string; quantity: number; revenue: number }[]; // فعلاً خالی
  salesByCity: { city: string; total: number; count: number }[];
  salesByProvince: { province: string; total: number; count: number }[];
}

export interface ComparativeStats {
  period1: ReportStats;
  period2: ReportStats;
  changes: {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
  };
}

@Injectable({ providedIn: 'root' })
export class ReportsService {
  constructor(private orderService: OrderService) { }

  getReportStats(startDate?: Date, endDate?: Date): Observable<ReportStats> {
    return this.orderService.getOrders().pipe(
      map((orders: Order[]) => {
        // فیلتر تاریخ
        let filtered = orders;
        if (startDate && endDate) {
          filtered = orders.filter(o => {
            const d = new Date(o.create_at);
            return d >= startDate && d <= endDate;
          });
        }

        // آمار پایه
        const totalOrders = filtered.length;
        const totalRevenue = filtered.reduce((sum, o) => sum + (o.final_amount || 0), 0);
        const totalDiscount = filtered.reduce((sum, o) => sum + (o.discount_amount || 0), 0);
        const averageOrderValue = totalOrders ? totalRevenue / totalOrders : 0;
        const completedOrders = filtered.filter(o => o.status === 'delivered').length;

        // بیشترین فروش روزانه
        const dailyMap = new Map<string, number>();
        filtered.forEach(o => {
          if (!o.create_at) return;
          const date = new Date(o.create_at).toISOString().split('T')[0];
          dailyMap.set(date, (dailyMap.get(date) || 0) + (o.final_amount || 0));
        });
        let maxDailySale = 0, maxDailySaleDate = '';
        dailyMap.forEach((val, date) => {
          if (val > maxDailySale) {
            maxDailySale = val;
            maxDailySaleDate = date;
          }
        });
        const dailySales = Array.from(dailyMap.entries())
          .map(([date, total]) => ({ date, total }))
          .sort((a, b) => a.date.localeCompare(b.date));

        // فروش هفتگی
        const weeklyMap = new Map<string, number>();
        filtered.forEach(o => {
          if (!o.create_at) return;
          const d = new Date(o.create_at);
          const weekStart = this.getWeekStart(d);
          const weekKey = weekStart.toISOString().split('T')[0];
          weeklyMap.set(weekKey, (weeklyMap.get(weekKey) || 0) + (o.final_amount || 0));
        });
        const weeklySales = Array.from(weeklyMap.entries())
          .map(([week, total]) => ({ week, total }))
          .sort((a, b) => a.week.localeCompare(b.week));

        // وضعیت سفارشات
        const statusColors: any = {
          pending: '#f39c12',
          ordered: '#3498db',
          inProcess: '#9b59b6',
          packed: '#e67e22',
          inTransit: '#1abc9c',
          delivered: '#2ecc71',
          canceled: '#e74c3c'
        };
        const statusCountMap = new Map<string, number>();
        filtered.forEach(o => {
          const st = o.status || 'unknown';
          statusCountMap.set(st, (statusCountMap.get(st) || 0) + 1);
        });
        const ordersByStatus = Array.from(statusCountMap.entries())
          .map(([status, count]) => ({
            status,
            count,
            color: statusColors[status] || '#95a5a6'
          }));

        // ----- پرفروش‌ترین محصولات (فعلاً خالی، چون داده نداریم) -----
        // ----- پرفروش‌ترین محصولات (با استفاده از orderItems) -----
        const productMap = new Map<number, { name: string; quantity: number; revenue: number }>();
        filtered.forEach(order => {
          // دسترسی به orderItems (با توجه به تغییر بک‌اند)
          const items = (order as any).orderItems || [];
          items.forEach((item: any) => {
            const product = item.product;
            if (!product) return;
            const productId = product.id;
            const productName = product.productName || 'نامشخص';
            const quantity = item.quantity || 0;
            const price = item.price || 0;
            const revenue = price * quantity;

            if (productMap.has(productId)) {
              const existing = productMap.get(productId)!;
              existing.quantity += quantity;
              existing.revenue += revenue;
            } else {
              productMap.set(productId, { name: productName, quantity, revenue });
            }
          });
        });
        const topProducts = Array.from(productMap.values())
          .sort((a, b) => b.revenue - a.revenue) // مرتب‌سازی نزولی بر اساس درآمد
          .slice(0, 10); // ۱۰ محصول برتر

        // ----- آمار جغرافیایی با استفاده از shippingAddress -----
        const provinceMap = new Map<string, { total: number; count: number }>();
        const cityMap = new Map<string, { total: number; count: number }>();

        filtered.forEach(order => {
          const shipping = (order as any).shippingAddress; // دسترسی به shippingAddress
          const province = shipping?.province || 'نامشخص';
          const city = shipping?.city || 'نامشخص';
          const amount = order.final_amount || 0;

          if (provinceMap.has(province)) {
            const p = provinceMap.get(province)!;
            p.total += amount;
            p.count += 1;
          } else {
            provinceMap.set(province, { total: amount, count: 1 });
          }
          if (cityMap.has(city)) {
            const c = cityMap.get(city)!;
            c.total += amount;
            c.count += 1;
          } else {
            cityMap.set(city, { total: amount, count: 1 });
          }
        });

        const salesByProvince = Array.from(provinceMap.entries()).map(([province, val]) => ({ province, ...val }));
        const salesByCity = Array.from(cityMap.entries()).map(([city, val]) => ({ city, ...val }));

        return {
          totalOrders,
          totalRevenue,
          totalDiscount,
          averageOrderValue,
          completedOrders,
          maxDailySale,
          maxDailySaleDate,
          ordersByStatus,
          dailySales,
          weeklySales,
          topProducts,
          salesByCity,
          salesByProvince
        };
      })
    );
  }

  getComparativeStats(period1: { start: Date; end: Date }, period2: { start: Date; end: Date }): Observable<ComparativeStats> {
    return forkJoin({
      period1: this.getReportStats(period1.start, period1.end),
      period2: this.getReportStats(period2.start, period2.end)
    }).pipe(
      map(({ period1, period2 }) => {
        const changes = {
          totalOrders: this.percentChange(period1.totalOrders, period2.totalOrders),
          totalRevenue: this.percentChange(period1.totalRevenue, period2.totalRevenue),
          averageOrderValue: this.percentChange(period1.averageOrderValue, period2.averageOrderValue)
        };
        return { period1, period2, changes };
      })
    );
  }

  private percentChange(oldVal: number, newVal: number): number {
    if (oldVal === 0) return newVal > 0 ? 100 : 0;
    return ((newVal - oldVal) / oldVal) * 100;
  }

  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = (day === 0 ? 6 : day - 1); // شنبه شروع هفته
    d.setDate(d.getDate() - diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }




async generatePDF(stats: ReportStats, title: string): Promise<void> {
  try {
    // ایجاد المان موقت با عرض ثابت و فونت بزرگتر
    const element = document.createElement('div');
    element.style.direction = 'rtl';
    element.style.fontFamily = 'Vazir, Tahoma, Arial, sans-serif';
    element.style.fontSize = '16px'; // فونت بزرگتر
    element.style.width = '800px'; // عرض ثابت برای نمایش مناسب
    element.style.padding = '20px';
    element.style.background = 'white';
    element.style.margin = '0 auto';
    element.style.boxSizing = 'border-box';
    element.innerHTML = `
      <h1 style="text-align:center; color:#2c3e50; font-size:24px;">${title}</h1>
      <hr/>
      <h2 style="font-size:20px;">خلاصه آمار</h2>
      <table style="width:100%; border-collapse: collapse; margin-bottom:20px; font-size:16px;" border="1">
        <tr style="background:#f2f2f2;"><th style="padding:8px;">شاخص</th><th style="padding:8px;">مقدار</th></tr>
        <tr><td style="padding:8px;">تعداد سفارشات</td><td style="padding:8px;">${stats.totalOrders}</td></tr>
        <tr><td style="padding:8px;">مجموع درآمد</td><td style="padding:8px;">${stats.totalRevenue.toLocaleString('fa-IR')} تومان</td></tr>
        <tr><td style="padding:8px;">مجموع تخفیف</td><td style="padding:8px;">${stats.totalDiscount.toLocaleString('fa-IR')} تومان</td></tr>
        <tr><td style="padding:8px;">میانگین هر سفارش</td><td style="padding:8px;">${stats.averageOrderValue.toLocaleString('fa-IR')} تومان</td></tr>
        <tr><td style="padding:8px;">تکمیل شده</td><td style="padding:8px;">${stats.completedOrders}</td></tr>
        <tr><td style="padding:8px;">بیشترین فروش روز</td><td style="padding:8px;">${stats.maxDailySale.toLocaleString('fa-IR')} تومان (${stats.maxDailySaleDate})</td></tr>
      </table>
      ${stats.topProducts.length > 0 ? `
        <h2 style="font-size:20px;">پرفروش‌ترین محصولات</h2>
        <table style="width:100%; border-collapse: collapse; font-size:16px;" border="1">
          <tr style="background:#f2f2f2;"><th style="padding:8px;">نام محصول</th><th style="padding:8px;">تعداد</th><th style="padding:8px;">درآمد</th></tr>
          ${stats.topProducts.map(p => `
            <tr><td style="padding:8px;">${p.name}</td><td style="padding:8px;">${p.quantity}</td><td style="padding:8px;">${p.revenue.toLocaleString('fa-IR')} تومان</td></tr>
          `).join('')}
        </table>
      ` : ''}
    `;

    document.body.appendChild(element);
    
    const canvas = await html2canvas(element, {
      scale: 2, // کیفیت عالی
      backgroundColor: '#ffffff',
      logging: false,
      allowTaint: false,
      useCORS: true
    });
    
    document.body.removeChild(element);
    
    const JsPDF = (await import('jspdf')).default;
    const doc = new JsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: 'a4'
    });
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // محاسبه اندازه تصویر متناسب با عرض صفحه
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // اگر ارتفاع تصویر بیشتر از صفحه، می‌توان به صفحه‌های بعد تقسیم کرد
    if (imgHeight > pageHeight) {
      // در اینجا می‌توان تصویر را به چند صفحه تقسیم کرد (اختیاری)
      // برای سادگی، فقط همان صفحه اول قرار می‌گیرد
    }
    
    doc.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
    doc.save(`report-${new Date().toISOString()}.pdf`);
  } catch (error) {
    console.error('خطا در تولید PDF:', error);
  }
}

// Excel
generateExcel(stats: ReportStats, title: string): void {
  import('xlsx').then(XLSX => {
    const wb = XLSX.utils.book_new();
    const summaryData = [
      ['شاخص', 'مقدار'],
      ['تعداد سفارشات', stats.totalOrders],
      ['مجموع درآمد', stats.totalRevenue],
      ['مجموع تخفیف', stats.totalDiscount],
      ['میانگین هر سفارش', stats.averageOrderValue],
      ['تحویل داده شده', stats.completedOrders],
      ['بیشترین فروش روز', stats.maxDailySale],
      ['تاریخ بیشترین فروش', stats.maxDailySaleDate]
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'خلاصه');

    const dailyData = [
      ['تاریخ', 'فروش (تومان)'],
      ...stats.dailySales.map(d => [d.date, d.total])
    ];
    const wsDaily = XLSX.utils.aoa_to_sheet(dailyData);
    XLSX.utils.book_append_sheet(wb, wsDaily, 'فروش روزانه');

    if (stats.salesByProvince.length) {
      const provinceData = [
        ['استان', 'تعداد سفارش', 'فروش (تومان)'],
        ...stats.salesByProvince.map(p => [p.province, p.count, p.total])
      ];
      const wsProvince = XLSX.utils.aoa_to_sheet(provinceData);
      XLSX.utils.book_append_sheet(wb, wsProvince, 'فروش استانی');
    }

    XLSX.writeFile(wb, `report-${new Date().toISOString()}.xlsx`);
  });
}
}