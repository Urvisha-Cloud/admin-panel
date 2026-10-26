import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTokenPackage,
  deleteTokenPackage,
  getTokenPackages,
  togglePackageStatus,
  updateTokenPackage,
} from "../services/tokenPackage.service";
import {
  CreateTokenPackagePayload,
  TokenPackageListFilters,
  UpdateTokenPackagePayload,
} from "../types/tokenPackage.types";

export const TOKEN_PACKAGES_QUERY_KEY = ["admin-token-packages"];

export const useTokenPackagesQuery = (filters: TokenPackageListFilters) =>
  useQuery({
    queryKey: [...TOKEN_PACKAGES_QUERY_KEY, filters],
    queryFn: () => getTokenPackages(filters),
    placeholderData: (previousData) => previousData,
  });

export const useCreateTokenPackageMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTokenPackagePayload) => createTokenPackage(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TOKEN_PACKAGES_QUERY_KEY }),
  });
};

export const useUpdateTokenPackageMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTokenPackagePayload }) =>
      updateTokenPackage(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TOKEN_PACKAGES_QUERY_KEY }),
  });
};

export const useTogglePackageStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      togglePackageStatus(id, isActive),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TOKEN_PACKAGES_QUERY_KEY }),
  });
};

export const useDeleteTokenPackageMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTokenPackage(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TOKEN_PACKAGES_QUERY_KEY }),
  });
};
