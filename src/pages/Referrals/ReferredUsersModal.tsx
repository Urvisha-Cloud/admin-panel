import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Users, ShoppingBag, Coins, UserPlus } from "lucide-react";
import { useInviterReferralsQuery } from "../../hooks/useReferrals";
import { RewardBadges, formatDateTime } from "./ReferralsPage";

interface ReferredUsersModalProps {
  inviterId: string | null;
  onClose: () => void;
}

// Every user who signed up with one referrer's code
export const ReferredUsersModal: React.FC<ReferredUsersModalProps> = ({ inviterId, onClose }) => {
  const { data, isLoading, isError, refetch } = useInviterReferralsQuery(inviterId);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!inviterId) return null;

  const inviter = data?.data.inviter;
  const summary = data?.data.summary;
  const referrals = data?.data.referrals ?? [];

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-admin-md border border-[rgba(244,114,182,0.2)] bg-admin-card shadow-admin-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[rgba(244,114,182,0.2)] px-6 py-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[rgba(244,114,182,0.15)] text-admin-primary">
              <Users size={18} strokeWidth={2.2} />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-base font-bold text-white">
                {inviter ? `${inviter.name}'s referrals` : "Referred users"}
              </h2>
              {inviter && (
                <p className="truncate text-xs text-admin-muted">
                  {inviter.email} · Code <span className="font-semibold text-admin-primary">{inviter.referralCode || "—"}</span>
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-admin p-1.5 text-admin-muted transition-colors hover:bg-admin-surface hover:text-white"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5">
          {isLoading ? (
            <div className="py-12 text-center text-sm text-admin-muted">
              <div className="mb-3 inline-block h-7 w-7 animate-spin rounded-full border-2 border-admin-primary border-t-transparent" />
              <p>Loading referred users...</p>
            </div>
          ) : isError ? (
            <div className="py-10 text-center text-sm text-red-400">
              <p>Failed to load referred users.</p>
              <button
                onClick={() => refetch()}
                className="mt-3 rounded-admin border border-[rgba(244,114,182,0.2)] bg-admin-surface px-4 py-2 text-xs text-white"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              <div className="mb-5 grid grid-cols-3 gap-3">
                <div className="rounded-admin border border-[rgba(244,114,182,0.14)] bg-admin-surface/60 px-4 py-3">
                  <p className="flex items-center gap-1.5 text-[0.65rem] font-medium uppercase tracking-wider text-admin-muted">
                    <UserPlus size={11} /> Invited
                  </p>
                  <p className="mt-1 text-base font-bold text-white">{summary?.invitedCount ?? 0}</p>
                </div>
                <div className="rounded-admin border border-[rgba(244,114,182,0.14)] bg-admin-surface/60 px-4 py-3">
                  <p className="flex items-center gap-1.5 text-[0.65rem] font-medium uppercase tracking-wider text-admin-muted">
                    <ShoppingBag size={11} /> Purchased
                  </p>
                  <p className="mt-1 text-base font-bold text-emerald-400">{summary?.purchasedCount ?? 0}</p>
                </div>
                <div className="rounded-admin border border-[rgba(244,114,182,0.14)] bg-admin-surface/60 px-4 py-3">
                  <p className="flex items-center gap-1.5 text-[0.65rem] font-medium uppercase tracking-wider text-admin-muted">
                    <Coins size={11} /> Tokens earned
                  </p>
                  <p className="mt-1 text-base font-bold text-admin-primary">
                    {(summary?.earnedTokens ?? 0).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              {referrals.length === 0 ? (
                <p className="py-8 text-center text-sm text-admin-muted">No one has used this code yet.</p>
              ) : (
                <ul className="divide-y divide-[rgba(244,114,182,0.08)] rounded-admin border border-[rgba(244,114,182,0.12)]">
                  {referrals.map((item, index) => (
                    <li key={item.id} className="flex items-center gap-3 px-4 py-3">
                      <span className="w-5 shrink-0 text-xs font-semibold text-admin-muted">{index + 1}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-white">
                          {item.invitee?.name ?? "Deleted user"}
                        </p>
                        <p className="truncate text-[0.7rem] text-admin-muted">
                          {item.invitee?.email ?? "Account no longer exists"} · Joined {formatDateTime(item.createdAt)}
                        </p>
                      </div>
                      <RewardBadges item={item} />
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ReferredUsersModal;
