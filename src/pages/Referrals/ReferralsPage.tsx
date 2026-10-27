import React, { useEffect, useState } from "react";
import {
  Share2,
  Trophy,
  History,
  Users,
  UserPlus,
  ShoppingBag,
  Coins,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import { useReferralsQuery, useTopReferrersQuery } from "../../hooks/useReferrals";
import { ReferralItem, ReferralPerson } from "../../types/referral.types";
import { ReferredUsersModal } from "./ReferredUsersModal";
import { PAGE_SIZE, TOP_REFERRERS_LIMIT } from "../../constants";

export const formatDateTime = (dateStr: string | null) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// "+10 Joined" / "+100 Purchased" chips for one referral
export const RewardBadges: React.FC<{ item: ReferralItem }> = ({ item }) => (
  <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
    <span
      className={`rounded-full px-2 py-0.5 text-[0.65rem] font-semibold ${
        item.signupRewardedAt ? "bg-emerald-400/15 text-emerald-400" : "bg-white/5 text-admin-muted"
      }`}
    >
      {item.signupRewardedAt ? `+${item.signupTokens} Joined` : "Not verified"}
    </span>
    <span
      className={`rounded-full px-2 py-0.5 text-[0.65rem] font-semibold ${
        item.purchaseRewardedAt ? "bg-admin-primary/15 text-admin-primary" : "bg-white/5 text-admin-muted"
      }`}
    >
      {item.purchaseRewardedAt ? `+${item.purchaseTokens} Purchased` : "No purchase yet"}
    </span>
  </div>
);

const PersonCell: React.FC<{ person: ReferralPerson | null }> = ({ person }) =>
  person ? (
    <>
      <p className="font-medium text-white">{person.name}</p>
      <p className="text-[0.68rem] text-admin-muted">{person.email}</p>
    </>
  ) : (
    <p className="italic text-admin-muted">Deleted user</p>
  );

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

const RANK_STYLES = ["text-amber-300", "text-slate-300", "text-orange-400"];

export const ReferralsPage: React.FC = () => {
  const [page, setPage] = useState<number>(1);
  const [searchInput, setSearchInput] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [selectedInviterId, setSelectedInviterId] = useState<string | null>(null);

  // Debounce the search box
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading, isFetching, isError, refetch } = useReferralsQuery(page, PAGE_SIZE, search);
  const topQuery = useTopReferrersQuery(TOP_REFERRERS_LIMIT);

  const summary = data?.data.summary;
  const referrals = data?.data.referrals ?? [];
  const pagination = data?.data.pagination;
  const topReferrers = topQuery.data?.data ?? [];
  const rangeStart = pagination && pagination.total > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0;
  const rangeEnd = pagination ? Math.min(pagination.page * pagination.limit, pagination.total) : 0;

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div>
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[rgba(244,114,182,0.15)] text-admin-primary">
            <Share2 size={18} strokeWidth={2.2} />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">Referrals</h1>
        </div>
        <p className="mt-1 text-xs text-admin-muted sm:text-sm">
          Who invited whom with an invitation code, and the tokens paid to referrers
        </p>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-sm text-admin-muted">
          <div className="mb-3 inline-block h-8 w-8 animate-spin rounded-full border-2 border-admin-primary border-t-transparent" />
          <p>Loading referrals...</p>
        </div>
      ) : isError ? (
        <div className="py-14 text-center text-sm text-red-400">
          <p>Failed to load referrals.</p>
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
              icon={<UserPlus size={11} />}
              label="Total referrals"
              value={(summary?.totalReferrals ?? 0).toLocaleString("en-IN")}
              hint={`${summary?.inviterCount ?? 0} referrers`}
            />
            <SummaryTile
              icon={<Users size={11} />}
              label="Joined (+10 paid)"
              value={(summary?.signupRewarded ?? 0).toLocaleString("en-IN")}
              accent="text-emerald-400"
            />
            <SummaryTile
              icon={<ShoppingBag size={11} />}
              label="First purchase (+100 paid)"
              value={(summary?.purchaseRewarded ?? 0).toLocaleString("en-IN")}
              accent="text-admin-primary"
            />
            <SummaryTile
              icon={<Coins size={11} />}
              label="Tokens paid"
              value={(summary?.tokensPaid ?? 0).toLocaleString("en-IN")}
              hint="to referrers"
            />
          </div>

          {/* ── Top referrers ── */}
          <section>
            <h3 className="mb-2 flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-wider text-admin-muted">
              <Trophy size={12} /> Top referrers
            </h3>
            <div className="overflow-x-auto rounded-admin border border-[rgba(244,114,182,0.12)]">
              <table className="w-full min-w-[720px] text-left text-xs">
                <thead className="bg-admin-surface/60 text-[0.65rem] uppercase tracking-wider text-admin-muted">
                  <tr>
                    <th className="w-14 px-4 py-2.5 font-medium">Rank</th>
                    <th className="px-4 py-2.5 font-medium">Referrer</th>
                    <th className="px-4 py-2.5 font-medium">Code</th>
                    <th className="px-4 py-2.5 text-right font-medium">Invited</th>
                    <th className="px-4 py-2.5 text-right font-medium">Purchased</th>
                    <th className="px-4 py-2.5 text-right font-medium">Tokens earned</th>
                    <th className="px-4 py-2.5 text-right font-medium">Users</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(244,114,182,0.08)]">
                  {topQuery.isLoading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-6 text-center text-admin-muted">Loading...</td>
                    </tr>
                  ) : topReferrers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-6 text-center text-admin-muted">No referrals yet.</td>
                    </tr>
                  ) : (
                    topReferrers.map((row) => (
                      <tr key={row.inviter?.id ?? row.rank} className="text-white/90">
                        <td className={`px-4 py-2.5 text-sm font-bold ${RANK_STYLES[row.rank - 1] ?? "text-admin-muted"}`}>
                          #{row.rank}
                        </td>
                        <td className="px-4 py-2.5">
                          <PersonCell person={row.inviter} />
                        </td>
                        <td className="px-4 py-2.5 font-semibold tracking-wider text-admin-primary">
                          {row.inviter?.referralCode || "—"}
                        </td>
                        <td className="px-4 py-2.5 text-right font-semibold">{row.invitedCount}</td>
                        <td className="px-4 py-2.5 text-right text-emerald-400">{row.purchasedCount}</td>
                        <td className="px-4 py-2.5 text-right font-semibold text-admin-primary">
                          {row.earnedTokens.toLocaleString("en-IN")}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <button
                            type="button"
                            disabled={!row.inviter}
                            onClick={() => row.inviter && setSelectedInviterId(row.inviter.id)}
                            title="View referred users"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-admin border border-[rgba(244,114,182,0.2)] bg-admin-surface text-admin-primary transition-colors hover:bg-[rgba(244,114,182,0.15)] disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Eye size={15} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* ── Referral history ── */}
          <section>
            <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-wider text-admin-muted">
                <History size={12} /> Referral history ({pagination?.total ?? referrals.length})
                {isFetching && <span className="ml-2 normal-case tracking-normal">Updating...</span>}
              </h3>
              <div className="relative w-full sm:w-72">
                <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-admin-muted" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search code, name or email"
                  className="h-9 w-full rounded-admin border border-[rgba(244,114,182,0.2)] bg-admin-surface pl-9 pr-3 text-xs text-white placeholder:text-admin-muted focus:border-admin-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="overflow-hidden rounded-admin border border-[rgba(244,114,182,0.12)]">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-xs">
                  <thead className="bg-admin-surface/60 text-[0.65rem] uppercase tracking-wider text-admin-muted">
                    <tr>
                      <th className="px-4 py-2.5 font-medium">Date</th>
                      <th className="px-4 py-2.5 font-medium">Referrer</th>
                      <th className="px-4 py-2.5 font-medium">Code</th>
                      <th className="px-4 py-2.5 font-medium">New user</th>
                      <th className="px-4 py-2.5 text-right font-medium">Rewards</th>
                      <th className="px-4 py-2.5 text-right font-medium">Tokens</th>
                      <th className="px-4 py-2.5 text-right font-medium">Users</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(244,114,182,0.08)]">
                    {referrals.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-10 text-center text-admin-muted">
                          {search ? "No referrals match your search." : "No referrals yet."}
                        </td>
                      </tr>
                    ) : (
                      referrals.map((item) => (
                        <tr key={item.id} className="text-white/90">
                          <td className="whitespace-nowrap px-4 py-2.5 text-admin-muted">
                            {formatDateTime(item.createdAt)}
                          </td>
                          <td className="px-4 py-2.5">
                            <PersonCell person={item.inviter} />
                          </td>
                          <td className="px-4 py-2.5 font-semibold tracking-wider text-admin-primary">{item.code}</td>
                          <td className="px-4 py-2.5">
                            <PersonCell person={item.invitee} />
                          </td>
                          <td className="px-4 py-2.5">
                            <RewardBadges item={item} />
                          </td>
                          <td className="px-4 py-2.5 text-right font-semibold text-admin-primary">
                            {item.totalTokens.toLocaleString("en-IN")}
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <button
                              type="button"
                              disabled={!item.inviter}
                              onClick={() => item.inviter && setSelectedInviterId(item.inviter.id)}
                              title="View all users referred by this referrer"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-admin border border-[rgba(244,114,182,0.2)] bg-admin-surface text-admin-primary transition-colors hover:bg-[rgba(244,114,182,0.15)] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Users size={15} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* ── Pagination Footer ── */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex flex-col items-center justify-between gap-3 border-t border-[rgba(244,114,182,0.15)] px-5 py-3.5 sm:flex-row">
                  <p className="text-[0.8rem] text-admin-muted">
                    Showing <span className="font-semibold text-white">{rangeStart}</span> to{" "}
                    <span className="font-semibold text-white">{rangeEnd}</span> of{" "}
                    <span className="font-semibold text-white">{pagination.total}</span> referrals
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

      <ReferredUsersModal inviterId={selectedInviterId} onClose={() => setSelectedInviterId(null)} />
    </div>
  );
};

export default ReferralsPage;
