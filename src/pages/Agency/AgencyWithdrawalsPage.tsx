import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Wallet,
  Building2,
  UserRound,
  Coins,
  ChevronLeft,
  ChevronRight,
  ReceiptText,
} from "lucide-react";
import { useAgencyWithdrawalsQuery } from "../../hooks/useAgencies";
import { PAGE_SIZE } from "../../constants";
interface AgencyWithdrawalsPageProps {
  agencyId: string;
  onBack: () => void;
}

export const formatRupees = (amount: number) =>
  `₹${(Number(amount) || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

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

export const AgencyWithdrawalsPage: React.FC<AgencyWithdrawalsPageProps> = ({ agencyId, onBack }) => {
  const [page, setPage] = useState<number>(1);

  useEffect(() => {
    setPage(1);
  }, [agencyId]);

  const { data, isLoading, isFetching, isError, refetch } = useAgencyWithdrawalsQuery(
    agencyId,
    page,
    PAGE_SIZE
  );

  const summary = data?.summary;
  const members = data?.members ?? [];
  const withdrawals = data?.withdrawals ?? [];
  const pagination = data?.pagination;
  const percentage = data?.agency.percentage ?? 0;
  const rangeStart = pagination && pagination.total > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0;
  const rangeEnd = pagination ? Math.min(pagination.page * pagination.limit, pagination.total) : 0;

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div>
        <button
          type="button"
          onClick={onBack}
          className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-admin-muted hover:text-white transition-colors"
        >
          <ArrowLeft size={14} /> Back to Agencies
        </button>
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[rgba(244,114,182,0.15)] text-admin-primary">
            <Wallet size={18} strokeWidth={2.2} />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            {data?.agency.name ?? "Agency"} · Withdrawals
          </h1>
        </div>
        <p className="mt-1 text-xs text-admin-muted sm:text-sm">
          Member withdrawals and the {percentage}% agency commission on each
        </p>
      </div>

      <div className="space-y-6">
        {isLoading ? (
          <div className="py-16 text-center text-sm text-admin-muted">
            <div className="mb-3 inline-block h-8 w-8 animate-spin rounded-full border-2 border-admin-primary border-t-transparent" />
            <p>Loading withdrawals...</p>
          </div>
        ) : isError ? (
          <div className="py-14 text-center text-sm text-red-400">
            <p>Failed to load withdrawals.</p>
            <button
              onClick={() => refetch()}
              className="mt-3 rounded-admin border border-[rgba(244,114,182,0.2)] bg-admin-surface px-4 py-2 text-xs text-white"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* Summary */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <SummaryTile
                icon={<Building2 size={11} />}
                label="Agency earned"
                value={formatRupees(summary?.agencyAmount ?? 0)}
                hint={`${percentage}% commission`}
                accent="text-admin-primary"
              />
              <SummaryTile
                icon={<UserRound size={11} />}
                label="Paid to members"
                value={formatRupees(summary?.memberAmount ?? 0)}
                accent="text-emerald-400"
              />
              <SummaryTile
                icon={<Wallet size={11} />}
                label="Total withdrawn"
                value={formatRupees(summary?.totalAmount ?? 0)}
                hint={`${summary?.withdrawalCount ?? 0} withdrawals`}
              />
              <SummaryTile
                icon={<Coins size={11} />}
                label="Tokens redeemed"
                value={(summary?.totalTokens ?? 0).toLocaleString("en-IN")}
              />
            </div>

            {withdrawals.length === 0 && page === 1 ? (
              <div className="rounded-admin-md border border-dashed border-[rgba(244,114,182,0.22)] py-12 text-center">
                <ReceiptText size={34} className="mx-auto mb-2 text-admin-primary opacity-40" />
                <p className="text-sm font-semibold text-white">No withdrawals yet</p>
                <p className="mt-1 text-xs text-admin-subtle">
                  When a member of this agency withdraws tokens, it will show up here.
                </p>
              </div>
            ) : (
              <>
                {/* Per-member breakdown */}
                <section>
                  <h3 className="mb-2 text-[0.7rem] font-semibold uppercase tracking-wider text-admin-muted">
                    By member ({members.length})
                  </h3>
                  <div className="overflow-x-auto rounded-admin border border-[rgba(244,114,182,0.12)]">
                    <table className="w-full min-w-[640px] text-left text-xs">
                      <thead className="bg-admin-surface/60 text-[0.65rem] uppercase tracking-wider text-admin-muted">
                        <tr>
                          <th className="px-4 py-2.5 font-medium">Member</th>
                          <th className="px-4 py-2.5 text-right font-medium">Withdrawals</th>
                          <th className="px-4 py-2.5 text-right font-medium">Tokens</th>
                          <th className="px-4 py-2.5 text-right font-medium">Total</th>
                          <th className="px-4 py-2.5 text-right font-medium">Member got</th>
                          <th className="px-4 py-2.5 text-right font-medium">Agency got</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[rgba(244,114,182,0.08)]">
                        {members.map((member) => (
                          <tr key={member.userId ?? member.email} className="text-white/90">
                            <td className="px-4 py-2.5">
                              <p className="font-medium text-white">{member.email || "Deleted user"}</p>
                              {member.name && <p className="text-[0.68rem] text-admin-muted">{member.name}</p>}
                            </td>
                            <td className="px-4 py-2.5 text-right">{member.withdrawalCount}</td>
                            <td className="px-4 py-2.5 text-right">{member.totalTokens.toLocaleString("en-IN")}</td>
                            <td className="px-4 py-2.5 text-right">{formatRupees(member.totalAmount)}</td>
                            <td className="px-4 py-2.5 text-right font-semibold text-emerald-400">
                              {formatRupees(member.memberAmount)}
                            </td>
                            <td className="px-4 py-2.5 text-right font-semibold text-admin-primary">
                              {formatRupees(member.agencyAmount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                {/* Every withdrawal */}
                <section>
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-[0.7rem] font-semibold uppercase tracking-wider text-admin-muted">
                      All withdrawals ({pagination?.total ?? withdrawals.length})
                    </h3>
                    {isFetching && <span className="text-[0.68rem] text-admin-muted">Updating...</span>}
                  </div>
                  <div className="overflow-hidden rounded-admin border border-[rgba(244,114,182,0.12)]">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[820px] text-left text-xs">
                      <thead className="bg-admin-surface/60 text-[0.65rem] uppercase tracking-wider text-admin-muted">
                        <tr>
                          <th className="px-4 py-2.5 font-medium">Date</th>
                          <th className="px-4 py-2.5 font-medium">Member</th>
                          <th className="px-4 py-2.5 text-right font-medium">Tokens</th>
                          <th className="px-4 py-2.5 text-right font-medium">Rate</th>
                          <th className="px-4 py-2.5 text-right font-medium">Total</th>
                          <th className="px-4 py-2.5 text-right font-medium">Agency Commission</th>
                          <th className="px-4 py-2.5 text-right font-medium">Member got</th>
                          <th className="px-4 py-2.5 text-right font-medium">Agency got</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[rgba(244,114,182,0.08)]">
                        {withdrawals.map((item) => (
                          <tr key={item.id} className="text-white/90">
                            <td className="whitespace-nowrap px-4 py-2.5 text-admin-muted">
                              {formatDateTime(item.createdAt)}
                            </td>
                            <td className="px-4 py-2.5">
                              <p className="font-medium text-white">{item.email || "Deleted user"}</p>
                            </td>
                            <td className="px-4 py-2.5 text-right">{item.tokens.toLocaleString("en-IN")}</td>
                            <td className="whitespace-nowrap px-4 py-2.5 text-right text-admin-muted">
                              1 token = {formatRupees(item.baseRate)}
                            </td>
                            <td className="px-4 py-2.5 text-right">{formatRupees(item.totalAmount)}</td>
                            <td className="px-4 py-2.5 text-right text-admin-muted">{item.agencyPercent}%</td>
                            <td className="px-4 py-2.5 text-right font-semibold text-emerald-400">
                              {formatRupees(item.memberAmount)}
                            </td>
                            <td className="px-4 py-2.5 text-right font-semibold text-admin-primary">
                              {formatRupees(item.agencyAmount)}
                            </td>
                          </tr>
                        ))}
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
                          onClick={() => setPage((p) => p - 1)}
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
                          onClick={() => setPage((p) => p + 1)}
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
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AgencyWithdrawalsPage;
