export type PackageGender = "male" | "female";

export interface TokenPackage {
  id: string;
  tokens: number;
  price: number;
  currency: string;
  discountPercentage: number;
  label: string | null;
  gender: PackageGender;
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTokenPackagePayload {
  tokens: number;
  price: number;
  currency?: string;
  discountPercentage?: number;
  label?: string | null;
  gender: PackageGender;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateTokenPackagePayload extends Partial<CreateTokenPackagePayload> {}

export interface TokenPackageListFilters {
  page: number;
  limit: number;
  search: string;
  gender: "all" | PackageGender;
  isActive: "all" | "true" | "false";
}

export interface TokenPackageListResponse {
  success: boolean;
  packages: TokenPackage[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
