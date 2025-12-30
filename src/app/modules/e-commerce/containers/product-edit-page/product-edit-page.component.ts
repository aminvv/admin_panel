
import { Component, OnInit } from '@angular/core';
import { routes } from '../../../../consts';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../services';
import { ProductDetails } from '../../models/product-details';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-product-edit-page',
  templateUrl: './product-edit-page.component.html',
  styleUrls: ['./product-edit-page.component.scss']
})
export class ProductEditPageComponent implements OnInit {
  public routes: typeof routes = routes;
  public product: ProductDetails | null = null;

  constructor(
    private route: ActivatedRoute,
    private service: ProductService,
    private router: Router,
    private toastr: ToastrService,
  ) { }

  ngOnInit() {
    const id = +this.route.snapshot.params['id'];

    if (id) {
      this.service.getProduct(id).subscribe({
        next: (product) => {
          this.product = product
        },
        error: (err) => console.error(err)
      });
    }
  }

  public saveEditProduct(updatedProduct: ProductDetails) {

    const id = +this.route.snapshot.params['id'];
    updatedProduct.id = id;
    updatedProduct._initialDetailIds = this.product?._initialDetailIds;
    this.service.saveChangedProduct(updatedProduct).subscribe({
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
