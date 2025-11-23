import { Injectable } from '@angular/core';
import { forkJoin, Observable, of, pipe } from 'rxjs';
import { ProductDetails } from '../models/product-details';
import { ProductCard } from '../models';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, switchMap, tap } from 'rxjs/operators';
import { BaseService } from 'src/app/shared/services/base.service';
import { CloudinaryService } from 'src/app/shared/services/cloudinary-upload.service';
import { array } from '@amcharts/amcharts4/core';
import { environment } from 'src/environments/environment';

export const products: ProductDetails[] = [
  {
    id: 1,
    productCode: '135234',
    productName: 'Trainers',
    price: 80,
    quantity: 10,
    discountPercent: 20,
    discountAmount: 16, // 20% از 80
    description: 'Sneakers (also known as athletic shoes, tennis shoes, gym shoes, runners, takkies, or trainers) are shoes primarily designed for sports or other forms of physical exercise, but which are now also often used for everyday wear. The term generally describes a type of footwear with a flexible sole made of rubber or synthetic material and an upper part made of leather or synthetic materials.',
    image: ['./assets/e-commerce/products/1.png'],
    rating: 4.6,
    status: 'New'
  },
  {
    id: 2,
    productCode: '135264',
    productName: 'Boots',
    price: 37,
    quantity: 5,
    discountPercent: 20,
    discountAmount: 7.4,
    description: 'Sneakers (also known as athletic shoes, tennis shoes, gym shoes, runners, takkies, or trainers) are shoes primarily designed for sports or other forms of physical exercise, but which are now also often used for everyday wear. The term generally describes a type of footwear with a flexible sole made of rubber or synthetic material and an upper part made of leather or synthetic materials.',
    image: ['./assets/e-commerce/products/2.png'],
    rating: 4.6,
    status: 'Sale'
  },
  {
    id: 3,
    productCode: '125234',
    productName: 'Flat sandals',
    price: 70,
    quantity: 15,
    discountPercent: 20,
    discountAmount: 14,
    description: 'Sneakers (also known as athletic shoes, tennis shoes, gym shoes, runners, takkies, or trainers) are shoes primarily designed for sports or other forms of physical exercise, but which are now also often used for everyday wear. The term generally describes a type of footwear with a flexible sole made of rubber or synthetic material and an upper part made of leather or synthetic materials.',
    image: ['./assets/e-commerce/products/3.png'],
    rating: 4.6,
    status: 'New'
  }
];



export interface ProductResponse {
  pagination: any;
  products: ProductDetails[];
}


@Injectable({
  providedIn: 'root'
})





export class ProductService {


  private productCreateUrl = '/product/create-product';
  private productEditUrl = '/product/edit-product';
  private productsGetUrl = '/product/get-products';
  private productGetUrl = '/product/get-product';
  private detailBaseUrl = '/product-detail/create-detail';


  constructor(
    private http: HttpClient,
    private baseServe: BaseService,
    private CloudinaryService: CloudinaryService
  ) { }



  public getProducts(): Observable<ProductDetails[]> {
    const headers = this.baseServe.getAuthHeader()
    return this.http.get<ProductResponse>(this.productsGetUrl, { headers }).pipe(
      map(response => response.products)
    )
  }

  // public getProduct(id: number): Observable<ProductDetails> {
  //   const headers = this.baseServe.getAuthHeader()
  //   return this.http.get<ProductDetails>(`${this.productGetUrl}/${id}`, { headers })
  // }




public getProduct(id: number): Observable<ProductDetails> {
  const headers = this.baseServe.getAuthHeader()
  return this.http.get<any>(`${this.productGetUrl}/${id}`, { headers }).pipe(
    map(response => {
      const details = response.details
        ? response.details.map((detail: any) => ({
            id: detail.id,      // 👈 خیلی مهم
            key: detail.key,
            value: detail.value
          }))
        : [];

      return {
        ...response,
        details: details,
        _initialDetailIds: details.map((d: any) => d.id)  // 👈 ارسال اولیه‌ها
      };
    })
  );
}



  // public saveChangedProduct(editProduct: ProductDetails) {
  //   products.map((product: ProductDetails, i: number) => {
  //     if (product.id === editProduct.id) {
  //       products.splice(i, 1, editProduct);
  //     }
  //   });
  // }

  public deleteProduct(id: number): void {
    products.map((product: ProductDetails, i: number) => {
      if (product.id === id) {
        products.splice(i, 1);
      }
    });
  }










  // ================= PRODUCT FORM DATA =================
  private buildProductFormData(product: ProductDetails): FormData {
    const formData = new FormData();
    formData.append('productCode', product.productCode);
    formData.append('productName', product.productName);
    formData.append('price', product.price.toString());
    formData.append('quantity', product.quantity.toString());
    formData.append('discountAmount', product.discountAmount?.toString() || '0');
    formData.append('discountPercent', product.discountPercent?.toString() || '0');
    formData.append('description', product.description || '');
    formData.append('rating', product.rating?.toString() || '0');
    formData.append('status', product.status);

    if (product.image && product.image.length > 0) {
      for (const item of product.image) {
        if (item instanceof File) {
          formData.append('image', item);
        }
      }
    }
    return formData
  }



