import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "../services/dashboard.service";
import { DashboardData } from "../types/dashboard.types";

export const DASHBOARD_QUERY_KEY = ["admin-dashboard"];

export const useDashboardQuery = () =>
  useQuery<DashboardData>({
    queryKey: DASHBOARD_QUERY_KEY,
    queryFn: getDashboardStats,
    staleTime: 30000,
  });
