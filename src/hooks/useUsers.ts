import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteUser,
  getUsers,
  reviewUserVerification,
  updateUser,
} from "../services/user.service";
import {
  ReviewVerificationPayload,
  UpdateUserPayload,
  UserListFilters,
} from "../types/user.types";

export const USERS_QUERY_KEY = ["admin-users"];

export const useUsersQuery = (filters: UserListFilters) =>
  useQuery({
    queryKey: [...USERS_QUERY_KEY, filters],
    queryFn: () => getUsers(filters),
    placeholderData: (previousData) => previousData,
  });

export const useUpdateUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) => updateUser(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY }),
  });
};

export const useDeleteUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY }),
  });
};

export const useReviewUserVerificationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ReviewVerificationPayload }) =>
      reviewUserVerification(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY }),
  });
};
