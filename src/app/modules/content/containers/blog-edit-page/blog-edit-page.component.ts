
import { Component, OnInit } from '@angular/core';
import { routes } from '../../../../consts';
import { ActivatedRoute, Router } from '@angular/router';
import { BlogDetails } from '../../models/blog-details';
import { ToastrService } from 'ngx-toastr';
import { BlogService } from '../../services';

@Component({
  selector: 'app-Blog-edit-page',
  templateUrl: './Blog-edit-page.component.html',
  styleUrls: ['./Blog-edit-page.component.scss']
})
export class BlogEditPageComponent implements OnInit {
  public routes: typeof routes = routes;
  public blog: BlogDetails | null = null; 

  constructor(
    private route: ActivatedRoute,
    private service: BlogService,
    private router: Router,
    private toastr: ToastrService,
  ) { }

  ngOnInit() {
    const id = +this.route.snapshot.params['id'];

    if (id) {
      this.service.getBlog(id).subscribe({
        next: (blog) => {
          this.blog = blog
        },
        error: (err) => console.error(err)
      });
    }
  }

  public saveEditBlog(updatedProduct: BlogDetails) {

    const id = +this.route.snapshot.params['id'];
    updatedProduct.id = id;

    this.service.saveChangedBlog(updatedProduct).subscribe({
      next: (response) => {
        this.toastr.success(response.message || 'محصول با موفقیت ویرایش  شد');
        this.router.navigate([this.routes.MANAGEMENT]);
      },
      error: (err) => {
        this.toastr.success(err.message || 'خطا در ویرایش محصول');
      }
    });
  }
}
