import apiClient from "../api/client";
import { GiftSettingItem, GiftSettingsResponse } from "../types/giftSettings.types";

export const getAdminGiftSettings = async (): Promise<GiftSettingItem[]> => {
  const response = await apiClient.get<GiftSettingsResponse>("/admin/settings/gifts");
  return response.data.data || [];
};


export const updateAdminGiftSettings = async (
  gifts: Array<{ giftType: string; tokenCost: number }>
): Promise<GiftSettingItem[]> => {
  const response = await apiClient.put<GiftSettingsResponse>("/admin/settings/gifts", {
    gifts,
  });
  if (!response.data.data) {
    throw new Error(response.data.message || "Failed to update gift token settings");
  }
  return response.data.data;
};

export default {
  getAdminGiftSettings,
  updateAdminGiftSettings,
};
