export interface ProductCard {
  id?: number;
  productCode: string;
  productName: string;
  price: number;
  quantity: number;
  discountPercent?: number;
  discountAmount?: number;
  description?: string;  
  image?: string[];
  rating:number
  status:string

}
