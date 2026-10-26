import apiClient from "../api/client";
import { UserAuth } from "../types/homeCarousel.types";

export interface LoginResponse {
  success: boolean;
  message?: string;
  user: {
    // /auth/login sends `id`; /admin/me sends `_id`
    _id?: string;
    id?: string;
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
    _id: user._id ?? user.id ?? "",
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

// Fired after the signed-in admin's own account is edited, so App re-reads the role
export const ADMIN_AUTH_CHANGED_EVENT = "admin-auth-changed";

export const notifyAdminAuthChanged = (): void => {
  window.dispatchEvent(new Event(ADMIN_AUTH_CHANGED_EVENT));
};

/**
 * Re-read the signed-in admin's role from the server and update the saved session.
 * Returns null (and clears the session) when the account is no longer an admin.
 */
export const refreshCurrentAdmin = async (): Promise<UserAuth | null> => {
  const saved = getCurrentAdmin();
  if (!saved) return null;

  try {
    const response = await apiClient.get<LoginResponse>("/admin/me");
    const user = response.data.user;
    if (user.role !== "admin" && user.role !== "superAdmin") {
      logoutAdmin();
      return null;
    }
    // Also back-fills _id for sessions saved before login stored it correctly
    const updated: UserAuth = {
      ...saved,
      _id: user._id ?? user.id ?? saved._id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
    localStorage.setItem("admin_user", JSON.stringify(updated));
    return updated;
  } catch (error: any) {
    // 403 = this account lost admin access; anything else (network, 5xx) keeps the saved session
    if (error?.response?.status === 403) {
      logoutAdmin();
      return null;
    }
    return saved;
  }
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
