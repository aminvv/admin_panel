import { Injectable } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { ProductDetails } from '../models/product-details';
import { ProductCard } from '../models';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, switchMap } from 'rxjs/operators';

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






@Injectable({
  providedIn: 'root'
})





export class ProductService {


  private productBaseUrl = '/product/create-product';
  private detailBaseUrl = '/product-detail/create-detail';


  constructor(private http: HttpClient) { }



  public getProducts(): Observable<ProductDetails[]> {
    return of(products);
  }

  public getProduct(id: number): Observable<ProductDetails> {
    return of(products.find((product: ProductDetails) => product.id === id));
  }

  public saveChangedProduct(editProduct: ProductDetails) {
    products.map((product: ProductDetails, i: number) => {
      if (product.id === editProduct.id) {
        products.splice(i, 1, editProduct);
      }
    });
  }

  public deleteProduct(id: number): void {
    products.map((product: ProductDetails, i: number) => {
      if (product.id === id) {
        products.splice(i, 1);
      }
    });
  }


  public createProduct(product: ProductDetails) {
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
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token') || ''}`
    });

    return this.http
      .post<{ message: string; product: { id: number } }>(
        `${this.productBaseUrl}`,
        formData,
        { headers }
      )
      .pipe(
        switchMap((res) => {
          console.log('✅ Product create response:', res);
          console.log('🆔 Product ID returned from backend:', res.product?.id);
          const productId = res.product?.id;
          const features = product.features || [];
          if (!features.length) return of(res);

          const featureRequests = features.map((feature) => {
            if (!productId) {
              console.error('❌ productId is MISSING! Cannot create details.', res);
              return of(res);
            }

            return this.http.post(`${this.detailBaseUrl}`, {
              key: feature.name,
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
}
