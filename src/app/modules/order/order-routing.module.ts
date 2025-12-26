import {RouterModule, Routes} from '@angular/router';
import { NgModule } from '@angular/core';
import { ManagementOrderComponent } from './containers/management-page/management-order.component';
import { OrderDetailComponent } from './containers/order-deatails/order-detail.component';



const routes: Routes = [
  {
    path: '',
    redirectTo: 'list'
  },
  {
    path: 'list',
    component: ManagementOrderComponent,
  },
  {
    path: 'detail/:id',
    component: OrderDetailComponent,
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
