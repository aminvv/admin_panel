export interface Payment {
  id: number;
  amount: number;
  status: boolean;         
  invoice_number: string;
  refId: string | null;
  authority: string | null;
  create_at: string;        
  order?: {
    id: number;
    final_amount: number;
    status: string;
  };
  user?: {
    id: number;
    firstName: string | null;
    lastName: string | null;
    mobile: string;
  };
}

export interface PaymentDetail extends Payment {
}

export const PaymentStatusMap: Record<string, { label: string; class: string }> = {
  true: { label: 'موفق', class: 'status-success' },
  false: { label: 'ناموفق', class: 'status-failed' }
};