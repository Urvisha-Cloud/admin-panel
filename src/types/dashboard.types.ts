import { AdminUser } from "./user.types";
import { TokenPackage } from "./tokenPackage.types";

export interface DashboardUserStats {
  total: number;
  approved: number;
  pendingApproval: number;
  pendingVerification: number;
  rejected: number;
  female: number;
  male: number;
}

export interface DashboardTokenPackageStats {
  total: number;
  active: number;
  inactive: number;
  female: number;
  male: number;
  packages?: TokenPackage[];
  recent: TokenPackage[];
}

export interface DashboardCarouselStats {
  total: number;
  active: number;
  femaleActive: number;
  maleActive: number;
}

export interface DashboardData {
  users: DashboardUserStats;
  tokenPackages: DashboardTokenPackageStats;
  carousel: DashboardCarouselStats;
  recentUsers: AdminUser[];
  pendingVerifications: AdminUser[];
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardData;
}
