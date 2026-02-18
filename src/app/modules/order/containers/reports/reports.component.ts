import { Component, OnInit, OnDestroy, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { ReportsService, ReportStats, ComparativeStats } from '../../services/reports.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import Chart from 'chart.js/auto';


function toJalali(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const formatter = new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  const parts = formatter.formatToParts(date);
  const year = parts.find(p => p.type === 'year')?.value || '';
  const month = parts.find(p => p.type === 'month')?.value || '';
  const day = parts.find(p => p.type === 'day')?.value || '';
  return `${day}/${month}`; // برای برچسب محور افقی (روز/ماه)
}

function toJalaliFull(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const formatter = new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  return formatter.format(date); // برای tooltip (مثلاً ۲۵ اسفند ۱۴۰۵)
}

export type ChartType = 'bar' | 'line' | 'pie' | 'doughnut' | 'radar' | 'bubble';

export interface Widget {
  id: string;
  title: string;
  type: 'card' | 'chart';
  visible: boolean;
  dataKey?: string;
  chartType?: ChartType;
  chartDataKey?: string;
}

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit, OnDestroy, AfterViewInit {
  stats: ReportStats | null = null;
  comparativeStats: ComparativeStats | null = null;
  loading = false;
  comparativeMode = false;

  period1 = {
    start: new Date(new Date().setDate(new Date().getDate() - 30)),
    end: new Date()
  };
  period2 = {
    start: new Date(new Date().setDate(new Date().getDate() - 60)),
    end: new Date(new Date().setDate(new Date().getDate() - 31))
  };

  currentRange: 'week' | 'month' | 'year' | 'all' = 'all'; // پیش‌فرض همه

  availableWidgets: Widget[] = [
    { id: 'totalOrders', title: 'تعداد سفارشات', type: 'card', visible: true, dataKey: 'totalOrders' },
    { id: 'totalRevenue', title: 'مجموع درآمد', type: 'card', visible: true, dataKey: 'totalRevenue' },
    { id: 'totalDiscount', title: 'مجموع تخفیف', type: 'card', visible: true, dataKey: 'totalDiscount' },
    { id: 'averageOrderValue', title: 'میانگین هر سفارش', type: 'card', visible: true, dataKey: 'averageOrderValue' },
    { id: 'completedOrders', title: 'تحویل داده شده', type: 'card', visible: true, dataKey: 'completedOrders' },
    { id: 'maxDailySale', title: 'بیشترین فروش روز', type: 'card', visible: true, dataKey: 'maxDailySale' },
    { id: 'dailyChart', title: 'فروش روزانه', type: 'chart', visible: true, chartType: 'bar', chartDataKey: 'dailySales' },
    { id: 'statusChart', title: 'وضعیت سفارشات', type: 'chart', visible: true, chartType: 'doughnut', chartDataKey: 'ordersByStatus' },
    { id: 'weeklyChart', title: 'روند هفتگی', type: 'chart', visible: true, chartType: 'line', chartDataKey: 'weeklySales' },
    { id: 'topProductsChart', title: 'پرفروش‌ترین محصولات', type: 'chart', visible: true, chartType: 'bar', chartDataKey: 'topProducts' },
    { id: 'geoProvinceChart', title: 'پراکندگی استانی', type: 'chart', visible: true, chartType: 'bar', chartDataKey: 'salesByProvince' },
    { id: 'geoCityChart', title: 'پراکندگی شهری', type: 'chart', visible: true, chartType: 'bar', chartDataKey: 'salesByCity' },
    { id: 'radarChart', title: 'نمودار رادار (وضعیت)', type: 'chart', visible: true, chartType: 'radar', chartDataKey: 'ordersByStatus' },
  ];

  selectedWidgets: Widget[] = [];
  private charts: { [key: string]: Chart | undefined } = {};
  private destroy$ = new Subject<void>();

  constructor(
    private reportsService: ReportsService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.updateSelectedWidgets();
    this.loadData();
  }

  ngAfterViewInit(): void { }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroyAllCharts();
  }

  updateSelectedWidgets(): void {
    this.selectedWidgets = this.availableWidgets.filter(w => w.visible);
  }

  loadData(): void {
    if (this.comparativeMode) {
      this.loadComparativeData();
    } else {
      this.loadSimpleData();
    }
  }

  loadSimpleData(): void {
    this.loading = true;
    this.destroyAllCharts();

    let start: Date | undefined;
    let end: Date | undefined;

    if (this.currentRange !== 'all') {
      const range = this.getDateRangeFromRange(this.currentRange);
      start = range.start;
      end = range.end;
    }

    this.reportsService.getReportStats(start, end)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          console.log('📊 داده‌های دریافتی:', data);
          this.stats = data;
          this.comparativeStats = null;
          this.loading = false;
          this.cdr.detectChanges();
          setTimeout(() => this.renderAllCharts(), 300);
        },
        error: (err) => {
          console.error('خطا در دریافت آمار:', err);
          this.loading = false;
        }
      });
  }

  loadComparativeData(): void {
    this.loading = true;
    this.destroyAllCharts();
    this.reportsService.getComparativeStats(this.period1, this.period2)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          console.log('📊 داده‌های مقایسه‌ای:', data);
          this.comparativeStats = data;
          this.stats = null;
          this.loading = false;
          this.cdr.detectChanges();
          setTimeout(() => this.renderComparativeCharts(), 500);
        },
        error: (err) => {
          console.error('خطا در دریافت گزارش مقایسه‌ای:', err);
          this.loading = false;
        }
      });
  }

  private getDateRangeFromRange(range: string): { start: Date; end: Date } {
    const now = new Date();
    const start = new Date();
    if (range === 'week') {
      start.setDate(now.getDate() - 7);
    } else if (range === 'month') {
      start.setMonth(now.getMonth() - 1);
    } else if (range === 'year') {
      start.setFullYear(now.getFullYear() - 1);
    }
    return { start, end: now };
  }

  onRangeChange(value: string): void {
    this.currentRange = value as any;
    this.loadSimpleData();
  }

  toggleComparative(checked: boolean): void {
    this.comparativeMode = checked;
    this.loadData();
  }

  onWidgetToggle(widget: Widget, checked: boolean): void {
    widget.visible = checked;
    this.updateSelectedWidgets();
    if (this.stats) {
      this.destroyAllCharts();
      setTimeout(() => this.renderAllCharts(), 100);
    }
  }

  applyComparativeDates(): void {
    this.loadComparativeData();
  }

  private renderAllCharts(): void {
    if (!this.stats) return;
    this.selectedWidgets.forEach(widget => {
      if (widget.type === 'chart' && widget.chartDataKey && widget.chartType) {
        const data = (this.stats as any)[widget.chartDataKey];
        if (data && Array.isArray(data) && data.length > 0) {
          this.renderChart(widget.id, widget.chartType, data, widget.chartDataKey);
        }
      }
    });
  }

  private renderChart(canvasId: string, type: ChartType, data: any[], dataKey: string): void {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (this.charts[canvasId]) this.charts[canvasId]?.destroy();

    let chartConfig: any = {};

    switch (dataKey) {
      case 'dailySales':
        chartConfig = {
          type: type,
          data: {
            labels: data.map(d => toJalali(d.date)),
            datasets: [{
              label: 'فروش (میلیون تومان)',
              data: data.map(d => d.total / 1000000),
              backgroundColor: 'rgba(54, 162, 235, 0.7)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1,
              borderRadius: 8
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              tooltip: {
                callbacks: {
                  label: (ctx: any) => {
                    const value = ctx.raw * 1000000;
                    const date = data[ctx.dataIndex].date;
                    return `${toJalaliFull(date)}: ${value.toLocaleString('fa-IR')} تومان`;
                  }
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  callback: (val: any) => val + ' میلیون تومان'
                }
              }
            }
          }
        };
        break;

case 'ordersByStatus':
  if (type === 'radar') {
    const maxValue = Math.max(...data.map(item => item.count));
    // اسم‌های فارسی مستقیم
    const persianNames: any = {
      pending: 'در انتظار پرداخت',
      ordered: 'ثبت شده',
      inProcess: 'در حال پردازش',
      packed: 'در حال بارگیری',
      inTransit: 'در حال ارسال',
      delivered: 'تحویل داده شده',
      canceled: 'لغو شده'
    };
    
    chartConfig = {
      type: 'radar',
      data: {
        labels: data.map(item => persianNames[item.status] || item.status),
        datasets: [{
          label: 'تعداد سفارشات',
          data: data.map(item => item.count),
          backgroundColor: 'rgba(65, 88, 208, 0.2)',
          borderColor: '#4158D0',
          pointBackgroundColor: data.map((item: any) => item.color),
          pointBorderColor: '#fff',
          pointRadius: 5,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx: any) => `${ctx.raw} سفارش`
            }
          }
        },
        scales: {
          r: {
            beginAtZero: true,
            max: maxValue + 1,
            ticks: {
              stepSize: Math.ceil(maxValue / 5),
              callback: (val) => val
            }
          }
        }
      }
    };
  } else if (type === 'doughnut' || type === 'pie') {

    chartConfig = {
      type: type,
      data: {
        labels: data.map(item => this.getStatusText(item.status)),
        datasets: [{
          data: data.map(item => item.count),
          backgroundColor: data.map((item: any) => item.color),
          borderColor: '#fff',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } },
        cutout: type === 'doughnut' ? '65%' : undefined
      }
    };
  } else {
  
    chartConfig = {
      type: 'bar',
      data: {
        labels: data.map(item => this.getStatusText(item.status)),
        datasets: [{
          label: 'تعداد سفارشات',
          data: data.map(item => item.count),
          backgroundColor: data.map((item: any) => item.color)
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: { callbacks: { label: (ctx: any) => `${ctx.raw} سفارش` } }
        }
      }
    };
  }
  break;

      case 'weeklySales':
        chartConfig = {
          type: 'line',
          data: {
            labels: data.map((w: any) => toJalali(w.week)),
            datasets: [{
              label: 'فروش (میلیون تومان)',
              data: data.map(w => w.total / 1000000),
              borderColor: '#2ecc71',
              backgroundColor: 'rgba(46, 204, 113, 0.1)',
              tension: 0.3,
              fill: true
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              tooltip: {
                callbacks: {
                  label: (ctx: any) => {
                    const value = ctx.raw * 1000000;
                    const date = data[ctx.dataIndex].week;
                    return `${toJalaliFull(date)}: ${value.toLocaleString('fa-IR')} تومان`;
                  }
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  callback: (val: any) => val + ' میلیون تومان'
                }
              }
            }
          }
        };
        break;

      case 'topProducts':
        chartConfig = {
          type: 'bar',
          data: {
            labels: data.slice(0, 5).map(p => p.name.length > 15 ? p.name.substr(0, 15) + '...' : p.name),
            datasets: [{
              label: 'درآمد (میلیون تومان)',
              data: data.slice(0, 5).map(p => p.revenue / 1000000),
              backgroundColor: '#f39c12'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              tooltip: {
                callbacks: {
                  label: (ctx: any) => {
                    const value = ctx.raw * 1000000;
                    return `${value.toLocaleString('fa-IR')} تومان`;
                  }
                }
              }
            },
            scales: {
              y: {
                ticks: {
                  callback: (val: any) => val + ' میلیون تومان'
                }
              }
            }
          }
        };
        break;

      case 'salesByProvince':
        chartConfig = {
          type: 'bar',
          data: {
            labels: data.map(p => p.province),
            datasets: [{
              label: 'فروش (میلیون تومان)',
              data: data.map(p => p.total / 1000000),
              backgroundColor: '#9b59b6'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              tooltip: {
                callbacks: {
                  label: (ctx: any) => {
                    const value = ctx.raw * 1000000;
                    return `${value.toLocaleString('fa-IR')} تومان`;
                  }
                }
              }
            },
            scales: {
              y: {
                ticks: {
                  callback: (val: any) => val + ' میلیون تومان'
                }
              }
            }
          }
        };
        break;

      case 'salesByCity':
        chartConfig = {
          type: 'bar',
          data: {
            labels: data.map(c => c.city),
            datasets: [{
              label: 'فروش (میلیون تومان)',
              data: data.map(c => c.total / 1000000),
              backgroundColor: '#e67e22'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              tooltip: {
                callbacks: {
                  label: (ctx: any) => {
                    const value = ctx.raw * 1000000;
                    return `${value.toLocaleString('fa-IR')} تومان`;
                  }
                }
              }
            },
            scales: {
              y: {
                ticks: {
                  callback: (val: any) => val + ' میلیون تومان'
                }
              }
            }
          }
        };
        break;

      default:
        return;
    }

    this.charts[canvasId] = new Chart(ctx, chartConfig);
  }

  private renderComparativeCharts(): void {
    if (!this.comparativeStats) return;
    const period1Data = this.comparativeStats.period1.dailySales || [];
    const period2Data = this.comparativeStats.period2.dailySales || [];
    if (period1Data.length === 0 && period2Data.length === 0) return;

    setTimeout(() => {
      const canvas = document.getElementById('comparativeChart') as HTMLCanvasElement;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      if (this.charts['comparativeChart']) this.charts['comparativeChart']?.destroy();

      const allDates = new Set<string>();
      period1Data.forEach(d => allDates.add(d.date));
      period2Data.forEach(d => allDates.add(d.date));
      const sortedDates = Array.from(allDates).sort();

      const data1 = sortedDates.map(date => {
        const found = period1Data.find(d => d.date === date);
        return found ? found.total / 1000000 : 0;
      });
      const data2 = sortedDates.map(date => {
        const found = period2Data.find(d => d.date === date);
        return found ? found.total / 1000000 : 0;
      });

      this.charts['comparativeChart'] = new Chart(ctx, {
        type: 'line',
        data: {
          labels: sortedDates.map(d => toJalali(d)),
          datasets: [
            { label: 'دوره اول', data: data1, borderColor: '#3498db', backgroundColor: 'transparent', tension: 0.2 },
            { label: 'دوره دوم', data: data2, borderColor: '#e74c3c', backgroundColor: 'transparent', tension: 0.2 }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            tooltip: {
              callbacks: {
                label: (context) => {
                  const value = (context.raw as number) * 1000000;
                  const date = sortedDates[context.dataIndex];
                  return `${context.dataset.label}: ${value.toLocaleString('fa-IR')} تومان (${toJalaliFull(date)})`;
                }
              }
            }
          },
          scales: {
            y: { beginAtZero: true, ticks: { callback: (val) => val + ' میلیون تومان' } }
          }
        }
      });
    }, 300);
  }

  private destroyAllCharts(): void {
    Object.keys(this.charts).forEach(key => {
      if (this.charts[key]) {
        this.charts[key]?.destroy();
        this.charts[key] = undefined;
      }
    });
  }

  exportToPDF(): void {
    if (this.comparativeMode && this.comparativeStats) {
      this.reportsService.generatePDF(this.comparativeStats.period1, 'گزارش مقایسه‌ای - دوره اول');
    } else if (this.stats) {
      this.reportsService.generatePDF(this.stats, 'گزارش فروش');
    }
  }

  exportToExcel(): void {
    if (this.stats) this.reportsService.generateExcel(this.stats, 'گزارش فروش');
  }

formatPrice(price: number, decimals: boolean = true): string {
  if (!price && price !== 0) return '۰ تومان';
  
  const value = decimals ? price : Math.round(price);
  
  return value.toLocaleString('fa-IR') + ' تومان';
}

  formatDate(dateString: string): string {
    if (!dateString) return '---';
    const d = new Date(dateString);
    return d.toLocaleDateString('fa-IR');
  }

getStatusText(status: string): string {
  const map: any = {
    pending: 'در انتظار پرداخت',     
    ordered: 'ثبت شده',
    inProcess: 'در حال پردازش',
    packed: 'در حال بارگیری',      
    inTransit: 'در حال ارسال',
    delivered: 'تحویل داده شده',
    canceled: 'لغو شده'
  };
  return map[status] || status;
}
}