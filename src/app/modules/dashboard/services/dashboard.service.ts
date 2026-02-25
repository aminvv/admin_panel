// src/app/modules/dashboard/services/dashboard.service.ts
import { Injectable } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { OrderService, Order } from '../../order/services/order.service';
import { UserService, User } from '../../user/services/user.service';
import { ReportsService } from '../../order/services/reports.service';

export interface DashboardStats {
  // کارت‌های آمار کلی
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  averageOrderValue: number;
  totalDiscount: number;

  // نمودارها
  ordersByStatus: { status: string; count: number; color: string }[];
  dailySales: { date: string; total: number }[];
  topProducts: { name: string; quantity: number; revenue: number }[];
  userRegistrationTrend: { date: string; count: number }[];

  // جداول اخیر
  recentOrders: Order[];
  recentUsers: User[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(
    private orderService: OrderService,
    private userService: UserService,
    private reportsService: ReportsService
  ) {}

  getDashboardStats(): Observable<DashboardStats> {
    return forkJoin({
      orders: this.orderService.getOrders(),
      users: this.userService.getUsers(),
      report: this.reportsService.getReportStats() // دریافت آمار کامل گزارشات
    }).pipe(
      map(({ orders, users, report }) => {
        // آمار پایه
        const totalOrders = orders.length;
        const totalUsers = users.filter(u => !u.deleted_at).length;
        const totalRevenue = report.totalRevenue;
        const pendingOrders = orders.filter(o => o.status === 'pending').length;
        const completedOrders = report.completedOrders;
        const cancelledOrders = orders.filter(o => o.status === 'canceled').length;
        const averageOrderValue = report.averageOrderValue;
        const totalDiscount = report.totalDiscount;

        // استفاده از داده‌های گزارشات
        const ordersByStatus = report.ordersByStatus;
        const dailySales = report.dailySales.slice(-30); // ۳۰ روز آخر
        const topProducts = report.topProducts.slice(0, 5); // ۵ محصول برتر

        // روند ثبت‌نام کاربران (با استفاده از userService)
        const userRegistrationTrend = this.calculateUserTrend(users);

        // آخرین سفارشات
        const recentOrders = orders
          .sort((a, b) => new Date(b.create_at).getTime() - new Date(a.create_at).getTime())
          .slice(0, 8);

        // آخرین کاربران
        const recentUsers = users
          .filter(u => !u.deleted_at)
          .sort((a, b) => new Date(b.create_at).getTime() - new Date(a.create_at).getTime())
          .slice(0, 8);

        return {
          totalOrders,
          totalUsers,
          totalRevenue,
          pendingOrders,
          completedOrders,
          cancelledOrders,
          averageOrderValue,
          totalDiscount,
          ordersByStatus,
          dailySales,
          topProducts,
          userRegistrationTrend,
          recentOrders,
          recentUsers
        };
      })
    );
  }

  private calculateUserTrend(users: User[]): { date: string; count: number }[] {
    const last30Days = new Array(30).fill(0).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const trendMap = new Map<string, number>();
    users.forEach(u => {
      if (u.create_at && !u.deleted_at) {
        const date = new Date(u.create_at).toISOString().split('T')[0];
        if (last30Days.includes(date)) {
          trendMap.set(date, (trendMap.get(date) || 0) + 1);
        }
      }
    });

    return last30Days.map(date => ({
      date,
      count: trendMap.get(date) || 0
    }));
  }
}