import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';
import { BaseService } from 'src/app/shared/services/base.service';
import { DiscountDetails } from '../models/discount-details';






export interface discountResponse {
  pagination: any;
  discount: DiscountDetails[];
}


@Injectable({
  providedIn: 'root'
})

export class DiscountService {
  private discountCreateUrl = '/discount/create-discount';
  private discountEditUrl = '/discount/update-discount';
  private DiscountsGetUrl = '/discount/get-discounts';
  private discountGetUrl = '/discount/get-discount';
  private DiscountDeleteUrl = '/discount/delete-discount';


  constructor(
    private http: HttpClient,
    private baseServe: BaseService,
  ) { }



  //===================== GET DISCOUNTS ======================
  public getDiscounts(): Observable<DiscountDetails[]> {
    const headers = this.baseServe.getAuthHeader()
    return this.http.get<discountResponse>(this.DiscountsGetUrl, { headers }).pipe(
      tap(res => console.log('API response getDiscounts:', res)),
      map(response => response.discount)
    );
  }





  //===================== GET DISCOUNT ======================
  public getDiscount(id: number): Observable<DiscountDetails> {
    const headers = this.baseServe.getAuthHeader()
    return this.http.get<any>(`${this.discountGetUrl}/${id}`, { headers }).pipe(
      map(response => {
        return {
          ...response,
        };
      })
    );
  }










  //===================== CREATE ======================
  public creatediscount(discount: DiscountDetails) {
    const payload = {
      code: discount.code,
      percent: discount.percent,
      amount: discount.amount,
      limit: discount.limit,
      expires_in: discount.expires_in,
      type: discount.type,
      productId: discount.productId,
    };
    const headers = this.baseServe.getAuthHeader();
    return this.http.post<{ message: string; discount: string }>(
      this.discountCreateUrl, payload, { headers })
  }

















  //===================== UPDATE ======================
  saveChangeddiscount(discount: DiscountDetails): Observable<any> {
    const discountId = discount.id;
    const headers = this.baseServe.getAuthHeader();


    const discountPayload = {
      code: discount.code,
      percent: discount.percent,
      amount: discount.amount,
      limit: discount.limit,
      expires_in: discount.expires_in,
      type: discount.type,
      productId: discount.productId,
    };
    return this.http.put(`${this.discountEditUrl}/${discountId}`, discountPayload, { headers }).pipe(
    );
  }






  //===================== DELETE ======================

  public deleteDiscount(id: number) {

    const headers = this.baseServe.getAuthHeader();
    return this.http.delete(`${this.DiscountDeleteUrl}/${id}`, { headers })

  }



  public removeUploadedImage(publicId: string) {
    const headers = this.baseServe.getAuthHeader();
    return this.http.delete(`/product/removeImage/${encodeURIComponent(publicId)}`, { headers });
  }


}

















