import { Component, OnInit } from '@angular/core';
import { routes } from '../../consts';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../header/components/notifications/notifications.service';
import { Observable } from 'rxjs';


const TREE_DATA: any = [
  {
    name: 'فروشگاه',
    children: [
      { name: 'مدیریت محصولات', route: routes.MANAGEMENT, active: 'active' },
      { name: ' ایجاد محصولات', route: routes.PRODUCT_CREATE, active: 'active' },
    ]
  },

  {
    name: 'محتوا',
    children: [
      { name: 'مدیریت بلاگ', route: routes.MANAGEMENT_BLOG, active: 'active' },
      { name: 'ایجاد وبلاگ', route: routes.BLOG_CREATE, active: 'active' },
    ]
  },
  {
    name: 'سفارشات',
    children: [
      { name: 'لیست سفارشات', route: routes.ORDER_LIST, active: 'active' },
      { name: 'اطلاعات مشتری', route: routes.CUSTOMER_INFO, active: 'active' },
      { name: 'مدیریت پرداخت‌ها', route: routes.PAYMENTS_MANAGE, active: 'active' },
      { name: 'گزارش‌ها و آمار', route: routes.ORDER_REPORTS, active: 'active' },
    ]
  },
  {
    name: 'تخفیفات',
    children: [
      { name: 'لیست تخفیفات', route: routes.DISCOUNT_LIST, active: 'active' },
      { name: ' تخفیف سبدخرید', route: routes.DISCOUNT_BASKET, active: 'active' },
    ]
  },
  {
    name: 'کاربران',
    children: [
      { name: 'لیست کاربران', route: routes.USER_LIST, active: 'active' },
      { name: 'لیست ادمین', route: routes.ADMIN_LIST, active: 'active' },
    ]
  },
  {
    name: 'پانویس', route: routes.SITE_SETTING, active: 'active'
  },
  {
    name: 'درباره ما', route: routes.ABOUT, active: 'active'
  },
  {
    name: 'تماس با ما', route: routes.CONTACT, active: 'active'
  },
];



interface ExampleFlatNode {
  expandable: boolean;
  name: string;
  level: number;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  public routes: typeof routes = routes;
  public unreadOrderCount$: Observable<number>;

  private _transformer = (node: any, level: number) => ({
    expandable: !!node.children && node.children.length > 0,
    name: node.name,
    level,
    route: node.route,
    active: node.active,
  });

  treeControl = new FlatTreeControl<ExampleFlatNode>(
    (node) => node.level,
    (node) => node.expandable,
  );

  treeFlattener = new MatTreeFlattener(
    this._transformer,
    (node) => node.level,
    (node) => node.expandable,
    (node) => node.children,
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  constructor(
    public dialog: MatDialog,
    private authService: AuthService,
    private notificationService: NotificationService,
  ) {
    this.dataSource.data = TREE_DATA;
  }

  ngOnInit(): void {
    this.unreadOrderCount$ = this.notificationService.unreadOrderCount$;
  }

  hasChild = (_: number, node: ExampleFlatNode) => node.expandable;

  logout(): void {
    this.authService.logoutUser();
  }
}