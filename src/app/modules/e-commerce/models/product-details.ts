export interface ProductDetails {
  id?: number;
  productCode: string;
  productName: string;
  price: number;
  quantity: number;
  discountPercent?: number;
  discountAmount?: number;
  image?: string[];
}
