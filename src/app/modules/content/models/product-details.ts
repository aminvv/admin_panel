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



export interface BlogDetails {
id?: number
title: string
description: string
content: string
slug: string
category: string
image?: string[]
create_at?: string 
update_at?: string
comments?: Comment[]
}
