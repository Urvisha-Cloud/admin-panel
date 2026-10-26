import apiClient from "../api/client";
import { DashboardData, DashboardResponse } from "../types/dashboard.types";

export const getDashboardStats = async (): Promise<DashboardData> => {
  const response = await apiClient.get<DashboardResponse>("/admin/dashboard");
  return response.data.data;
};

export default {
  getDashboardStats,
};
