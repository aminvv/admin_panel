import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ProductDetails } from '../models/product-details';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})



export class ProductService {
  private apiUrl = 'http://localhost:3000/api/products';



  constructor(private http: HttpClient) { }

  public createProduct(product: FormData) {
    return this.http.post(this.apiUrl, product)
  }

  public getProducts() {
    return this.http.get<ProductDetails>(`${this.apiUrl}/${"product"}`)
  }

  public getProduct(id: string) {
    return this.http.get<ProductDetails>(`${this.apiUrl}/${id}`)
  }

  updateProduct(id: number, data: Partial<ProductDetails>): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, data);
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }



}
