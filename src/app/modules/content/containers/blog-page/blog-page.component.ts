import {Component, OnInit} from '@angular/core';
import {routes} from '../../../../consts';
import {UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {Observable} from 'rxjs';
import {BlogCard} from '../../models';
import {BlogDetails} from '../../models/blog-details';
import {ActivatedRoute} from '@angular/router';
import { BlogService } from '../../services';

@Component({
  selector: 'app-Blog-page',
  templateUrl: './Blog-page.component.html',
  styleUrls: ['./Blog-page.component.scss']
})
export class BlogPageComponent implements OnInit {
  public routes: typeof routes = routes;
  public form: UntypedFormGroup;
  public blogs$: Observable<BlogCard[]>
  public blog$: Observable<BlogDetails>

  constructor(
    private service: BlogService,
    private route: ActivatedRoute
  ) {
    this.blogs$ = this.service.getSimilarProducts();
  }

  public ngOnInit() {
    this.form = new UntypedFormGroup({
      size: new UntypedFormControl('2'),
      value: new UntypedFormControl('2'),
    });

    this.route.paramMap.subscribe((params: any) => {
      if (params.params.id) {
        this.blog$ = this.service.getBlog(params.params.id);
      } else {
        this.blog$ = this.service.getBlog(1);
      }
    });
  }

  get size() {
    return this.form.get('size') as UntypedFormControl;
  }

  get value() {
    return this.form.get('value') as UntypedFormControl;
  }

}
