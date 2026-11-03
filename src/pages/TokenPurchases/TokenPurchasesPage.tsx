import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  ShoppingBag,
  Coins,
  CheckCircle2,
  Clock3,
  Search,
  RefreshCw,
  ReceiptText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Dropdown from "../../components/common/Dropdown";
import { useTokenPurchasesQuery } from "../../hooks/useTokenPurchases";
import { PAGE_SIZE, SEARCH_DEBOUNCE_MS } from "../../constants";
import { TokenPurchaseFilters, TokenPurchaseStatus } from "../../types/tokenPurchase.types";

const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "cancelled", label: "Cancelled" },
];

const STATUS_STYLES: Record<TokenPurchaseStatus, { label: string; className: string }> = {
  paid: { label: "Paid", className: "border-emerald-400/40 text-emerald-400" },
  pending: { label: "Pending", className: "border-amber-400/40 text-amber-400" },
  cancelled: { label: "Cancelled", className: "border-white/20 text-admin-muted" },
  failed: { label: "Failed", className: "border-red-400/40 text-red-400" },
};

const CURRENCY_SYMBOLS: Record<string, string> = { USD: "$", INR: "₹" };

const formatMoney = (amount: number, currency: string) => {
  const value = (Number(amount) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return CURRENCY_SYMBOLS[currency] ? `${CURRENCY_SYMBOLS[currency]}${value}` : `${currency} ${value}`;
};

const formatDateTime = (dateStr: string | null) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const SummaryTile: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
  accent?: string;
}> = ({ icon, label, value, hint, accent = "text-white" }) => (
  <div className="rounded-admin border border-[rgba(244,114,182,0.14)] bg-admin-surface/60 px-4 py-3">
    <p className="flex items-center gap-1.5 text-[0.65rem] font-medium uppercase tracking-wider text-admin-muted">
      {icon} {label}
    </p>
    <p className={`mt-1 text-base font-bold ${accent}`}>{value}</p>
    {hint && <p className="mt-0.5 text-[0.68rem] text-admin-muted">{hint}</p>}
  </div>
);

interface TokenPurchasesPageProps {
  onBack: () => void;
}

