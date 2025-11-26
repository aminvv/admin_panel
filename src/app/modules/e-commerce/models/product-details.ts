// export interface ProductDetails {
//   id: string;
//   image: string;
//   imageLarge?: string;
//   imageSmall?: string;
//   title: string;
//   subtitle: string;
//   price: string;
//   discount: string;
//   description1: string;
//   description2: string;
//   code: string;
//   hashtag: string;
//   technology: string[];
//   rating: string;
//   status: string;
// }



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
