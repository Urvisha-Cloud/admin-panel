import { useQuery } from "@tanstack/react-query";
import { getReferrals, getReferralsByInviter, getTopReferrers } from "../services/referral.service";
import { REFERRALS_QUERY_KEY, TOP_REFERRERS_QUERY_KEY, INVITER_REFERRALS_QUERY_KEY } from "../constants";

export const useReferralsQuery = (page: number, limit: number, search: string) =>
  useQuery({
    queryKey: [...REFERRALS_QUERY_KEY, page, limit, search],
    queryFn: () => getReferrals(page, limit, search),
    placeholderData: (previousData) => previousData,
  });

export const useTopReferrersQuery = (limit: number) =>
  useQuery({
    queryKey: [...TOP_REFERRERS_QUERY_KEY, limit],
    queryFn: () => getTopReferrers(limit),
  });

export const useInviterReferralsQuery = (userId: string | null) =>
  useQuery({
    queryKey: [...INVITER_REFERRALS_QUERY_KEY, userId],
    queryFn: () => getReferralsByInviter(userId as string),
    enabled: Boolean(userId),
  });
