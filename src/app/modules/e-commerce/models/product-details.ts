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
