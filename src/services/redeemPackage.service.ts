import apiClient from "../api/client";
import {
  CreateRedeemPackagePayload,
  RedeemPackage,
  RedeemPackageListFilters,
  RedeemPackageListResponse,
  UpdateRedeemPackagePayload,
} from "../types/redeemPackage.types";

export const getRedeemPackages = async (
  filters?: RedeemPackageListFilters
): Promise<RedeemPackageListResponse> => {
  const params: Record<string, string | number> = {
    page: filters?.page ?? 1,
    limit: filters?.limit ?? 50,
  };

  if (filters?.search?.trim()) params.search = filters.search.trim();
  if (filters?.isActive !== undefined && filters.isActive !== "all") params.isActive = filters.isActive;

  const response = await apiClient.get<RedeemPackageListResponse>("/admin/redeem-packages", { params });
  return response.data;
};

export const createRedeemPackage = async (
  payload: CreateRedeemPackagePayload
): Promise<RedeemPackage> => {
  const response = await apiClient.post<{ success: boolean; message: string; data: RedeemPackage }>(
    "/admin/redeem-packages",
    payload
  );
  return response.data.data;
};

export const updateRedeemPackage = async (
  id: string,
  payload: UpdateRedeemPackagePayload
): Promise<RedeemPackage> => {
  const response = await apiClient.put<{ success: boolean; message: string; data: RedeemPackage }>(
    `/admin/redeem-packages/${id}`,
    payload
  );
  return response.data.data;
};

export const toggleRedeemPackageStatus = async (
  id: string,
  isActive: boolean
): Promise<RedeemPackage> => {
  const response = await apiClient.patch<{ success: boolean; message: string; data: RedeemPackage }>(
    `/admin/redeem-packages/${id}/toggle`,
    { isActive }
  );
  return response.data.data;
};

export const updateRedeemPackageOrder = async (
  id: string,
  displayOrder: number
): Promise<RedeemPackage> => {
  const response = await apiClient.patch<{ success: boolean; message: string; data: RedeemPackage }>(
    `/admin/redeem-packages/${id}/display-order`,
    { displayOrder }
  );
  return response.data.data;
};

export const uploadRedeemPackageImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await apiClient.post<{ success: boolean; imageUrl?: string; data?: { imageUrl: string } }>(
    "/admin/redeem-packages/upload-image",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  const url = response.data.imageUrl || response.data.data?.imageUrl;
  if (!url) {
    throw new Error("Failed to upload redeem package icon.");
  }

  return url;
};

export const deleteRedeemPackage = async (id: string): Promise<void> => {
  await apiClient.delete(`/admin/redeem-packages/${id}`);
};

export default {
  getRedeemPackages,
  createRedeemPackage,
  updateRedeemPackage,
  uploadRedeemPackageImage,
  toggleRedeemPackageStatus,
  updateRedeemPackageOrder,
  deleteRedeemPackage,
};
