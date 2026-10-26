import apiClient from "../api/client";
import {
  AddPersonPayload,
  Agency,
  AgencyDetailResponse,
  AgencyListFilters,
  AgencyListResponse,
  AgencyPerson,
  AgencyWithdrawalsResponse,
  CreateAgencyPayload,
  UpdateAgencyPayload,
} from "../types/agency.types";

export const getAgencies = async (filters: AgencyListFilters): Promise<AgencyListResponse> => {
  const params: Record<string, string | number> = {
    page: filters.page,
    limit: filters.limit,
  };

  if (filters.search.trim()) params.search = filters.search.trim();
  if (filters.status !== "all") params.status = filters.status;

  const response = await apiClient.get<AgencyListResponse>("/admin/agencies", { params });
  return response.data;
};

export const getAgencyById = async (id: string): Promise<AgencyDetailResponse> => {
  const response = await apiClient.get<AgencyDetailResponse>(`/admin/agencies/${id}`);
  return response.data;
};

export const getAgencyWithdrawals = async (
  id: string,
  page: number,
  limit: number
): Promise<AgencyWithdrawalsResponse> => {
  const response = await apiClient.get<AgencyWithdrawalsResponse>(
    `/admin/agencies/${id}/withdrawals`,
    { params: { page, limit } }
  );
  return response.data;
};

export const createAgency = async (payload: CreateAgencyPayload): Promise<Agency> => {
  const response = await apiClient.post<{ success: boolean; message?: string; agency: Agency }>(
    "/admin/agencies",
    payload
  );
  return response.data.agency;
};

export const updateAgency = async (
  id: string,
  payload: UpdateAgencyPayload
): Promise<Agency> => {
  const response = await apiClient.patch<{ success: boolean; message?: string; agency: Agency }>(
    `/admin/agencies/${id}`,
    payload
  );
  return response.data.agency;
};

export const deleteAgency = async (id: string): Promise<void> => {
  await apiClient.delete(`/admin/agencies/${id}`);
};

export const addPersonToAgency = async (
  agencyId: string,
  payload: AddPersonPayload
): Promise<{ success: boolean; message?: string; person: AgencyPerson; assignedCount: number }> => {
  const response = await apiClient.post<{
    success: boolean;
    message?: string;
    person: AgencyPerson;
    assignedCount: number;
  }>(`/admin/agencies/${agencyId}/persons`, payload);
  return response.data;
};

export const removePersonFromAgency = async (
  agencyId: string,
  email: string
): Promise<{ success: boolean; message?: string; assignedCount: number }> => {
  const response = await apiClient.delete<{
    success: boolean;
    message?: string;
    assignedCount: number;
  }>(`/admin/agencies/${agencyId}/persons/${encodeURIComponent(email)}`);
  return response.data;
};

export default {
  getAgencies,
  getAgencyById,
  getAgencyWithdrawals,
  createAgency,
  updateAgency,
  deleteAgency,
  addPersonToAgency,
  removePersonFromAgency,
};
