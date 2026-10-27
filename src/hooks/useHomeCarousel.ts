import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCarouselImages,
  createCarouselImage,
  updateCarouselImage,
  deleteCarouselImage,
  reorderCarouselImages,
} from "../services/homeCarousel.service";
import {
  GenderType,
  CreateCarouselPayload,
  UpdateCarouselPayload,
  ReorderCarouselPayload,
} from "../types/homeCarousel.types";
import { CAROUSEL_QUERY_KEY } from "../constants";

export const useCarouselImagesQuery = (gender?: GenderType) => {
  return useQuery({
    queryKey: [...CAROUSEL_QUERY_KEY, gender || "all"],
    queryFn: () => getCarouselImages(gender),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useCreateCarouselMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCarouselPayload) => createCarouselImage(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CAROUSEL_QUERY_KEY });
    },
  });
};

export const useUpdateCarouselMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateCarouselPayload) => updateCarouselImage(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CAROUSEL_QUERY_KEY });
    },
  });
};

export const useDeleteCarouselMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCarouselImage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CAROUSEL_QUERY_KEY });
    },
  });
};

export const useReorderCarouselMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ReorderCarouselPayload) => reorderCarouselImages(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CAROUSEL_QUERY_KEY });
    },
  });
};
