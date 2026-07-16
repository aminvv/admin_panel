import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import {
  ManagementPageComponent,
  ProductCreatePageComponent,
  ProductPageComponent,
  ProductEditPageComponent
} from './containers';
import { ProductSpotlightListComponent } from './components/product-spotlight/product-spotlight-list/product-spotlight-list.component'; // 👈 این ایمپورت رو عوض کن
import { SlideListComponent } from './components/slide/slide-list.component/slide-list.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'management'
  },
  {
    path: 'management',
    component: ManagementPageComponent,
  },
  {
    path: 'edit/:id',
    component: ProductEditPageComponent,
  },
  {
    path: 'create',
    component: ProductCreatePageComponent,
  },
  {
    path: 'product',
    component: ProductPageComponent,
  },
  {
    path: 'product/:id',
    component: ProductPageComponent,
  },
  {
    path: 'product-spotlight',
    component: ProductSpotlightListComponent, 
  },
{ path: 'slides', component: SlideListComponent },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class ECommerceRoutingModule {
}