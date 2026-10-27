import apiClient from "../api/client";
import {
  InviterReferralsResponse,
  ReferralListResponse,
  TopReferrersResponse,
} from "../types/referral.types";

export const getReferrals = async (
  page: number,
  limit: number,
  search: string
): Promise<ReferralListResponse> => {
  const params: Record<string, string | number> = { page, limit };
  if (search.trim()) params.search = search.trim();

  const response = await apiClient.get<ReferralListResponse>("/referral/admin", { params });
  return response.data;
};

export const getTopReferrers = async (limit: number): Promise<TopReferrersResponse> => {
  const response = await apiClient.get<TopReferrersResponse>("/referral/admin/top", { params: { limit } });
  return response.data;
};

export const getReferralsByInviter = async (userId: string): Promise<InviterReferralsResponse> => {
  const response = await apiClient.get<InviterReferralsResponse>(`/referral/admin/inviter/${userId}`);
  return response.data;
};
