


export interface ProductDetails {
  id?: number;
  productName: string;
  productCode: string;
  price: number;
  quantity: number;
  discountPercent?: number;
  discountAmount?: number;
  description?: string;
  image?: { url: string; publicId: string }[];
  details?: { key: string; value: string }[]
  rating: number
  status: string
  _initialDetailIds?: number[];
}
