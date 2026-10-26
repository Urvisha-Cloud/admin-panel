export interface RedeemPackage {
  id: string;
  _id?: string;
  title: string;
  icon?: string;
  requiredTokens: number;
  creditValue: number;
  displayOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRedeemPackagePayload {
  title: string;
  icon?: string;
  requiredTokens: number;
  creditValue: number;
  displayOrder?: number;
  isActive?: boolean;
}

export interface UpdateRedeemPackagePayload extends Partial<CreateRedeemPackagePayload> {}

export interface RedeemPackageListFilters {
  page: number;
  limit: number;
  search: string;
  isActive: "all" | "true" | "false";
}

export interface RedeemPackageListResponse {
  success: boolean;
  packages: RedeemPackage[];
  data?: RedeemPackage[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
