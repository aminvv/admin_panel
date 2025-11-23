// import { Component, OnInit } from '@angular/core';
// import { routes } from '../../../../consts';
// import { ActivatedRoute, Router } from '@angular/router';
// import { Observable } from 'rxjs';
// import { ProductService } from '../../services';
// import { ProductDetails } from '../../models/product-details';
// import { FormBuilder, FormGroup } from '@angular/forms';



// @Component({
//   selector: 'app-product-edit-page',
//   templateUrl: './product-edit-page.component.html',
//   styleUrls: ['./product-edit-page.component.scss']
// })
// export class ProductEditPageComponent implements OnInit {
//   public routes: typeof routes = routes;
//   public product: ProductDetails

//   constructor(
//     private route: ActivatedRoute,
//     private service: ProductService,
//     private router: Router
//   ) { }

//   ngOnInit() {
//     const id = +this.route.snapshot.params['id'];
//     if (id) {
//       this.service.getProduct(id).subscribe({
//         next: (product) => {
//           this.product = product;
//         },
//         error: (err) => console.error(err)
//       });
//     }
//   }






// public saveEditProduct(updatedProduct: ProductDetails) {
//   console.log('🟢 رویداد از فرزند رسید:', updatedProduct);

//   const id = +this.route.snapshot.params['id'];
//   if (id) {
//     updatedProduct.id = id;
//     console.log('🟡 آماده ارسال به سرور:', updatedProduct);
//     console.log('🟡 تصاویر محصول:', updatedProduct.image);
    
//     this.service.saveChangedProduct(updatedProduct).subscribe({
//       next: (response) => {
//         console.log('✅ محصول ویرایش شد:', response);
//         this.router.navigate([this.routes.MANAGEMENT]);
//       },
//       error: (err) => {
//         console.error('❌ خطا در ویرایش محصول:', err);
//         console.error('❌ جزئیات خطا:', err.error);
//       }
//     });
//   }
// }




// }






import { Component, OnInit } from '@angular/core';
import { routes } from '../../../../consts';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../services';
import { ProductDetails } from '../../models/product-details';

@Component({
  selector: 'app-product-edit-page',
  templateUrl: './product-edit-page.component.html',
  styleUrls: ['./product-edit-page.component.scss']
})
export class ProductEditPageComponent implements OnInit {
  public routes: typeof routes = routes;
  public product: ProductDetails | null = null;  // 👈 خیلی مهم

  constructor(
    private route: ActivatedRoute,
    private service: ProductService,
    private router: Router
  ) { }

  ngOnInit() {
    const id = +this.route.snapshot.params['id'];

    if (id) {
      this.service.getProduct(id).subscribe({
        next: (product) => {
          this.product = product;
          console.log('📌 محصول لود شد:', this.product);
        },
        error: (err) => console.error(err)
      });
    }
  }

  public saveEditProduct(updatedProduct: ProductDetails) {
    console.log('🟢 از فرزند رسید:', updatedProduct);

    const id = +this.route.snapshot.params['id'];
    updatedProduct.id = id;

    this.service.saveChangedProduct(updatedProduct).subscribe({
      next: (response) => {
        console.log('✅ محصول ویرایش شد:', response);
        this.router.navigate([this.routes.MANAGEMENT]);
      },
      error: (err) => {
        console.error('❌ خطا در ویرایش محصول:', err);
        console.error('❌ جزئیات خطا:', err.error);
      }
    });
  }
}
