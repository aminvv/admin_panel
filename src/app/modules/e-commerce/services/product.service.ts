import { Injectable } from '@angular/core';
import { forkJoin, Observable, of, pipe } from 'rxjs';
import { ProductDetails } from '../models/product-details';
import { ProductCard } from '../models';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, switchMap, tap } from 'rxjs/operators';
import { BaseService } from 'src/app/shared/services/base.service';
import { CloudinaryService } from 'src/app/shared/services/cloudinary-upload.service';


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
    image: [
      { url: './assets/e-commerce/products/3.png', publicId: null }
    ],
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
     image: [
      { url: './assets/e-commerce/products/3.png', publicId: null }
    ],
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
    image: [
      { url: './assets/e-commerce/products/3.png', publicId: null }
    ],
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
  private productDeleteUrl = '/product/delete-product';
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



  public getProduct(id: number): Observable<ProductDetails> {
    const headers = this.baseServe.getAuthHeader()
    return this.http.get<any>(`${this.productGetUrl}/${id}`, { headers }).pipe(
      map(response => {
        const details = response.details
          ? response.details.map((detail: any) => ({
            id: detail.id,     
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























  //===================== CREATE ======================
  public createProduct(product: ProductDetails) {
    const payload = {
      productCode: product.productCode,
      productName: product.productName,
      price: product.price,
      quantity: product.quantity,
      discountAmount: product.discountAmount || 0,
      discountPercent: product.discountPercent || 0,
      description: product.description || '',
      rating: product.rating || 0,
      status: product.status,
      image: product.image 
    };

    const headers = this.baseServe.getAuthHeader();

    return this.http.post<{ message: string; product: { id: number } }>(
      this.productCreateUrl,
      payload,
      { headers }
    ).pipe(
      switchMap((res) => {
        const productId = res.product?.id;
        const features = product.details || [];

        if (!features.length) return of(res);

        const featureRequests = features.map((feature) => {
          return this.http.post(`${this.detailBaseUrl}`, {
            key: feature.key,
            value: feature.value,
            productId,
          });
        });

        return forkJoin(featureRequests).pipe(map(() => res));
      })
    );
  }

















  //===================== UPDATE ======================
  saveChangedProduct(product: any): Observable<any> {
    const productId = product.id;
    const headers = this.baseServe.getAuthHeader();

    const uploadedUrls = product.image || [];

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

        const initialIds: number[] = product._initialDetailIds || [];

        const toCreate = currentDetails.filter((d: any) => !d.id);
        const toUpdate = currentDetails.filter((d: any) => d.id);
        const toDelete = initialIds.filter(id => !currentIds.includes(id));

        const detailRequests: Observable<any>[] = [];

        toCreate.forEach(d => {
          detailRequests.push(
            this.http.post(`${this.detailBaseUrl}`, {
              productId,
              key: d.key,
              value: d.value
            }, { headers })
          );
        });

        toUpdate.forEach(d => {
          detailRequests.push(
            this.http.put('/product-detail/update-product/' + d.id, {
              key: d.key,
              value: d.value,
              productId
            }, { headers })
          );
        });

        toDelete.forEach(id => {
          detailRequests.push(
            this.http.delete('/product-detail/delete-product/' + id, { headers })
          );
        });

        if (detailRequests.length === 0) {
          return of(patchRes);
        }

        return forkJoin(detailRequests).pipe(
          map(() => ({
            patchRes,
            message: patchRes.message
          }))
        );
      })
    );
  }






  //===================== DELETE ======================

  public deleteProduct(id: number) {

    const headers = this.baseServe.getAuthHeader();
    return this.http.delete(`${this.productDeleteUrl}/${id}`, { headers })

  }



  public removeUploadedImage(publicId: string) {
  const headers = this.baseServe.getAuthHeader();
  return this.http.delete(`/product/removeImage/${encodeURIComponent(publicId)}`, { headers });
}


}

















