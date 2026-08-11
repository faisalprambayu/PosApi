export type UserRole = 'Owner' | 'OutletAdmin' | 'Cashier';

export interface User {
  userId: string;
  fullName: string;
  role: UserRole;
  outletId: string | null;
  token: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  price: number;
  costPrice?: number;
  stockQty: number;
  categoryId?: string | null;
  isActive?: boolean;
  isDeleted?: boolean;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  isDeleted?: boolean;
}

export interface Outlet {
  id: string;
  name: string;
  address?: string | null;
  isActive?: boolean;
}

export type PaymentMethod = 0 | 1 | 2 | 3; // 0: Cash, 1: QRIS, 2: DebitCredit, 3: Other
export const PaymentMethodNames: Record<PaymentMethod, string> = {
  0: 'Cash (Tunai)',
  1: 'QRIS',
  2: 'Debit / Kredit',
  3: 'Lainnya'
};

export interface CartItem {
  product: Product;
  qty: number;
}

export interface TransactionItemDto {
  productId: string;
  productNameSnapshot: string;
  priceSnapshot: number;
  qty: number;
  subtotal: number;
}

export interface TransactionDto {
  id: string; // GUID generated on client
  outletId: string;
  cashierId: string;
  transactionNumber: string;
  totalAmount: number;
  paidAmount: number;
  changeAmount: number;
  paymentMethod: PaymentMethod;
  transactionTime: string;
  items: TransactionItemDto[];
  cashierName?: string;
  status?: 'Completed' | 'PendingOffline';
}

export interface SalesSummaryResponse {
  outletId: string;
  totalSales: number;
  totalTransactions: number;
}
