import apiClient from "../api/client";
import {
  AdminUser,
  ReviewVerificationPayload,
  UpdateUserPayload,
  UserListFilters,
  UserListResponse,
} from "../types/user.types";

export const getUsers = async (filters: UserListFilters): Promise<UserListResponse> => {
  const params: Record<string, string | number> = {
    page: filters.page,
    limit: filters.limit,
  };

  if (filters.search.trim()) params.search = filters.search.trim();
  if (filters.gender !== "all") params.gender = filters.gender;
  if (filters.role !== "all") params.role = filters.role;
  if (filters.isBlocked === "blocked") params.isBlocked = "true";
  else if (filters.isBlocked === "unblocked") params.isBlocked = "false";
  if (filters.accountStatus !== "all") params.accountStatus = filters.accountStatus;
  if (filters.faceStatus !== "all") params.faceStatus = filters.faceStatus;
  if (filters.authProvider !== "all") params.authProvider = filters.authProvider;

  const response = await apiClient.get<UserListResponse>("/admin/users", { params });
  return response.data;
};

export const updateUser = async (id: string, payload: UpdateUserPayload): Promise<AdminUser> => {
  const response = await apiClient.patch<{ success: boolean; message?: string; user: AdminUser }>(
    `/admin/users/${id}`,
    payload
  );
  return response.data.user;
};

export const deleteUser = async (id: string): Promise<void> => {
  await apiClient.delete(`/admin/users/${id}`);
};

export const reviewUserVerification = async (
  id: string,
  payload: ReviewVerificationPayload
): Promise<AdminUser> => {
  const response = await apiClient.patch<{ success: boolean; message?: string; user: AdminUser }>(
    `/admin/users/${id}/verification`,
    payload
  );
  return response.data.user;
};

export default {
  getUsers,
  updateUser,
  deleteUser,
  reviewUserVerification,
};
