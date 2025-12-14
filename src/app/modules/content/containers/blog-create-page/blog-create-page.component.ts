import { Component } from '@angular/core';
import { routes } from '../../../../consts';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { BlogDetails } from '../../models/blog-details';
import { BlogService } from '../../services';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-Blog-create-page',
  templateUrl: './Blog-create-page.component.html',
  styleUrls: ['./Blog-create-page.component.scss']
})
export class BlogCreatePageComponent {
  public routes: typeof routes = routes;

  constructor(
    private service: BlogService,
    private router: Router,
    private toastr: ToastrService,
  ) {
  }

  public createBlog(blog: BlogDetails): void {
    this.service.createBlog(blog).subscribe({
      next: (res) => {
        this.toastr.success(res.message || 'وبلاگ با موفقیت ساخته شد');
        this.router.navigate([this.routes.MANAGEMENT_BLOG]).then();
      },
      error: (err) => {
        alert(err.error?.message || 'خطا در ساخت وبلاگ');
        console.log(err.error);
      },
    })

  }
}
