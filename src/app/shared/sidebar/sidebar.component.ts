import { Component } from '@angular/core';
import { routes } from '../../consts';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { MatDialog } from '@angular/material/dialog';
import { ChatPopupComponent } from '../popups/chat-popup/chat-popup.component';


const TREE_DATA: any = [
  {
    name: 'فروشگاه',
    children: [
      { name: 'مدیریت محصولات', route: routes.MANAGEMENT, active: 'active' },
      { name: 'جدول محصولات', route: routes.PRODUCTS, active: 'active' },
      { name: 'صفحه محصول', route: routes.PRODUCT, active: 'active' },
    ]
  },

  {
    name: 'محتوا',
    children: [
      { name: 'مدیریت بلاگ', route: routes.MANAGEMENT_BLOG, active: 'active' },
      { name: 'جدول بلاگ‌ها', route: routes.BLOGS, active: 'active' },
      { name: 'صفحه بلاگ', route: routes.BLOG, active: 'active' },
    ]
  },
  {
    name: 'سفارشات',
    children: [
      { name: 'لیست سفارشات', route: routes.ORDER_LIST, active: 'active' },
      { name: 'جزئیات سفارش', route: routes.ORDER_DETAILS, active: 'active' },
      { name: 'مدیریت پرداخت‌ها', route: routes.PAYMENTS_MANAGE, active: 'active' },
      { name: 'گزارش‌ها و آمار', route: routes.ORDER_REPORTS, active: 'active' },
    ]
  },
  {
    name: 'تخفیفات',
    children: [
      { name: 'لیست تخفیفات', route: routes.DISCOUNT_LIST, active: 'active' },
      { name: 'جزئیات تخفیف', route: routes.DISCOUNT_DETAILS, active: 'active' },
    ]
  },

  {
    name: 'کاربران',
    children: [
      { name: 'لیست کاربران', route: routes.Users, active: 'active' },
      { name: 'افزودن کاربر', route: routes.Users_CREATE, active: 'active' },
      { name: 'ویرایش کاربر', route: routes.Users_EDIT, active: 'active' },
    ]
  }
];

const TemplateNode: any = [
  {
    name: 'فرم‌ها',
    children: [
      { name: 'عناصر فرم', route: routes.FORMS_ELEMENTS, active: 'active' },
      { name: 'اعتبارسنجی فرم', route: routes.FORMS_VALIDATION, active: 'active' },
    ]
  },
  {
    name: 'نمودارها',
    children: [
      { name: 'مرور نمودارها', route: routes.OVERVIEW_CHARTS, active: 'active' },
      { name: 'نمودار خطی', route: routes.LINE_CHARTS, active: 'active' },
      { name: 'نمودار میله‌ای', route: routes.BAR_CHARTS, active: 'active' },
      { name: 'نمودار دایره‌ای', route: routes.PIE_CHARTS, active: 'active' },
    ]
  },
  {
    name: 'نقشه‌ها',
    children: [
      { name: 'نقشه گوگل', route: routes.GOOGLE_MAP, active: 'active' },
      { name: 'نقشه برداری', route: routes.VECTOR_MAP, active: 'active' }
    ]
  },
  {
    name: 'اضافی',
    children: [
      { name: 'تقویم', route: routes.CALENDAR, active: 'active' },
      { name: 'فاکتور', route: routes.INVOICE, active: 'active' },
    ]
  },
];


/** Flat node with expandable and level information */
interface ExampleFlatNode {
  expandable: boolean;
  name: string;
  level: number;
}


@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  public routes: typeof routes = routes;
  public isOpenUiElements = false;


  private _transformer = (node: any, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      level,
      route: node.route,
      active: node.active
    };
  }

  treeControl = new FlatTreeControl<ExampleFlatNode>(
    node => node.level, node => node.expandable);

  treeFlattener = new MatTreeFlattener(
    this._transformer, node => node.level, node => node.expandable, node => node.children);

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  templateDataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);


  constructor(public dialog: MatDialog) {
    this.dataSource.data = TREE_DATA;
    this.templateDataSource.data = TemplateNode;
  }

  hasChild = (_: number, node: ExampleFlatNode) => node.expandable;

  public openUiElements() {
    this.isOpenUiElements = !this.isOpenUiElements;
  }

}
