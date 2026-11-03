export type WithdrawalStatus = "pending" | "processing" | "paid" | "failed" | "rejected";
export type WithdrawalType = "all" | "direct" | "agency";

export interface WithdrawalFilters {
  page: number;
  limit: number;
  status: "all" | WithdrawalStatus;
  type: WithdrawalType;
  search: string;
}

export interface AdminWithdrawal {
  id: string;
  userId: string | null;
  email: string;
  name: string;
  tokens: number;
  baseRate: number;
  userRate: number;
  totalAmount: number;
  memberAmount: number;
  /** null = normal user (no agency) */
  agencyId: string | null;
  agencyName: string;
  agencyPercent: number;
  agencyAmount: number;
  status: WithdrawalStatus;
  payoutMethod: "upi" | "bank" | "";
  payoutDestination: string;
  /** Bank UTR once paid */
  payoutRef: string;
  payoutId: string;
  failureReason: string;
  createdAt: string;
  processedAt: string | null;
}

export interface WithdrawalsSummary {
  withdrawalCount: number;
  paidCount: number;
  processingCount: number;
  failedCount: number;
  paidTokens: number;
  memberAmount: number;
  agencyAmount: number;
  totalAmount: number;
}

export interface AdminWithdrawalsResponse {
  success: boolean;
  summary: WithdrawalsSummary;
  withdrawals: AdminWithdrawal[];
  pagination: { page: number; limit: number; total: number; totalPages: number; hasMore: boolean };
}
