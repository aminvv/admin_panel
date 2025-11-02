import { Component } from '@angular/core';
import { routes } from '../../../../consts';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { ProductDetails } from '../../models/product-details';
import { ProductService } from '../../services';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-product-create-page',
  templateUrl: './product-create-page.component.html',
  styleUrls: ['./product-create-page.component.scss']
})
export class ProductCreatePageComponent {
  public routes: typeof routes = routes;

  constructor(
    private service: ProductService,
    private router: Router,
    private toastr: ToastrService,
  ) {
  }

  public createProduct(product: ProductDetails): void {
    this.service.createProduct(product).subscribe({
      next: (res) => {
        console.log('✅ Product created:', res);
        this.toastr.success(res.message || 'محصول با موفقیت ساخته شد');
        this.router.navigate([this.routes.MANAGEMENT]).then();
      },
      error: (err) => {
        console.error('❌ Error creating product:', err);
        alert(err.error?.message || 'خطا در ساخت محصول');
      },
    })

  }
}
