import apiClient from "../api/client";

export interface TokenValueSetting {
  rupeesPerToken: number | null;
  currency: "INR";
  updatedAt: string | null;
}

interface TokenValueResponse {
  success: boolean;
  message?: string;
  data: TokenValueSetting;
}

export const getTokenValue = async (): Promise<TokenValueSetting> => {
  const response = await apiClient.get<TokenValueResponse>("/admin/settings/token-value");
  return response.data.data;
};

export const updateTokenValue = async (rupeesPerToken: number): Promise<TokenValueSetting> => {
  const response = await apiClient.put<TokenValueResponse>("/admin/settings/token-value", {
    rupeesPerToken,
  });
  return response.data.data;
};

export default {
  getTokenValue,
  updateTokenValue,
};
