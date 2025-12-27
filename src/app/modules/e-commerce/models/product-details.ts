


export interface ProductDetails {
  id?: number;
  productName: string;
  productCode: string;
  price: number;
  slug: string;
  quantity: number;
  active_discount: boolean;
  description?: string;
  image?: { url: string; publicId: string }[];
  details?: { key: string; value: string }[]
  status: boolean
  _initialDetailIds?: number[];
}
