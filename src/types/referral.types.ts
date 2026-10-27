export interface ReferralPerson {
  id: string;
  name: string;
  email: string;
  gender: string;
  accountStatus: string;
  referralCode: string;
}

export interface ReferralItem {
  id: string;
  code: string;
  createdAt: string;
  inviter: ReferralPerson | null;
  invitee: ReferralPerson | null;
  signupRewardedAt: string | null;
  signupTokens: number;
  purchaseRewardedAt: string | null;
  purchaseTokens: number;
  totalTokens: number;
}

export interface ReferralSummary {
  totalReferrals: number;
  signupRewarded: number;
  purchaseRewarded: number;
  tokensPaid: number;
  inviterCount: number;
}

export interface ReferralPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ReferralListResponse {
  success: boolean;
  data: {
    summary: ReferralSummary;
    referrals: ReferralItem[];
    pagination: ReferralPagination;
  };
}

export interface TopReferrer {
  rank: number;
  inviter: ReferralPerson | null;
  invitedCount: number;
  purchasedCount: number;
  earnedTokens: number;
  lastReferralAt: string;
}

export interface TopReferrersResponse {
  success: boolean;
  data: TopReferrer[];
}

export interface InviterReferralsResponse {
  success: boolean;
  data: {
    inviter: ReferralPerson;
    summary: {
      invitedCount: number;
      purchasedCount: number;
      earnedTokens: number;
    };
    referrals: ReferralItem[];
  };
}
