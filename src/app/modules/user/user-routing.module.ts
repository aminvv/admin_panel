import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserListComponent } from './containers/user-list/users-list.component';
import { UserAddComponent } from './containers/user-add/user-add.component';
import { AdminListComponent } from './containers/admin-list/admin-list.component';
import { AdminAddComponent } from './containers/admin-add/admin-add.component';


const routes: Routes = [
  {
    path: '', redirectTo: 'list',
    pathMatch: 'full'
  },
  {
    path: 'list', component: UserListComponent,
    data: { title: 'لیست کاربران' }
  },
  {
    path: 'add', component: UserAddComponent,
    data: { title: 'افزودن کاربر' }
  },
  {
    path: 'edit/:id', component: UserAddComponent,
    data: { title: 'ویرایش کاربر' }
  },
  {
    path: 'admin/list', component: AdminListComponent,
    data: { title: 'لیست ادمین‌ها' }
  },
  {
    path: 'admin/add', component: AdminAddComponent,
    data: { title: 'افزودن ادمین' }
  },
  {
    path: 'admin/edit/:id', component: AdminAddComponent,
    data: { title: 'ویرایش ادمین' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }