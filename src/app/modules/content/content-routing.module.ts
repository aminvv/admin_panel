import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import {
  BlogCreatePageComponent,
  BlogEditPageComponent,
  BlogPageComponent,
  ManagementPageComponent,
} from './containers';
import { CertificateListComponent } from './components/certificate/certificate-list/certificate-list.component';


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
  {
    path: 'certificates',
    component: CertificateListComponent,
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