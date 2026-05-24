import {RouterModule, Routes} from '@angular/router';
import { NgModule } from '@angular/core';

import {
  BlogCreatePageComponent,
  BlogEditPageComponent,
  BlogPageComponent,
  ManagementPageComponent,

} from './containers';

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
    component: BlogEditPageComponent,
  },
  {
    path: 'create',
    component: BlogCreatePageComponent,
  },
  {
    path: 'blog/:id',
    component: BlogPageComponent,
  },
  {
    path: 'blog',
    component: BlogPageComponent,
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})

export class ContentRoutingModule {
}
