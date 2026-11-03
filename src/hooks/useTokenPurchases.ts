import { useQuery } from "@tanstack/react-query";
import { getTokenPurchases } from "../services/tokenPurchase.service";
import { TokenPurchaseFilters } from "../types/tokenPurchase.types";
import { TOKEN_PURCHASES_QUERY_KEY } from "../constants";

export const useTokenPurchasesQuery = (filters: TokenPurchaseFilters) =>
  useQuery({
    queryKey: [...TOKEN_PURCHASES_QUERY_KEY, filters],
    queryFn: () => getTokenPurchases(filters),
    placeholderData: (previousData) => previousData,
  });