export const TokenPurchasesPage: React.FC<TokenPurchasesPageProps> = ({ onBack }) => {
  const [filters, setFilters] = useState<TokenPurchaseFilters>({
    page: 1,
    limit: PAGE_SIZE,
    status: "all",
    search: "",
  });
  const [searchInput, setSearchInput] = useState("");

  // Search waits for typing to pause, then restarts from page 1
  useEffect(() => {
    const timer = setTimeout(
      () => setFilters((prev) => (prev.search === searchInput.trim() ? prev : { ...prev, search: searchInput.trim(), page: 1 })),
      SEARCH_DEBOUNCE_MS
    );
    return () => clearTimeout(timer);
  }, [searchInput]);

  const updateFilter = <K extends keyof TokenPurchaseFilters>(key: K, value: TokenPurchaseFilters[K]) =>
    setFilters((prev) => ({ ...prev, [key]: value, page: key === "page" ? (value as number) : 1 }));

  const { data, isLoading, isFetching, isError, refetch } = useTokenPurchasesQuery(filters);

  const summary = data?.summary;
  const purchases = data?.purchases ?? [];
  const pagination = data?.pagination;
  const rangeStart = pagination && pagination.total > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0;
  const rangeEnd = pagination ? Math.min(pagination.page * pagination.limit, pagination.total) : 0;
  const hasFilters = filters.search || filters.status !== "all";
  const revenue = summary?.revenue ?? [];

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div>
        <button
          type="button"
          onClick={onBack}
          className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-admin-muted hover:text-white transition-colors"
        >
          <ArrowLeft size={14} /> Back to Token Packages
        </button>
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[rgba(244,114,182,0.15)] text-admin-primary">
            <ShoppingBag size={18} strokeWidth={2.2} />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">Token Purchases</h1>
        </div>
        <p className="mt-1 text-xs text-admin-muted sm:text-sm">
          Token packages users bought, with their Razorpay order and payment ids
        </p>
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-subtle" />
          <input
            type="text"
            placeholder="Search by user name, email, order_ or pay_ id..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full rounded-admin border border-[rgba(244,114,182,0.16)] bg-admin-card py-2.5 pl-9 pr-3 text-xs text-white outline-none placeholder:text-admin-subtle focus:border-admin-primary sm:text-sm transition-colors"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="w-full sm:w-44">
            <Dropdown
              value={filters.status}
              onChange={(val) => updateFilter("status", val as TokenPurchaseFilters["status"])}
              options={statusOptions}
            />
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            title="Refresh"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-admin border border-[rgba(244,114,182,0.16)] bg-admin-card text-admin-muted hover:text-white transition-colors"
          >
            <RefreshCw size={15} className={isFetching ? "animate-spin text-admin-primary" : ""} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-sm text-admin-muted">
          <div className="mb-3 inline-block h-8 w-8 animate-spin rounded-full border-2 border-admin-primary border-t-transparent" />
          <p>Loading purchases...</p>
        </div>
      ) : isError ? (
        <div className="rounded-admin-md border border-red-500/20 bg-admin-card py-14 text-center text-sm text-red-400">
          <p>Failed to load token purchases.</p>
          <button
            onClick={() => refetch()}
            className="mt-3 rounded-admin border border-[rgba(244,114,182,0.2)] bg-admin-surface px-4 py-2 text-xs text-white"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* Summary — revenue counts paid purchases only, one line per currency */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <SummaryTile
              icon={<ShoppingBag size={11} />}
              label="Revenue"
              value={revenue.length ? revenue.map((r) => formatMoney(r.amount, r.currency)).join(" + ") : formatMoney(0, "USD")}
              hint={`${summary?.paidCount ?? 0} paid purchases`}
              accent="text-emerald-400"
            />
            <SummaryTile
              icon={<Coins size={11} />}
              label="Tokens sold"
              value={(summary?.paidTokens ?? 0).toLocaleString("en-IN")}
              accent="text-yellow-200"
            />
            <SummaryTile
              icon={<CheckCircle2 size={11} />}
              label="All purchases"
              value={(summary?.purchaseCount ?? 0).toLocaleString("en-IN")}
              hint={`${summary?.paidCount ?? 0} paid`}
            />
            <SummaryTile
              icon={<Clock3 size={11} />}
              label="Pending / Cancelled"
              value={`${summary?.pendingCount ?? 0} / ${summary?.cancelledCount ?? 0}`}
              hint="Checkout not completed"
              accent="text-amber-400"
            />
          </div>

          {purchases.length === 0 ? (
            <div className="rounded-admin-md border border-dashed border-[rgba(244,114,182,0.22)] py-12 text-center">
              <ReceiptText size={34} className="mx-auto mb-2 text-admin-primary opacity-40" />
              <p className="text-sm font-semibold text-white">No purchases found</p>
              <p className="mt-1 text-xs text-admin-subtle">
                {hasFilters
                  ? "Try clearing your filters to see more results."
                  : "When a user buys a token package, it will show up here."}
              </p>
            </div>
          ) : (
            <section>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-[0.7rem] font-semibold uppercase tracking-wider text-admin-muted">
                  All purchases ({pagination?.total ?? purchases.length})
                </h3>
                {isFetching && <span className="text-[0.68rem] text-admin-muted">Updating...</span>}
              </div>
              <div className="overflow-hidden rounded-admin border border-[rgba(244,114,182,0.12)]">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1000px] text-left text-xs">
                    <thead className="bg-admin-surface/60 text-[0.65rem] uppercase tracking-wider text-admin-muted">
                      <tr>
                        <th className="px-4 py-2.5 font-medium">Date</th>
                        <th className="px-4 py-2.5 font-medium">User</th>
                        <th className="px-4 py-2.5 text-right font-medium">Tokens</th>
                        <th className="px-4 py-2.5 text-right font-medium">Price</th>
                        <th className="px-4 py-2.5 text-right font-medium">Discount</th>
                        <th className="px-4 py-2.5 text-right font-medium">Paid</th>
                        <th className="px-4 py-2.5 font-medium">Razorpay</th>
                        <th className="px-4 py-2.5 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[rgba(244,114,182,0.08)]">
                      {purchases.map((item) => {
                        const status = STATUS_STYLES[item.status] ?? STATUS_STYLES.pending;
                        return (
                          <tr key={item.id} className="align-top text-white/90">
                            <td className="whitespace-nowrap px-4 py-2.5 text-admin-muted">
                              {formatDateTime(item.createdAt)}
                            </td>
                            <td className="px-4 py-2.5">
                              <p className="font-medium text-white">{item.email || "Deleted user"}</p>
                              {item.name && <p className="text-[0.68rem] text-admin-muted">{item.name}</p>}
                            </td>
                            <td className="px-4 py-2.5 text-right font-semibold text-yellow-200">
                              {item.tokens.toLocaleString("en-IN")}
                            </td>
                            <td className="whitespace-nowrap px-4 py-2.5 text-right text-admin-muted">
                              {formatMoney(item.originalPrice, item.currency)}
                            </td>
                            <td className="px-4 py-2.5 text-right text-admin-muted">
                              {item.discountPercentage > 0 ? `${item.discountPercentage}%` : "-"}
                            </td>
                            <td className="whitespace-nowrap px-4 py-2.5 text-right font-semibold text-emerald-400">
                              {formatMoney(item.price, item.currency)}
                            </td>
                            <td className="px-4 py-2.5 font-mono text-[0.68rem]">
                              {item.paymentProvider ? (
                                <>
                                  <p className="text-white">{item.paymentId || "-"}</p>
                                  <p className="text-admin-muted">{item.orderId}</p>
                                </>
                              ) : (
                                <span className="font-sans text-admin-muted">Before Razorpay</span>
                              )}
                            </td>
                            <td className="px-4 py-2.5">
                              <span
                                className={`inline-flex whitespace-nowrap rounded-full border px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide ${status.className}`}
                              >
                                {status.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* ── Pagination Footer ── */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex flex-col items-center justify-between gap-3 border-t border-[rgba(244,114,182,0.15)] px-5 py-3.5 sm:flex-row">
                    <p className="text-[0.8rem] text-admin-muted">
                      Showing <span className="font-semibold text-white">{rangeStart}</span> to{" "}
                      <span className="font-semibold text-white">{rangeEnd}</span> of{" "}
                      <span className="font-semibold text-white">{pagination.total}</span> purchases
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateFilter("page", filters.page - 1)}
                        disabled={pagination.page <= 1}
                        className="flex h-8 items-center gap-1 rounded-admin border border-[rgba(244,114,182,0.2)] bg-admin-surface px-3 text-[0.8rem] font-medium text-admin-muted transition-colors hover:bg-admin-surface/80 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ChevronLeft size={14} /> Previous
                      </button>

                      <span className="px-2 text-[0.8rem] font-semibold text-admin-primary">
                        Page {pagination.page} of {pagination.totalPages}
                      </span>

                      <button
                        type="button"
                        onClick={() => updateFilter("page", filters.page + 1)}
                        disabled={pagination.page >= pagination.totalPages}
                        className="flex h-8 items-center gap-1 rounded-admin border border-[rgba(244,114,182,0.2)] bg-admin-surface px-3 text-[0.8rem] font-medium text-admin-muted transition-colors hover:bg-admin-surface/80 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Next <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default TokenPurchasesPage;
