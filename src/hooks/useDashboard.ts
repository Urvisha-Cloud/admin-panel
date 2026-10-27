import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "../services/dashboard.service";
import { DashboardData } from "../types/dashboard.types";
import { DASHBOARD_QUERY_KEY } from "../constants";

export const useDashboardQuery = () =>
  useQuery<DashboardData>({
    queryKey: DASHBOARD_QUERY_KEY,
    queryFn: getDashboardStats,
    staleTime: 30000,
  });
