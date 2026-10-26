// Totals of completed withdrawals made under an agency (amounts in INR)
export interface AgencyEarnings {
  withdrawalCount: number;
  totalTokens: number;
  totalAmount: number;
  memberAmount: number;
  agencyAmount: number;
}

export interface Agency {
  id: string;
  name: string;
  email: string;
  percentage: number;
  personCount: number;
  assignedCount: number;
  status: "active" | "inactive";
  members: string[];
  earnings: AgencyEarnings;
  createdAt: string;
  updatedAt: string;
}

export interface AgencyPerson {
  // Member email; doubles as the list key
  id: string;
  isRegistered: boolean;
  userId: string | null;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  profileImage: string;
  gender: string;
  accountStatus: string;
  isBlocked: boolean;
  tokenBalance: number;
  creditBalance: number;
  role: string;
  createdAt: string | null;
}

export interface AgencyListFilters {
  page: number;
  limit: number;
  search: string;
  status: "all" | "active" | "inactive";
}

export interface AgencyListResponse {
  success: boolean;
  agencies: Agency[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AgencyDetailResponse {
  success: boolean;
  agency: Agency;
  persons: AgencyPerson[];
}

export interface AgencyMemberEarnings extends AgencyEarnings {
  userId: string | null;
  email: string;
  name: string;
  lastWithdrawalAt: string | null;
}

export interface AgencyWithdrawal {
  id: string;
  userId: string | null;
  email: string;
  name: string;
  tokens: number;
  baseRate: number;
  userRate: number;
  agencyPercent: number;
  totalAmount: number;
  memberAmount: number;
  agencyAmount: number;
  status: "pending" | "paid" | "rejected";
  createdAt: string;
}

export interface AgencyWithdrawalsResponse {
  success: boolean;
  agency: Agency;
  summary: AgencyEarnings;
  members: AgencyMemberEarnings[];
  withdrawals: AgencyWithdrawal[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateAgencyPayload {
  name: string;
  email: string;
  percentage: number;
  personCount: number;
  members?: string[];
}

export interface UpdateAgencyPayload {
  name?: string;
  percentage?: number;
  personCount?: number;
  status?: "active" | "inactive";
  members?: string[];
}

export interface AddPersonPayload {
  email: string;
}
