export interface LevelTier {
  level: number;
  malePoints: number;
  femalePoints: number;
}

export interface LevelConfig {
  tiers: LevelTier[];
  // Future video call inactivity downgrade (not active yet)
  femaleInactivityDays: number;
  updatedAt?: string | null;
}

export interface LevelConfigResponse {
  success: boolean;
  data: LevelConfig;
}

export interface LevelUser {
  id: string;
  name: string;
  email: string;
  profileImage: string;
  gender: string;
  level: number;
  points: number;
  levelChangedAt: string | null;
}

export interface LevelUsersResponse {
  success: boolean;
  data: {
    users: LevelUser[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  };
}

export interface LevelSummaryRow {
  gender: "male" | "female";
  level: number;
  count: number;
}

export interface LevelSummaryResponse {
  success: boolean;
  data: LevelSummaryRow[];
}

export interface LevelUsersFilter {
  page: number;
  limit: number;
  search: string;
  gender: "" | "male" | "female";
  level: string;
}

export interface RecalculateResponse {
  success: boolean;
  data: { checked: number; changed: number };
}
