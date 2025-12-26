import { Injectable } from '@angular/core';
import { forkJoin, Observable, of, pipe } from 'rxjs';
import { BlogCard } from '../models';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, switchMap, tap } from 'rxjs/operators';
import { BaseService } from 'src/app/shared/services/base.service';
import { CloudinaryService } from 'src/app/shared/services/cloudinary-upload.service';
import { BlogDetails } from '../models/blog-details';






export interface blogResponse {
  pagination: any;
  blog: BlogDetails[];
}


@Injectable({
  providedIn: 'root'
})





export class BlogService {


  private blogCreateUrl = '/blog/create-blog';
  private blogEditUrl = '/blog/edit-blog';
  private blogsGetUrl = '/blog/get-blogs';
  private blogGetUrl = '/blog/get-blog';
  private productDeleteUrl = '/blog/delete-blog';
  private detailBaseUrl = '/blog-detail/create-detail';


  constructor(
    private http: HttpClient,
    private baseServe: BaseService,
  ) { }



  public getBlogs(): Observable<BlogDetails[]> {
    const headers = this.baseServe.getAuthHeader()
return this.http.get<blogResponse>(this.blogsGetUrl, { headers }).pipe(
  tap(res => console.log('API response getBlogs:', res)),
  map(response => response.blog)
);
  }






  public getBlog(id: number): Observable<BlogDetails> {
    const headers = this.baseServe.getAuthHeader()
    return this.http.get<any>(`${this.blogGetUrl}/${id}`, { headers }).pipe(
      map(response => {
        return {
          ...response,          
        };
      })
    );
  }










  //===================== CREATE ======================
  public createBlog(blog: BlogDetails) {
    const payload = {
      title:blog.title,
      category: blog.category,
      content: blog.content,
      slug: blog.slug,
      thumbnail: blog.thumbnail,
      status: blog.status,
      description: blog.description,
    };
    const headers = this.baseServe.getAuthHeader();
    return this.http.post<{ message: string; blog: string }>(
      this.blogCreateUrl,payload,{ headers })
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
  saveChangedBlog(blog: BlogDetails): Observable<any> {
    const blogId = blog.id;
    const headers = this.baseServe.getAuthHeader();


    const blogPayload = {
      title: blog.title,
      category: blog.category,
      content: blog.content,
      slug: blog.slug,
      status: blog.status,
      description: blog.description,
      thumbnail: blog.thumbnail,
    };
 console.log('Payload:', blogPayload);
    return this.http.patch(`${this.blogEditUrl}/${blogId}`, blogPayload, { headers }).pipe(
    );
  }






  //===================== DELETE ======================

  public deleteBlog(id: number) {

    const headers = this.baseServe.getAuthHeader();
    return this.http.delete(`${this.productDeleteUrl}/${id}`, { headers })

  }



  public removeUploadedImage(publicId: string) {
  const headers = this.baseServe.getAuthHeader();
  return this.http.delete(`/product/removeImage/${encodeURIComponent(publicId)}`, { headers });
}


}

















