// src/app/modules/admin/orders/order-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrderListComponent } from './containers/management-page/order-list.component';
import { OrderDetailComponent } from './containers/order-detail/order-detail.component';
import { OrderStatusFlowComponent } from './containers/order-status-flow/order-status-flow.component';
import { CustomerInfoComponent } from './containers/coustomer/customer-info/customer-info.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  },
  {
    path: 'list',
    component: OrderListComponent,
    data: { title: 'لیست سفارشات' }
  },
  {
    path: 'status-flow/:id',
    component: OrderStatusFlowComponent,
    data: { title: 'تغییر وضعیت سفارش' }
  },
  {
    path: 'detail/:id',
    component: OrderDetailComponent,
    data: { title: 'جزئیات سفارش' }
  },
  {
    path: 'customerInfo',
    component: CustomerInfoComponent,
    data: { title: 'اطلاعات مشتری' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrderRoutingModule { }