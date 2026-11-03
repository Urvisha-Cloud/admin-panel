export type TokenPurchaseStatus = "pending" | "paid" | "failed" | "cancelled";

export interface TokenPurchaseFilters {
  page: number;
  limit: number;
  status: "all" | TokenPurchaseStatus;
  search: string;
}

export interface AdminTokenPurchase {
  id: string;
  userId: string | null;
  email: string;
  name: string;
  tokens: number;
  originalPrice: number;
  discountPercentage: number;
  price: number;
  currency: string;
  status: TokenPurchaseStatus;
  /** "razorpay", or "" for purchases made before the Razorpay integration */
  paymentProvider: string;
  orderId: string;
  paymentId: string;
  createdAt: string;
  creditedAt: string | null;
}

export interface TokenPurchasesSummary {
  purchaseCount: number;
  paidCount: number;
  pendingCount: number;
  cancelledCount: number;
  paidTokens: number;
  /** Paid revenue per currency (packages can be priced in USD or INR) */
  revenue: { currency: string; amount: number; purchaseCount: number }[];
}

export interface AdminTokenPurchasesResponse {
  success: boolean;
  summary: TokenPurchasesSummary;
  purchases: AdminTokenPurchase[];
  pagination: { page: number; limit: number; total: number; totalPages: number; hasMore: boolean };
}
