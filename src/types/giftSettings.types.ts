export interface GiftSettingItem {
  _id?: string;
  giftType: "box" | "heart" | "coin" | "diamond";
  name: string;
  tokenCost: number;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface GiftSettingsResponse {
  success: boolean;
  message?: string;
  data: GiftSettingItem[];
}
