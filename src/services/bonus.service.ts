import apiClient from "../api/client";
import {
  WeeklyBonus,
  CreateWeeklyBonusPayload,
  UpdateWeeklyBonusPayload,
  BonusApiResponse,
} from "../types/bonus.types";

/**
 * Fetch all weekly bonuses configured in the admin panel
 */
export const getWeeklyBonuses = async (): Promise<WeeklyBonus[]> => {
  const response = await apiClient.get<BonusApiResponse<WeeklyBonus[]>>("/admin/bonus");
  return response.data.data || [];
};

/**
 * Fetch a single weekly bonus by ID
 */
export const getWeeklyBonusById = async (id: string): Promise<WeeklyBonus> => {
  const response = await apiClient.get<BonusApiResponse<WeeklyBonus>>(`/admin/bonus/${id}`);
  if (!response.data.data) {
    throw new Error(response.data.message || "Failed to fetch weekly bonus");
  }
  return response.data.data;
};

/**
 * Create a new weekly bonus
 */
export const createWeeklyBonus = async (
  payload: CreateWeeklyBonusPayload
): Promise<WeeklyBonus> => {
  const response = await apiClient.post<BonusApiResponse<WeeklyBonus>>("/admin/bonus", payload);
  if (!response.data.data) {
    throw new Error(response.data.message || "Failed to create weekly bonus");
  }
  return response.data.data;
};

/**
 * Update an existing weekly bonus
 */
export const updateWeeklyBonus = async (
  id: string,
  payload: UpdateWeeklyBonusPayload
): Promise<WeeklyBonus> => {
  const response = await apiClient.put<BonusApiResponse<WeeklyBonus>>(`/admin/bonus/${id}`, payload);
  if (!response.data.data) {
    throw new Error(response.data.message || "Failed to update weekly bonus");
  }
  return response.data.data;
};

/**
 * Delete a weekly bonus configuration
 */
export const deleteWeeklyBonus = async (id: string): Promise<void> => {
  await apiClient.delete(`/admin/bonus/${id}`);
};

/**
 * Upload a gift/reward image to S3 for a bonus day
 */
export const uploadBonusImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await apiClient.post<BonusApiResponse>("/admin/bonus/upload-image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  if (!response.data.imageUrl) {
    throw new Error(response.data.message || "Failed to upload bonus image");
  }

  return response.data.imageUrl;
};

export default {
  getWeeklyBonuses,
  getWeeklyBonusById,
  createWeeklyBonus,
  updateWeeklyBonus,
  deleteWeeklyBonus,
  uploadBonusImage,
};
