// src/app/modules/dashboard/containers/dashboard-page.component.ts
import { Component, OnInit } from '@angular/core';
import { DashboardService, DashboardStats } from '../../services';

@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.scss']
})
export class DashboardPageComponent implements OnInit {
  stats: DashboardStats | null = null;
  loading = true;
  error: string | null = null;

  // گزینه‌های نمودارها
  dailySalesChartOptions: any;
  ordersStatusChartOptions: any;
  topProductsChartOptions: any;
  userTrendChartOptions: any;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.dashboardService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.initCharts(data);
        this.loading = false;
      },
      error: (err) => {
        console.error('خطا در بارگذاری داشبورد', err);
        this.error = 'خطا در بارگذاری اطلاعات';
        this.loading = false;
      }
    });
  }

  private initCharts(stats: DashboardStats): void {
    // نمودار فروش روزانه
    this.dailySalesChartOptions = {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      xAxis: { type: 'category', data: stats.dailySales.map(d => d.date) },
      yAxis: { type: 'value', name: 'تومان' },
      series: [{
        name: 'فروش',
        type: 'line',
        data: stats.dailySales.map(d => d.total),
        smooth: true,
        lineStyle: { color: '#3f51b5', width: 3 },
        areaStyle: { color: 'rgba(63,81,181,0.1)' }
      }],
      grid: { left: '10%', right: '5%', top: 20, bottom: 20 }
    };

    // نمودار وضعیت سفارشات (دایره‌ای)
    this.ordersStatusChartOptions = {
      tooltip: { trigger: 'item' },
      legend: { orient: 'vertical', left: 'left', top: 'center', textStyle: { fontFamily: 'Vazir' } },
      series: [{
        name: 'وضعیت سفارشات',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
        label: { show: false },
        emphasis: { label: { show: true, fontSize: '12', fontWeight: 'bold' } },
        data: stats.ordersByStatus.map(s => ({ name: s.status, value: s.count, itemStyle: { color: s.color } }))
      }]
    };

    // نمودار محصولات پرفروش
    this.topProductsChartOptions = {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      xAxis: { type: 'category', data: stats.topProducts.map(p => p.name) },
      yAxis: { type: 'value', name: 'تعداد' },
      series: [{
        name: 'تعداد فروش',
        type: 'bar',
        data: stats.topProducts.map(p => p.quantity),
        itemStyle: { color: '#ff9800' }
      }],
      grid: { left: '10%', right: '5%', top: 20, bottom: 20 }
    };

    // نمودار روند ثبت‌نام کاربران
    this.userTrendChartOptions = {
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: stats.userRegistrationTrend.map(d => d.date) },
      yAxis: { type: 'value', name: 'تعداد' },
      series: [{
        name: 'کاربران جدید',
        type: 'bar',
        data: stats.userRegistrationTrend.map(d => d.count),
        itemStyle: { color: '#4caf50' }
      }],
      grid: { left: '10%', right: '5%', top: 20, bottom: 20 }
    };
  }

  formatDate(dateString: string): string {
    return dateString ? new Date(dateString).toLocaleDateString('fa-IR') : '';
  }

formatPrice(price: number): string {
  if (!price) return '۰ تومان';
  const rounded = Math.round(price);
  return new Intl.NumberFormat('fa-IR').format(rounded) + ' تومان';
}


  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      pending: 'status-pending',
      ordered: 'status-ordered',
      inProcess: 'status-processing',
      packed: 'status-packed',
      inTransit: 'status-shipped',
      delivered: 'status-delivered',
      canceled: 'status-cancelled'
    };
    return map[status] || '';
  }

  getStatusText(status: string): string {
    const map: Record<string, string> = {
      pending: 'در انتظار',
      ordered: 'ثبت شده',
      inProcess: 'در حال پردازش',
      packed: 'بسته‌بندی',
      inTransit: 'در حال ارسال',
      delivered: 'تحویل شده',
      canceled: 'لغو شده'
    };
    return map[status] || status;
  }
}