  // ================= CREATE =================
  public createProduct(product: ProductDetails) {
    const formData = this.buildProductFormData(product)
    const headers = this.baseServe.getAuthHeader()

    return this.http
      .post<{ message: string; product: { id: number } }>(`${this.productCreateUrl}`, formData, { headers })
      .pipe(
        switchMap((res) => {

          const productId = res.product?.id;
          const features = product.details || [];
          if (!features.length) return of(res);

          const featureRequests = features.map((feature) => {
            if (!productId) {
              return of(res);
            }

            return this.http.post(`${this.detailBaseUrl}`, {
              key: feature.key,
              value: feature.value,
              productId,
            })
          });
          return forkJoin(featureRequests).pipe(
            map(() => ({
              message: res.message,
              product: res.product,
            })));
        })
      );
  }











  public getSimilarProducts(): Observable<ProductCard[]> {
    return of([
      {
        id: 1,
        productCode: '135234',
        productName: 'Trainers',
        price: 80,
        quantity: 10,
        discountPercent: 20,
        discountAmount: 16, // 20% از 80
        description: 'Sneakers (also known as athletic shoes, tennis shoes, gym shoes, runners, takkies, or trainers) are shoes primarily designed for sports or other forms of physical exercise, but which are now also often used for everyday wear. The term generally describes a type of footwear with a flexible sole made of rubber or synthetic material and an upper part made of leather or synthetic materials.',
        image: ['./assets/e-commerce/products/1.png'],
        rating: 4.6,
        status: 'New'
      },
      {
        id: 2,
        productCode: '135264',
        productName: 'Boots',
        price: 37,
        quantity: 5,
        discountPercent: 20,
        discountAmount: 7.4,
        description: 'Sneakers (also known as athletic shoes, tennis shoes, gym shoes, runners, takkies, or trainers) are shoes primarily designed for sports or other forms of physical exercise, but which are now also often used for everyday wear. The term generally describes a type of footwear with a flexible sole made of rubber or synthetic material and an upper part made of leather or synthetic materials.',
        image: ['./assets/e-commerce/products/2.png'],
        rating: 4.6,
        status: 'Sale'
      },
      {
        id: 3,
        productCode: '125234',
        productName: 'Flat sandals',
        price: 70,
        quantity: 15,
        discountPercent: 20,
        discountAmount: 14,
        description: 'Sneakers (also known as athletic shoes, tennis shoes, gym shoes, runners, takkies, or trainers) are shoes primarily designed for sports or other forms of physical exercise, but which are now also often used for everyday wear. The term generally describes a type of footwear with a flexible sole made of rubber or synthetic material and an upper part made of leather or synthetic materials.',
        image: ['./assets/e-commerce/products/3.png'],
        rating: 4.6,
        status: 'New'
      }
    ]);
  }



  uploadImageCloudInary(product: ProductDetails) {
    if (product.image && product.image.length > 0) {
      const files = product.image.filter((file) => file instanceof File) as File[]
      if (files.length === 0) return;
      console.log('image url', files);
      return this.CloudinaryService.upload(files)
    }
  }








saveChangedProduct(product: any): Observable<any> {
  const productId = product.id;
  const headers = this.baseServe.getAuthHeader();

  const uploadedUrls = product.image || [];

  // payload اصلی برای آپدیت محصول
  const productPayload = {
    productCode: product.productCode,
    productName: product.productName,
    price: product.price,
    quantity: product.quantity,
    discountPercent: product.discountPercent,
    discountAmount: product.discountAmount,
    description: product.description,
    rating: product.rating,
    status: product.status,
    image: uploadedUrls
  };

  return this.http.patch(`${this.productEditUrl}/${productId}`, productPayload, { headers }).pipe(
    switchMap((patchRes: any) => {

      const currentDetails = (product.details || []).map((d: any) => ({ ...d }));
      const currentIds = currentDetails.filter((d: any) => d.id).map((d: any) => d.id);

      // 👇 از کامپوننت میاد — بسیار مهم
      const initialIds: number[] = product._initialDetailIds || [];

      const toCreate = currentDetails.filter((d: any) => !d.id);
      const toUpdate = currentDetails.filter((d: any) => d.id);
      const toDelete = initialIds.filter(id => !currentIds.includes(id));

      const detailRequests: Observable<any>[] = [];

      // ایجاد
      toCreate.forEach(d => {
        detailRequests.push(
          this.http.post(`${this.detailBaseUrl}`, {
            productId,
            key: d.key,
            value: d.value
          }, { headers })
        );
      });

      // بروزرسانی
      toUpdate.forEach(d => {
        detailRequests.push(
this.http.put('/product-detail/update-product/' + d.id, {
            key: d.key,
            value: d.value,
            productId
          }, { headers })
        );
      });

      // حذف
      toDelete.forEach(id => {
        detailRequests.push(
this.http.delete('/product-detail/delete-product/' + id, { headers })
        );
      });

      if (detailRequests.length === 0) {
        return of(patchRes);
      }

      return forkJoin(detailRequests).pipe(
        map(() => patchRes)
      );
    })
  );
}





}


 






  







