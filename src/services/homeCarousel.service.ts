import apiClient from "../api/client";
import {
  HomeCarouselImage,
  CarouselApiResponse,
  CreateCarouselPayload,
  UpdateCarouselPayload,
  ReorderCarouselPayload,
  GenderType,
} from "../types/homeCarousel.types";

export const getCarouselImages = async (gender?: GenderType): Promise<HomeCarouselImage[]> => {
  const params: Record<string, string> = {};
  if (gender) {
    params.gender = gender;
  }

  const response = await apiClient.get<CarouselApiResponse<HomeCarouselImage[]>>(
    "/admin/home-carousel",
    { params }
  );

  return response.data.images || [];
};

export const createCarouselImage = async (
  payload: CreateCarouselPayload
): Promise<HomeCarouselImage> => {
  const formData = new FormData();
  formData.append("image", payload.file);
  formData.append("gender", payload.gender);
  if (payload.order !== undefined) {
    formData.append("order", String(payload.order));
  }
  if (payload.isActive !== undefined) {
    formData.append("isActive", String(payload.isActive));
  }
  if (payload.title) {
    formData.append("title", payload.title);
  }

  const response = await apiClient.post<CarouselApiResponse>(
    "/admin/home-carousel",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  if (!response.data.image) {
    throw new Error(response.data.message || "Failed to create carousel image");
  }

  return response.data.image;
};

export const updateCarouselImage = async (
  payload: UpdateCarouselPayload
): Promise<HomeCarouselImage> => {
  const formData = new FormData();
  if (payload.file) {
    formData.append("image", payload.file);
  }
  if (payload.gender) {
    formData.append("gender", payload.gender);
  }
  if (payload.order !== undefined) {
    formData.append("order", String(payload.order));
  }
  if (payload.isActive !== undefined) {
    formData.append("isActive", String(payload.isActive));
  }
  if (payload.title !== undefined) {
    formData.append("title", payload.title);
  }

  const response = await apiClient.put<CarouselApiResponse>(
    `/admin/home-carousel/${payload.id}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  if (!response.data.image) {
    throw new Error(response.data.message || "Failed to update carousel image");
  }

  return response.data.image;
};

export const deleteCarouselImage = async (id: string): Promise<void> => {
  await apiClient.delete(`/admin/home-carousel/${id}`);
};

export const reorderCarouselImages = async (
  payload: ReorderCarouselPayload
): Promise<HomeCarouselImage[]> => {
  const response = await apiClient.patch<CarouselApiResponse<HomeCarouselImage[]>>(
    "/admin/home-carousel/reorder",
    payload
  );

  return response.data.images || [];
};

export default {
  getCarouselImages,
  createCarouselImage,
  updateCarouselImage,
  deleteCarouselImage,
  reorderCarouselImages,
};
