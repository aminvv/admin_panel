import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileComponent } from './profile/profile.component';
import { DashboardPageComponent } from '../dashboard/containers';

const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardPageComponent,
  },
  // {
  //   path: 'change-password',
  //   component: ChangePasswordComponent,
  // },
  {
    path: 'profile',
    component: ProfileComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {}
