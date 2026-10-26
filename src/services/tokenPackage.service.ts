import apiClient from "../api/client";
import {
  CreateTokenPackagePayload,
  TokenPackage,
  TokenPackageListFilters,
  TokenPackageListResponse,
  UpdateTokenPackagePayload,
} from "../types/tokenPackage.types";

export const getTokenPackages = async (
  filters?: TokenPackageListFilters
): Promise<TokenPackageListResponse> => {
  const params: Record<string, string | number> = {
    page: filters?.page ?? 1,
    limit: filters?.limit ?? 20,
  };

  if (filters?.search?.trim()) params.search = filters.search.trim();
  if (filters?.gender && filters.gender !== "all") params.gender = filters.gender;
  if (filters?.isActive !== undefined && filters.isActive !== "all") params.isActive = filters.isActive;

  const response = await apiClient.get<TokenPackageListResponse>("/token-packages", { params });
  return response.data;
};

export const getTokenPackageById = async (id: string): Promise<TokenPackage> => {
  const response = await apiClient.get<{ success: boolean; package: TokenPackage }>(
    `/token-packages/${id}`
  );
  return response.data.package;
};

export const createTokenPackage = async (
  payload: CreateTokenPackagePayload
): Promise<TokenPackage> => {
  const response = await apiClient.post<{ success: boolean; message: string; package: TokenPackage }>(
    "/token-packages",
    payload
  );
  return response.data.package;
};

export const updateTokenPackage = async (
  id: string,
  payload: UpdateTokenPackagePayload
): Promise<TokenPackage> => {
  const response = await apiClient.put<{ success: boolean; message: string; package: TokenPackage }>(
    `/token-packages/${id}`,
    payload
  );
  return response.data.package;
};

export const togglePackageStatus = async (
  id: string,
  isActive: boolean
): Promise<TokenPackage> => {
  const response = await apiClient.patch<{ success: boolean; message: string; package: TokenPackage }>(
    `/token-packages/${id}/status`,
    { isActive }
  );
  return response.data.package;
};

export const deleteTokenPackage = async (id: string): Promise<void> => {
  await apiClient.delete(`/token-packages/${id}`);
};

export default {
  getTokenPackages,
  getTokenPackageById,
  createTokenPackage,
  updateTokenPackage,
  togglePackageStatus,
  deleteTokenPackage,
};
