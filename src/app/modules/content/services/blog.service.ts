import { Injectable } from '@angular/core';
import { forkJoin, Observable, of, pipe } from 'rxjs';
import { BlogCard } from '../models';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, switchMap, tap } from 'rxjs/operators';
import { BaseService } from 'src/app/shared/services/base.service';
import { CloudinaryService } from 'src/app/shared/services/cloudinary-upload.service';
import { BlogDetails } from '../models/product-details';


// export const products: BlogDetails[] = [
//   {
//     id: 1,
//     productCode: '135234',
//     productName: 'Trainers',
//     price: 80,
//     quantity: 10,
//     discountPercent: 20,
//     discountAmount: 16, // 20% از 80
//     description: 'Sneakers (also known as athletic shoes, tennis shoes, gym shoes, runners, takkies, or trainers) are shoes primarily designed for sports or other forms of physical exercise, but which are now also often used for everyday wear. The term generally describes a type of footwear with a flexible sole made of rubber or synthetic material and an upper part made of leather or synthetic materials.',
//     image: [
//       { url: './assets/e-commerce/products/3.png', publicId: null }
//     ],
//     rating: 4.6,
//     status: 'New'
//   },
//   {
//     id: 2,
//     productCode: '135264',
//     productName: 'Boots',
//     price: 37,
//     quantity: 5,
//     discountPercent: 20,
//     discountAmount: 7.4,
//     description: 'Sneakers (also known as athletic shoes, tennis shoes, gym shoes, runners, takkies, or trainers) are shoes primarily designed for sports or other forms of physical exercise, but which are now also often used for everyday wear. The term generally describes a type of footwear with a flexible sole made of rubber or synthetic material and an upper part made of leather or synthetic materials.',
//     image: [
//       { url: './assets/e-commerce/products/3.png', publicId: null }
//     ],
//     rating: 4.6,
//     status: 'Sale'
//   },
//   {
//     id: 3,
//     productCode: '125234',
//     productName: 'Flat sandals',
//     price: 70,
//     quantity: 15,
//     discountPercent: 20,
//     discountAmount: 14,
//     description: 'Sneakers (also known as athletic shoes, tennis shoes, gym shoes, runners, takkies, or trainers) are shoes primarily designed for sports or other forms of physical exercise, but which are now also often used for everyday wear. The term generally describes a type of footwear with a flexible sole made of rubber or synthetic material and an upper part made of leather or synthetic materials.',
//     image: ['./assets/e-commerce/products/1.png'],
//     rating: 4.6,
//     status: 'New'
//   }
// ];



export interface blogResponse {
  pagination: any;
  blogs: BlogDetails[];
}


@Injectable({
  providedIn: 'root'
})





export class BlogService {


  private productCreateUrl = '/blog/create-blog';
  private productEditUrl = '/blog/edit-blog';
  private productsGetUrl = '/blog/get-products';
  private productGetUrl = '/blog/get-blog';
  private productDeleteUrl = '/blog/delete-blog';
  private detailBaseUrl = '/blog-detail/create-detail';


  constructor(
    private http: HttpClient,
    private baseServe: BaseService,
    private CloudinaryService: CloudinaryService
  ) { }



  public getBlogs(): Observable<BlogDetails[]> {
    const headers = this.baseServe.getAuthHeader()
    return this.http.get<blogResponse>(this.productsGetUrl, { headers }).pipe(
      map(response => response.blogs)
    )
  }






  public getBlog(id: number): Observable<BlogDetails> {
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























  //===================== CREATE ======================
  public createProduct(blog: BlogDetails) {
    const payload = {
      productCode: blog.content,
      productName: blog.content,
      price: blog.content,
      quantity: blog.content,
      discountAmount: blog.content || 0,
      discountPercent: blog.content || 0,
      description: blog.description || '',
      rating: blog.content || 0,
      status: blog.content,
      image: blog.image
    };
    console.log("img---------", blog.image);

    const headers = this.baseServe.getAuthHeader();

    return this.http.post<{ message: string; blog: { id: number } }>(
      this.productCreateUrl,
      payload,
      { headers }
    ).pipe(
      switchMap((res) => {
        const productId = res.blog?.id;
        const features = blog.content || [];

        if (!features.length) return of(res);



        return
      })
    );
  }











  public getSimilarProducts(): Observable<BlogCard[]> {
    return of([
      {
        id: 1,
        title: 'Trainers',
        description: 'Sneakers (also known as athletic shoes...)',
        content: 'Sneakers (also known as athletic shoes, tennis shoes, gym shoes, runners...)',
        slug: 'trainers',
        category: 'shoes',
        image: ['./assets/e-commerce/products/1.png'],
        create_at: new Date().toISOString(),
        update_at: new Date().toISOString(),
        comments: []
      },
      {
        id: 2,
        title: 'Boots',
        description: 'Sneakers (also known as athletic shoes...)',
        content: 'Sneakers (also known as athletic shoes, tennis shoes, gym shoes, runners...)',
        slug: 'boots',
        category: 'shoes',
        image: ['./assets/e-commerce/products/2.png'],
        create_at: new Date().toISOString(),
        update_at: new Date().toISOString(),
        comments: []
      },
      {
        id: 3,
        title: 'Flat sandals',
        description: 'Sneakers (also known as athletic shoes...)',
        content: 'Sneakers (also known as athletic shoes, tennis shoes, gym shoes, runners...)',
        slug: 'flat-sandals',
        category: 'shoes',
        image: ['./assets/e-commerce/products/3.png'],
        create_at: new Date().toISOString(),
        update_at: new Date().toISOString(),
        comments: []
      }
    ]);
  }






  //===================== UPDATE ======================
  saveChangedBlog(blog: any): Observable<any> {
    const productId = blog.id;
    const headers = this.baseServe.getAuthHeader();

    const uploadedUrls = blog.image || [];

    const productPayload = {
      productCode: blog.productCode,
      productName: blog.productName,
      price: blog.price,
      quantity: blog.quantity,
      discountPercent: blog.discountPercent,
      discountAmount: blog.discountAmount,
      description: blog.description,
      rating: blog.rating,
      status: blog.status,
      image: uploadedUrls
    };

    return this.http.patch(`${this.productEditUrl}/${productId}`, productPayload, { headers }).pipe(
      switchMap((patchRes: any) => {

        const currentDetails = (blog.details || []).map((d: any) => ({ ...d }));
        const currentIds = currentDetails.filter((d: any) => d.id).map((d: any) => d.id);

        const initialIds: number[] = blog._initialDetailIds || [];

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
            this.http.put('/blog-detail/update-blog/' + d.id, {
              key: d.key,
              value: d.value,
              productId
            }, { headers })
          );
        });

        toDelete.forEach(id => {
          detailRequests.push(
            this.http.delete('/blog-detail/delete-blog/' + id, { headers })
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

  public deleteBlog(id: number) {

    const headers = this.baseServe.getAuthHeader();
    return this.http.delete(`${this.productDeleteUrl}/${id}`, { headers })

  }



  public removeUploadedImage(publicId: string) {
    const headers = this.baseServe.getAuthHeader();
    return this.http.delete(`/blog/removeImage/${encodeURIComponent(publicId)}`, { headers });
  }


}

















