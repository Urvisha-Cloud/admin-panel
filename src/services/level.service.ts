import apiClient from "../api/client";
import {
  LevelConfig,
  LevelConfigResponse,
  LevelSummaryResponse,
  LevelUsersFilter,
  LevelUsersResponse,
  RecalculateResponse,
} from "../types/level.types";

export const getLevelConfig = async (): Promise<LevelConfigResponse> => {
  const response = await apiClient.get<LevelConfigResponse>("/level/admin/config");
  return response.data;
};

export const saveLevelConfig = async (config: LevelConfig): Promise<LevelConfigResponse> => {
  const response = await apiClient.put<LevelConfigResponse>("/level/admin/config", config);
  return response.data;
};

export const getLevelUsers = async (filter: LevelUsersFilter): Promise<LevelUsersResponse> => {
  const params: Record<string, string | number> = { page: filter.page, limit: filter.limit };
  if (filter.search.trim()) params.search = filter.search.trim();
  if (filter.gender) params.gender = filter.gender;
  if (filter.level !== "") params.level = filter.level;

  const response = await apiClient.get<LevelUsersResponse>("/level/admin/users", { params });
  return response.data;
};

export const getLevelSummary = async (): Promise<LevelSummaryResponse> => {
  const response = await apiClient.get<LevelSummaryResponse>("/level/admin/summary");
  return response.data;
};

export const recalculateLevels = async (): Promise<RecalculateResponse> => {
  const response = await apiClient.post<RecalculateResponse>("/level/admin/recalculate");
  return response.data;
};
