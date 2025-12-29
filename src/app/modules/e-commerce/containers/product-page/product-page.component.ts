import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../services';
import { ProductDetails } from '../../models/product-details';
import { ToastrService } from 'ngx-toastr';
import { routes } from 'src/app/consts';

@Component({
  selector: 'app-product-page',
  templateUrl: './product-page.component.html',
  styleUrls: ['./product-page.component.scss']
})
export class ProductPageComponent implements OnInit {
  public product: ProductDetails | null = null;
  public selectedImage: string = '';
  public selectedFiles: File[] = [];
  public routes: typeof routes = routes;

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
          this.product = product;
          if (product?.image && product.image.length > 0) {
            this.selectedImage = product.image[0].url;
          }
        },
        error: (err) => {
          this.toastr.error('خطا در دریافت اطلاعات محصول');
          console.error(err);
        }
      });
    }
  }

  selectImage(image: string): void {
    this.selectedImage = image;
  }

  editProduct(): void {
    if (this.product?.id) {
       this.router.navigate([`${this.routes.PRODUCT_EDIT}/${this.product.id}`]);
    }
    
  }

  updateStock(): void {
    if (!this.product?.id) return;

    const newStock = prompt('موجودی جدید را وارد کنید:', String(this.product.quantity || 0));
    if (newStock && !isNaN(Number(newStock))) {
      const updatedProduct = { ...this.product, quantity: Number(newStock) };

      this.service.saveChangedProduct(updatedProduct).subscribe({
        next: (response) => {
          this.toastr.success('موجودی با موفقیت بروزرسانی شد');
          this.product!.quantity = Number(newStock);
        },
        error: (err) => {
          this.toastr.error('خطا در بروزرسانی موجودی');
        }
      });
    }
  }

  toggleProductStatus(): void {
    if (!this.product?.id) return;

    const newStatus = !this.product.status;
    const updatedProduct = { ...this.product, status: newStatus };

    this.service.saveChangedProduct(updatedProduct).subscribe({
      next: (response) => {
        this.toastr.success(`محصول ${newStatus ? 'فعال' : 'غیرفعال'} شد`);
        this.product!.status = newStatus;
      },
      error: (err) => {
        this.toastr.error('خطا در تغییر وضعیت محصول');
      }
    });
  }

  deleteProduct(): void {
    if (!this.product?.id) return;

    if (confirm('آیا از حذف این محصول اطمینان دارید؟ این عمل غیرقابل بازگشت است.')) {
      this.service.deleteProduct(this.product.id).subscribe({
        next: (response) => {
          this.toastr.success('محصول با موفقیت حذف شد');
          this.router.navigate(['/admin/products']);
        },
        error: (err) => {
          this.toastr.error('خطا در حذف محصول');
        }
      });
    }
  }

  addImage(): void {
    this.toastr.info('قابلیت افزودن تصویر در حال توسعه است');
  }

  removeImage(imageUrl: string): void {
    if (confirm('آیا از حذف این تصویر اطمینان دارید؟')) {
      this.toastr.success('تصویر با موفقیت حذف شد (نمایشی)');
      // اینجا منطق واقعی حذف تصویر
    }
  }

  onFileSelected(event: any): void {
    this.selectedFiles = Array.from(event.target.files);
    this.toastr.info(`${this.selectedFiles.length} فایل انتخاب شد`);
  }

  uploadImages(): void {
    if (this.selectedFiles.length === 0) return;
    this.toastr.success('تصاویر با موفقیت آپلود شدند (نمایشی)');
    this.selectedFiles = [];
  }

  deleteImage(imageUrl: string): void {
    this.removeImage(imageUrl);
  }

  editSpecifications(): void {
    if (this.product?.id) {
      this.router.navigate([`/admin/products/specs/${this.product.id}`]);
    }
  }

  objectToArray(obj: any): Array<{ key: string, value: any }> {
    if (!obj || typeof obj !== 'object') return [];
    return Object.keys(obj).map(key => ({ key, value: obj[key] }));
  }
}