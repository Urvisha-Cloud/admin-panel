import apiClient from "../api/client";
import { AdminTokenPurchasesResponse, TokenPurchaseFilters } from "../types/tokenPurchase.types";

export const getTokenPurchases = async (filters: TokenPurchaseFilters): Promise<AdminTokenPurchasesResponse> => {
  const response = await apiClient.get<AdminTokenPurchasesResponse>("/admin/token-purchases", { params: filters });
  return response.data;
};

export default { getTokenPurchases };
