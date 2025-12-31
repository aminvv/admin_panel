import {RouterModule, Routes} from '@angular/router';
import { NgModule } from '@angular/core';
import { ManagementDiscountComponent } from './containers/management-discount/management-discount.component';
import { DiscountDetailComponent } from './containers/discount-deatails/discount-detail.component';



const routes: Routes = [
  {
    path: '',
    redirectTo: 'list',
     pathMatch: 'full', 
  },
  {
    path: 'list',
    component: ManagementDiscountComponent,
  },
  {
    path: 'detail',
    component: DiscountDetailComponent,
  },

  
,
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})

export class DiscountRoutingModule {
}
