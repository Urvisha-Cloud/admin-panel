import { useQuery } from "@tanstack/react-query";
import { getWithdrawals } from "../services/withdrawal.service";
import { WithdrawalFilters } from "../types/withdrawal.types";
import { WITHDRAWALS_QUERY_KEY } from "../constants";

export const useWithdrawalsQuery = (filters: WithdrawalFilters) =>
  useQuery({
    queryKey: [...WITHDRAWALS_QUERY_KEY, filters],
    queryFn: () => getWithdrawals(filters),
    placeholderData: (previousData) => previousData,
  });
