export type BonusRewardType =
  | "token"
  | "star"
  | "video"
  | "private_call"
  | "chat"
  | "emoji"
  | "flower"
  | "gift"
  | "surprise";

export interface BonusDayConfig {
  _id?: string;
  dayNumber: number;
  dayName: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
  rewardType: BonusRewardType;
  title: string;
  description?: string;
  value: number | string;
  tokenAmount: number;
  image?: string;
  isActive: boolean;
}

export interface WeeklyBonus {
  _id: string;
  id?: string;
  title: string;
  description?: string;
  weekStartDate?: string | null;
  weekEndDate?: string | null;
  days: BonusDayConfig[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateWeeklyBonusPayload {
  title: string;
  description?: string;
  isActive: boolean;
  days: BonusDayConfig[];
  weekStartDate?: string | null;
  weekEndDate?: string | null;
}

export interface UpdateWeeklyBonusPayload {
  title?: string;
  description?: string;
  isActive?: boolean;
  days?: BonusDayConfig[];
  weekStartDate?: string | null;
  weekEndDate?: string | null;
}

export interface BonusApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  imageUrl?: string;
}
