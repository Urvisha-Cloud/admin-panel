import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addPersonToAgency,
  createAgency,
  deleteAgency,
  getAgencies,
  getAgencyById,
  getAgencyWithdrawals,
  removePersonFromAgency,
  updateAgency,
} from "../services/agency.service";
import {
  AddPersonPayload,
  AgencyListFilters,
  CreateAgencyPayload,
  UpdateAgencyPayload,
} from "../types/agency.types";

export const AGENCIES_QUERY_KEY = ["admin-agencies"];
export const AGENCY_DETAIL_QUERY_KEY = ["admin-agency-detail"];
export const AGENCY_WITHDRAWALS_QUERY_KEY = ["admin-agency-withdrawals"];

export const useAgenciesQuery = (filters: AgencyListFilters) =>
  useQuery({
    queryKey: [...AGENCIES_QUERY_KEY, filters],
    queryFn: () => getAgencies(filters),
    placeholderData: (previousData) => previousData,
  });

export const useAgencyDetailQuery = (agencyId: string | null) =>
  useQuery({
    queryKey: [...AGENCY_DETAIL_QUERY_KEY, agencyId],
    queryFn: () => (agencyId ? getAgencyById(agencyId) : null),
    enabled: Boolean(agencyId),
  });

export const useAgencyWithdrawalsQuery = (agencyId: string | null, page: number, limit = 20) =>
  useQuery({
    queryKey: [...AGENCY_WITHDRAWALS_QUERY_KEY, agencyId, page, limit],
    queryFn: () => getAgencyWithdrawals(agencyId as string, page, limit),
    enabled: Boolean(agencyId),
    placeholderData: (previousData) => previousData,
  });

export const useCreateAgencyMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAgencyPayload) => createAgency(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AGENCIES_QUERY_KEY });
    },
  });
};

export const useUpdateAgencyMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateAgencyPayload }) =>
      updateAgency(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: AGENCIES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...AGENCY_DETAIL_QUERY_KEY, id] });
    },
  });
};

export const useDeleteAgencyMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAgency(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AGENCIES_QUERY_KEY });
    },
  });
};

export const useAddPersonToAgencyMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      agencyId,
      payload,
    }: {
      agencyId: string;
      payload: AddPersonPayload;
    }) => addPersonToAgency(agencyId, payload),
    onSuccess: (_, { agencyId }) => {
      queryClient.invalidateQueries({ queryKey: AGENCIES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...AGENCY_DETAIL_QUERY_KEY, agencyId] });
    },
  });
};

export const useRemovePersonFromAgencyMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      agencyId,
      email,
    }: {
      agencyId: string;
      email: string;
    }) => removePersonFromAgency(agencyId, email),
    onSuccess: (_, { agencyId }) => {
      queryClient.invalidateQueries({ queryKey: AGENCIES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...AGENCY_DETAIL_QUERY_KEY, agencyId] });
    },
  });
};
