

export interface OrderDetails {
  id: number;
  orderNumber: string;
  status: string;
  address: string;
  total_amount: number;
  final_amount: number;
  discount_amount: number;
  create_at: string;
  user: {
    id: number;
    fullname: string;
    phone: string;
    email?: string;
  };
  payment?: {
    status: string;
    method?: string;
    transactionId?: string;
  };
  orderItems: OrderItem[];
}  
 

export interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  product?: {
    id: number;
    title: string;
    price: number;
    image?: string;
  };
}

export interface OrdersResponse {
  orders: OrderDetails[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface OrderFilters {
  status?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}