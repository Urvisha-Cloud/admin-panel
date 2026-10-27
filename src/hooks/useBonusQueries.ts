import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getWeeklyBonuses,
  getWeeklyBonusById,
  createWeeklyBonus,
  updateWeeklyBonus,
  deleteWeeklyBonus,
  uploadBonusImage,
} from "../services/bonus.service";
import {
  CreateWeeklyBonusPayload,
  UpdateWeeklyBonusPayload,
} from "../types/bonus.types";
import { WEEKLY_BONUS_QUERY_KEY } from "../constants";

export const useWeeklyBonusesQuery = () =>
  useQuery({
    queryKey: WEEKLY_BONUS_QUERY_KEY,
    queryFn: getWeeklyBonuses,
  });

export const useWeeklyBonusByIdQuery = (id?: string) =>
  useQuery({
    queryKey: [...WEEKLY_BONUS_QUERY_KEY, id],
    queryFn: () => (id ? getWeeklyBonusById(id) : Promise.reject("No ID provided")),
    enabled: Boolean(id),
  });

export const useCreateWeeklyBonusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateWeeklyBonusPayload) => createWeeklyBonus(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: WEEKLY_BONUS_QUERY_KEY }),
  });
};

export const useUpdateWeeklyBonusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateWeeklyBonusPayload }) =>
      updateWeeklyBonus(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: WEEKLY_BONUS_QUERY_KEY }),
  });
};

export const useDeleteWeeklyBonusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteWeeklyBonus(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: WEEKLY_BONUS_QUERY_KEY }),
  });
};

export const useUploadBonusImageMutation = () => {
  return useMutation({
    mutationFn: (file: File) => uploadBonusImage(file),
  });
};
