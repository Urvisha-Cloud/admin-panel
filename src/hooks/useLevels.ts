import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getLevelConfig,
  getLevelSummary,
  getLevelUsers,
  recalculateLevels,
  saveLevelConfig,
} from "../services/level.service";
import { LEVEL_CONFIG_QUERY_KEY, LEVEL_SUMMARY_QUERY_KEY, LEVEL_USERS_QUERY_KEY } from "../constants";
import { LevelConfig, LevelUsersFilter } from "../types/level.types";

export const useLevelConfigQuery = () =>
  useQuery({
    queryKey: LEVEL_CONFIG_QUERY_KEY,
    queryFn: getLevelConfig,
  });

export const useLevelUsersQuery = (filter: LevelUsersFilter) =>
  useQuery({
    queryKey: [...LEVEL_USERS_QUERY_KEY, filter],
    queryFn: () => getLevelUsers(filter),
    placeholderData: (previousData) => previousData,
  });

export const useLevelSummaryQuery = () =>
  useQuery({
    queryKey: LEVEL_SUMMARY_QUERY_KEY,
    queryFn: getLevelSummary,
  });

const useInvalidateLevels = () => {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: LEVEL_CONFIG_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: LEVEL_USERS_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: LEVEL_SUMMARY_QUERY_KEY });
  };
};

export const useSaveLevelConfigMutation = () => {
  const invalidate = useInvalidateLevels();
  return useMutation({
    mutationFn: (config: LevelConfig) => saveLevelConfig(config),
    onSuccess: invalidate,
  });
};

export const useRecalculateLevelsMutation = () => {
  const invalidate = useInvalidateLevels();
  return useMutation({
    mutationFn: recalculateLevels,
    onSuccess: invalidate,
  });
};
