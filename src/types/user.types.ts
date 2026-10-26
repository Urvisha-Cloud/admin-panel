export type UserGender = "" | "male" | "female";
export type UserRole = "user" | "admin" | "superAdmin" | "agency";
export type AccountStatus =
  | "pending_verification"
  | "pending_admin_approval"
  | "approved"
  | "rejected";
export type FaceVerificationStatus = "pending" | "submitted" | "approved" | "rejected";
export type AuthProvider = "email" | "google" | "apple";

export interface FaceVerificationPhotos {
  center: string;
  left: string;
  right: string;
}

export interface FaceVerification {
  status: FaceVerificationStatus;
  centerCompleted: boolean;
  leftCompleted: boolean;
  rightCompleted: boolean;
  submittedAt: string | null;
  reviewedAt: string | null;
  rejectionReason: string;
  photos?: FaceVerificationPhotos;
}

export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  isEmailVerified: boolean;
  profileImage: string;
  gender: UserGender;
  tokenBalance: number;
  role: UserRole;
  agencyId?: string | null;
  isBlocked: boolean;
  accountStatus: AccountStatus;
  verificationStatus?: string;
  faceVerification: FaceVerification | null;
  photos?: FaceVerificationPhotos;
  authProvider: AuthProvider;
  createdAt: string;
  updatedAt: string;
}

export interface UserListFilters {
  page: number;
  limit: number;
  search: string;
  gender: UserGender | "all";
  role: UserRole | "all";
  isBlocked: "all" | "blocked" | "unblocked";
  accountStatus: AccountStatus | "all";
  faceStatus: FaceVerificationStatus | "all";
  authProvider: AuthProvider | "all";
}

export interface UserListResponse {
  success: boolean;
  users: AdminUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UpdateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  gender: UserGender;
  role: UserRole;
  isBlocked?: boolean;
  accountStatus: AccountStatus;
  tokenBalance: number;
  profileImage: string;
}

export interface ReviewVerificationPayload {
  status: "approved" | "rejected";
  rejectionReason?: string;
}

