import { Component, OnInit } from '@angular/core';
import { routes } from '../../../../consts';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ProductService } from '../../services';
import { ProductDetails } from '../../models/product-details';
import { FormBuilder, FormGroup } from '@angular/forms';



@Component({
  selector: 'app-product-edit-page',
  templateUrl: './product-edit-page.component.html',
  styleUrls: ['./product-edit-page.component.scss']
})
export class ProductEditPageComponent implements OnInit {
  public routes: typeof routes = routes;
  public product: ProductDetails; // محصول واقعی که به فرم میدیم

  constructor(
    private route: ActivatedRoute,
    private service: ProductService,
    private router: Router
  ) {}

  ngOnInit() {
    const id = +this.route.snapshot.params['id'];
    if (id) {
      this.service.getProduct(id).subscribe({
        next: (product) => {
          this.product = product;
        },
        error: (err) => console.error(err)
      });
    }
  }

  // public saveEditProduct(updatedProduct: ProductDetails) {
  //   updatedProduct.id = +this.route.snapshot.params['id'];
  //   this.service.saveChangedProduct(updatedProduct).subscribe({
  //     next: () => this.router.navigate([this.routes.MANAGEMENT]),
  //     error: (err) => console.error(err)
  //   });
  // }



public saveEditProduct(updatedProduct: ProductDetails) {
  const id = +this.route.snapshot.params['id'];

  if (id) {
    // اگر id داریم یعنی ادیت
    updatedProduct.id = id;
    this.service.saveChangedProduct(updatedProduct).subscribe({
      next: () => {
        console.log('✅ محصول ویرایش شد');
        this.router.navigate([this.routes.MANAGEMENT]);
      },
      error: (err) => console.error('❌ خطا در ویرایش محصول:', err)
    });
  } else {
    // اگر id نداریم یعنی ساخت محصول جدید
    this.service.createProduct(updatedProduct).subscribe({
      next: () => {
        console.log('✅ محصول ساخته شد');
        this.router.navigate([this.routes.MANAGEMENT]);
      },
      error: (err) => console.error('❌ خطا در ساخت محصول:', err)
    });
  }
}





}
