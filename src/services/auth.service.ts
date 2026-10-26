import apiClient from "../api/client";
import { UserAuth } from "../types/homeCarousel.types";

export interface LoginResponse {
  success: boolean;
  message?: string;
  user: {
    _id: string;
    email: string;
    name?: string;
    role: "admin" | "superAdmin" | "agency" | "user";
  };
  token: string;
}

export const loginAdmin = async (email: string, password: string): Promise<UserAuth> => {
  const response = await apiClient.post<LoginResponse>("/auth/login", {
    email,
    password,
  });

  if (!response.data.success || !response.data.token) {
    throw new Error(response.data.message || "Login failed");
  }

  const { user, token } = response.data;

  if (user.role !== "admin" && user.role !== "superAdmin") {
    throw new Error("Access denied. Admin or Super Admin privileges required.");
  }

  const authData: UserAuth = {
    _id: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
    token,
  };

  localStorage.setItem("admin_token", token);
  localStorage.setItem("admin_user", JSON.stringify(authData));

  return authData;
};

export const logoutAdmin = (): void => {
  localStorage.removeItem("admin_token");
  localStorage.removeItem("admin_user");
};

export const getCurrentAdmin = (): UserAuth | null => {
  const userStr = localStorage.getItem("admin_user");
  const token = localStorage.getItem("admin_token");
  if (!userStr || !token) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};
