import {Component, OnInit} from '@angular/core';

import { routes } from '../../../../consts';
// import {ProductsService} from '../../services';
import {Observable} from 'rxjs';
import {BlogCard} from '../../models';
import {UntypedFormControl, UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'app-blogs-page',
  templateUrl: './blogs-page.component.html',
  styleUrls: ['./blogs-page.component.scss']
})
export class BlogsPageComponent implements OnInit {
  public routes: typeof routes = routes;
  public blog$: Observable<BlogCard[]>
  public form: UntypedFormGroup;

  // constructor(private service: ProductsService) {
  //   // this.products$ = this.service.getProducts();
  // }

  public ngOnInit() {
    this.form = new UntypedFormGroup({
      type: new UntypedFormControl('shoes'),
      brands: new UntypedFormControl('all'),
      size: new UntypedFormControl('7'),
      color: new UntypedFormControl('all'),
      range: new UntypedFormControl('all'),
      sort: new UntypedFormControl('favorite'),
    });
  }

  get type() {
    return this.form.get('type') as UntypedFormControl;
  }

  get brands() {
    return this.form.get('brands') as UntypedFormControl;
  }

  get size() {
    return this.form.get('size') as UntypedFormControl;
  }

  get color() {
    return this.form.get('color') as UntypedFormControl;
  }

  get range() {
    return this.form.get('range') as UntypedFormControl;
  }

  get sort() {
    return this.form.get('sort') as UntypedFormControl;
  }
}
