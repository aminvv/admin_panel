import {RouterModule, Routes} from '@angular/router';
import { NgModule } from '@angular/core';
import { OrderListComponent } from './containers/management-page/order-list.component';
import { OrderStatusFlowComponent } from './containers/order-status-flow/order-status-flow.component';



const routes: Routes = [
  {
    path: '',
    redirectTo: 'list'
  },
  {
    path: 'list',
    component: OrderListComponent,
  },
  {
    path: 'detail/:id',
    component: OrderStatusFlowComponent,
  },
  // {
  //   path: 'create',
  //   component: BlogCreatePageComponent,
  // },
  // {
  //   path: 'blogs',
  //   component: BlogsPageComponent,
  // },
  // {
  //   path: 'blog/:id',
  //   component: BlogPageComponent,
  // },
  // {
  //   path: 'blog',
  //   component: BlogPageComponent,
  // },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})

export class OrderRoutingModule {
}
