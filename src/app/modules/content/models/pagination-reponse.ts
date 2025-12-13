import { ProductDetails } from "./blog-details";

// models/pagination-response.ts
export interface PaginationResponse {
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  products: ProductDetails[];
}