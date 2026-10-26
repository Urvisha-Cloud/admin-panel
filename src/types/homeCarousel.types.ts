export type GenderType = "female" | "male";

export interface HomeCarouselImage {
  _id: string;
  imageUrl: string;
  gender: GenderType;
  order: number;
  isActive: boolean;
  title?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CarouselApiResponse<T = HomeCarouselImage[]> {
  success: boolean;
  message?: string;
  count?: number;
  images?: T;
  image?: HomeCarouselImage;
}

export interface CreateCarouselPayload {
  file: File;
  gender: GenderType;
  order?: number;
  isActive?: boolean;
  title?: string;
}

export interface UpdateCarouselPayload {
  id: string;
  file?: File;
  gender?: GenderType;
  order?: number;
  isActive?: boolean;
  title?: string;
}

export interface ReorderCarouselPayload {
  orderedIds: string[];
  gender: GenderType;
}

export interface UserAuth {
  _id: string;
  email: string;
  name?: string;
  role: "admin" | "superAdmin" | "agency" | "user";
  token: string;
}
