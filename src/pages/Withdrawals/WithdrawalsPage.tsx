import React, { useEffect, useState } from "react";
import {
  Wallet,
  UserRound,
  Building2,
  Clock3,
  Search,
  RefreshCw,
  ReceiptText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Dropdown from "../../components/common/Dropdown";
import { useWithdrawalsQuery } from "../../hooks/useWithdrawals";
import { formatRupees } from "../Agency/AgencyWithdrawalsPage";
import { PAGE_SIZE, SEARCH_DEBOUNCE_MS } from "../../constants";
import { WithdrawalFilters, WithdrawalStatus } from "../../types/withdrawal.types";

const typeOptions = [
  { value: "all", label: "All Users" },
  { value: "direct", label: "Normal Users" },
  { value: "agency", label: "Agency Members" },
];

const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "paid", label: "Completed" },
  { value: "processing", label: "Processing" },
  { value: "failed", label: "Failed · Refunded" },
];

const STATUS_STYLES: Record<WithdrawalStatus, { label: string; className: string }> = {
  paid: { label: "Completed", className: "border-emerald-400/40 text-emerald-400" },
  processing: { label: "Processing", className: "border-amber-400/40 text-amber-400" },
  pending: { label: "Pending", className: "border-amber-400/40 text-amber-400" },
  failed: { label: "Failed · Refunded", className: "border-red-400/40 text-red-400" },
  rejected: { label: "Rejected", className: "border-red-400/40 text-red-400" },
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

export const WithdrawalsPage: React.FC = () => {
  const [filters, setFilters] = useState<WithdrawalFilters>({
    page: 1,
    limit: PAGE_SIZE,
    status: "all",
    type: "all",
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

  const updateFilter = <K extends keyof WithdrawalFilters>(key: K, value: WithdrawalFilters[K]) =>
    setFilters((prev) => ({ ...prev, [key]: value, page: key === "page" ? (value as number) : 1 }));

  const { data, isLoading, isFetching, isError, refetch } = useWithdrawalsQuery(filters);

  const summary = data?.summary;
  const withdrawals = data?.withdrawals ?? [];
  const pagination = data?.pagination;
  const rangeStart = pagination && pagination.total > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0;
  const rangeEnd = pagination ? Math.min(pagination.page * pagination.limit, pagination.total) : 0;
  const hasFilters = filters.search || filters.status !== "all" || filters.type !== "all";

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div>
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[rgba(244,114,182,0.15)] text-admin-primary">
            <Wallet size={18} strokeWidth={2.2} />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">Withdrawals</h1>
        </div>
        <p className="mt-1 text-xs text-admin-muted sm:text-sm">
          Every token withdrawal — normal users and agency members — with its RazorpayX payout status
        </p>
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-subtle" />
          <input
            type="text"
            placeholder="Search by user name or email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full rounded-admin border border-[rgba(244,114,182,0.16)] bg-admin-card py-2.5 pl-9 pr-3 text-xs text-white outline-none placeholder:text-admin-subtle focus:border-admin-primary sm:text-sm transition-colors"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="w-full sm:w-44">
            <Dropdown
              value={filters.type}
              onChange={(val) => updateFilter("type", val as WithdrawalFilters["type"])}
              options={typeOptions}
            />
          </div>
          <div className="w-full sm:w-44">
            <Dropdown
              value={filters.status}
              onChange={(val) => updateFilter("status", val as WithdrawalFilters["status"])}
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
          <p>Loading withdrawals...</p>
        </div>
      ) : isError ? (
        <div className="rounded-admin-md border border-red-500/20 bg-admin-card py-14 text-center text-sm text-red-400">
          <p>Failed to load withdrawals. Please verify your Super Admin session.</p>
          <button
            onClick={() => refetch()}
            className="mt-3 rounded-admin border border-[rgba(244,114,182,0.2)] bg-admin-surface px-4 py-2 text-xs text-white"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* Summary — money totals count completed payouts only */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <SummaryTile
              icon={<Wallet size={11} />}
              label="Total paid out"
              value={formatRupees(summary?.totalAmount ?? 0)}
              hint={`${summary?.paidCount ?? 0} completed · ${(summary?.paidTokens ?? 0).toLocaleString("en-IN")} tokens`}
            />
            <SummaryTile
              icon={<UserRound size={11} />}
              label="Paid to users"
              value={formatRupees(summary?.memberAmount ?? 0)}
              accent="text-emerald-400"
            />
            <SummaryTile
              icon={<Building2 size={11} />}
              label="Agency commission"
              value={formatRupees(summary?.agencyAmount ?? 0)}
              accent="text-admin-primary"
            />
            <SummaryTile
              icon={<Clock3 size={11} />}
              label="Processing / Failed"
              value={`${summary?.processingCount ?? 0} / ${summary?.failedCount ?? 0}`}
              hint="Failed payouts are refunded"
              accent="text-amber-400"
            />
          </div>

          {withdrawals.length === 0 ? (
            <div className="rounded-admin-md border border-dashed border-[rgba(244,114,182,0.22)] py-12 text-center">
              <ReceiptText size={34} className="mx-auto mb-2 text-admin-primary opacity-40" />
              <p className="text-sm font-semibold text-white">No withdrawals found</p>
              <p className="mt-1 text-xs text-admin-subtle">
                {hasFilters
                  ? "Try clearing your filters to see more results."
                  : "When a user withdraws tokens, it will show up here."}
              </p>
            </div>
          ) : (
            <section>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-[0.7rem] font-semibold uppercase tracking-wider text-admin-muted">
                  All withdrawals ({pagination?.total ?? withdrawals.length})
                </h3>
                {isFetching && <span className="text-[0.68rem] text-admin-muted">Updating...</span>}
              </div>
              <div className="overflow-hidden rounded-admin border border-[rgba(244,114,182,0.12)]">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1080px] text-left text-xs">
                    <thead className="bg-admin-surface/60 text-[0.65rem] uppercase tracking-wider text-admin-muted">
                      <tr>
                        <th className="px-4 py-2.5 font-medium">Date</th>
                        <th className="px-4 py-2.5 font-medium">User</th>
                        <th className="px-4 py-2.5 font-medium">Type</th>
                        <th className="px-4 py-2.5 text-right font-medium">Tokens</th>
                        <th className="px-4 py-2.5 text-right font-medium">Rate</th>
                        <th className="px-4 py-2.5 text-right font-medium">User got</th>
                        <th className="px-4 py-2.5 text-right font-medium">Agency got</th>
                        <th className="px-4 py-2.5 font-medium">Paid to</th>
                        <th className="px-4 py-2.5 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[rgba(244,114,182,0.08)]">
                      {withdrawals.map((item) => {
                        const status = STATUS_STYLES[item.status] ?? STATUS_STYLES.paid;
                        return (
                          <tr key={item.id} className="align-top text-white/90">
                            <td className="whitespace-nowrap px-4 py-2.5 text-admin-muted">
                              {formatDateTime(item.createdAt)}
                            </td>
                            <td className="px-4 py-2.5">
                              <p className="font-medium text-white">{item.email || "Deleted user"}</p>
                              {item.name && <p className="text-[0.68rem] text-admin-muted">{item.name}</p>}
                            </td>
                            <td className="px-4 py-2.5">
                              {item.agencyId ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(244,114,182,0.12)] px-2 py-0.5 text-[0.68rem] font-semibold text-admin-primary">
                                  <Building2 size={10} /> {item.agencyName || "Agency"} · {item.agencyPercent}%
                                </span>
                              ) : (
                                <span className="inline-flex rounded-full bg-white/5 px-2 py-0.5 text-[0.68rem] font-semibold text-admin-muted">
                                  Normal
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-2.5 text-right">{item.tokens.toLocaleString("en-IN")}</td>
                            <td className="whitespace-nowrap px-4 py-2.5 text-right text-admin-muted">
                              1 token = {formatRupees(item.baseRate)}
                            </td>
                            <td className="px-4 py-2.5 text-right font-semibold text-emerald-400">
                              {formatRupees(item.memberAmount)}
                            </td>
                            <td className="px-4 py-2.5 text-right font-semibold text-admin-primary">
                              {item.agencyId ? formatRupees(item.agencyAmount) : "-"}
                            </td>
                            <td className="px-4 py-2.5">
                              <p className="whitespace-nowrap text-white">{item.payoutDestination || "-"}</p>
                              {item.payoutRef && (
                                <p className="text-[0.68rem] text-admin-muted">UTR {item.payoutRef}</p>
                              )}
                            </td>
                            <td className="px-4 py-2.5">
                              <span
                                className={`inline-flex whitespace-nowrap rounded-full border px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide ${status.className}`}
                              >
                                {status.label}
                              </span>
                              {item.status === "failed" && item.failureReason && (
                                <p className="mt-1 max-w-[180px] text-[0.68rem] text-red-400/80">{item.failureReason}</p>
                              )}
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
                      <span className="font-semibold text-white">{pagination.total}</span> withdrawals
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

export default WithdrawalsPage;
