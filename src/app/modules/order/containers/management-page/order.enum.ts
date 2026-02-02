
export enum OrderStatus {
  PENDING = 'pending',             
  PAYMENT_PENDING = 'payment_pending', 
  PAYMENT_FAILED = 'payment_failed',   
  PAYMENT_VERIFIED = 'payment_verified', 
  PROCESSING = 'processing',       
  PACKED = 'packed',                
  READY_TO_SHIP = 'ready_to_ship',  
  IN_TRANSIT = 'in_transit',        
  DELIVERED = 'delivered',          
  COMPLETED = 'completed',          
  CANCELLED = 'cancelled',          
  RETURN_REQUESTED = 'return_requested', 
  RETURNED = 'returned',            
  REFUNDED = 'refunded'            
}

export const OrderStatusLabels = {
  [OrderStatus.PENDING]: 'در انتظار تایید',
  [OrderStatus.PAYMENT_PENDING]: 'در انتظار پرداخت',
  [OrderStatus.PAYMENT_FAILED]: 'پرداخت ناموفق',
  [OrderStatus.PAYMENT_VERIFIED]: 'پرداخت تایید شد',
  [OrderStatus.PROCESSING]: 'در حال پردازش',
  [OrderStatus.PACKED]: 'بسته‌بندی شده',
  [OrderStatus.READY_TO_SHIP]: 'آماده ارسال',
  [OrderStatus.IN_TRANSIT]: 'در حال حمل',
  [OrderStatus.DELIVERED]: 'تحویل داده شد',
  [OrderStatus.COMPLETED]: 'تکمیل شده',
  [OrderStatus.CANCELLED]: 'لغو شده',
  [OrderStatus.RETURN_REQUESTED]: 'درخواست مرجوعی',
  [OrderStatus.RETURNED]: 'مرجوع شده',
  [OrderStatus.REFUNDED]: 'بازپرداخت شده'
};

export const OrderStatusColors = {
  [OrderStatus.PENDING]: 'warning',
  [OrderStatus.PAYMENT_PENDING]: 'orange',
  [OrderStatus.PAYMENT_FAILED]: 'danger',
  [OrderStatus.PAYMENT_VERIFIED]: 'success',
  [OrderStatus.PROCESSING]: 'info',
  [OrderStatus.PACKED]: 'cyan',
  [OrderStatus.READY_TO_SHIP]: 'blue',
  [OrderStatus.IN_TRANSIT]: 'purple',
  [OrderStatus.DELIVERED]: 'green',
  [OrderStatus.COMPLETED]: 'dark',
  [OrderStatus.CANCELLED]: 'gray',
  [OrderStatus.RETURN_REQUESTED]: 'pink',
  [OrderStatus.RETURNED]: 'brown',
  [OrderStatus.REFUNDED]: 'teal'
};