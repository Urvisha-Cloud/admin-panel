import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createRedeemPackage,
  deleteRedeemPackage,
  getRedeemPackages,
  toggleRedeemPackageStatus,
  updateRedeemPackage,
  updateRedeemPackageOrder,
  uploadRedeemPackageImage,
} from "../services/redeemPackage.service";
import {
  CreateRedeemPackagePayload,
  RedeemPackageListFilters,
  UpdateRedeemPackagePayload,
} from "../types/redeemPackage.types";

export const REDEEM_PACKAGES_QUERY_KEY = ["admin-redeem-packages"];

export const useUploadRedeemPackageImageMutation = () => {
  return useMutation({
    mutationFn: (file: File) => uploadRedeemPackageImage(file),
  });
};

export const useRedeemPackagesQuery = (filters?: RedeemPackageListFilters) => {
  return useQuery({
    queryKey: [...REDEEM_PACKAGES_QUERY_KEY, filters],
    queryFn: () => getRedeemPackages(filters),
    placeholderData: (previousData) => previousData,
    staleTime: 30 * 1000,
  });
};

export const useCreateRedeemPackageMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRedeemPackagePayload) => createRedeemPackage(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REDEEM_PACKAGES_QUERY_KEY });
    },
  });
};

export const useUpdateRedeemPackageMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateRedeemPackagePayload;
    }) => updateRedeemPackage(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REDEEM_PACKAGES_QUERY_KEY });
    },
  });
};

export const useToggleRedeemPackageStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleRedeemPackageStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REDEEM_PACKAGES_QUERY_KEY });
    },
  });
};

export const useUpdateRedeemPackageOrderMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, displayOrder }: { id: string; displayOrder: number }) =>
      updateRedeemPackageOrder(id, displayOrder),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REDEEM_PACKAGES_QUERY_KEY });
    },
  });
};

export const useDeleteRedeemPackageMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRedeemPackage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REDEEM_PACKAGES_QUERY_KEY });
    },
  });
};
