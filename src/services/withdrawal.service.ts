import apiClient from "../api/client";
import { AdminWithdrawalsResponse, WithdrawalFilters } from "../types/withdrawal.types";

export const getWithdrawals = async (filters: WithdrawalFilters): Promise<AdminWithdrawalsResponse> => {
  const response = await apiClient.get<AdminWithdrawalsResponse>("/admin/withdrawals", { params: filters });
  return response.data;
};

export default { getWithdrawals };
