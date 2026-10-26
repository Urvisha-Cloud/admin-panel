import React, { useState } from "react";
import { toast } from "react-toastify";
import {
  Gift,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { ConfirmModal } from "../../components/ConfirmModal";
import { WeeklyBonusModal } from "./WeeklyBonusModal";
import {
  useWeeklyBonusesQuery,
  useCreateWeeklyBonusMutation,
  useUpdateWeeklyBonusMutation,
  useDeleteWeeklyBonusMutation,
} from "../../hooks/useBonusQueries";
import {
  WeeklyBonus,
  CreateWeeklyBonusPayload,
  UpdateWeeklyBonusPayload,
} from "../../types/bonus.types";

export const WeeklyBonusPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingBonus, setEditingBonus] = useState<WeeklyBonus | null>(null);
  const [deletingBonus, setDeletingBonus] = useState<WeeklyBonus | null>(null);

  const { data: bonuses = [], isLoading, isFetching, refetch } = useWeeklyBonusesQuery();
  const createMutation = useCreateWeeklyBonusMutation();
  const updateMutation = useUpdateWeeklyBonusMutation();
  const deleteMutation = useDeleteWeeklyBonusMutation();

  const handleOpenAdd = () => {
    setEditingBonus(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (bonus: WeeklyBonus) => {
    setEditingBonus(bonus);
    setIsModalOpen(true);
  };

  const handleToggleActive = async (bonus: WeeklyBonus) => {
    const newStatus = !bonus.isActive;
    try {
      await updateMutation.mutateAsync({
        id: bonus._id,
        payload: { isActive: newStatus },
      });
      toast.success(`Weekly bonus ${newStatus ? "activated" : "deactivated"} successfully.`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to update bonus status.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingBonus) return;
    try {
      await deleteMutation.mutateAsync(deletingBonus._id);
      toast.success("Weekly bonus configuration deleted successfully.");
      setDeletingBonus(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to delete bonus configuration.");
    }
  };

  const handleFormSubmit = async (
    payload: CreateWeeklyBonusPayload | UpdateWeeklyBonusPayload
  ) => {
    try {
      if (editingBonus) {
        await updateMutation.mutateAsync({ id: editingBonus._id, payload });
        toast.success("Weekly bonus configuration updated successfully.");
      } else {
        await createMutation.mutateAsync(payload as CreateWeeklyBonusPayload);
        toast.success("Weekly bonus configuration created successfully.");
      }
      setIsModalOpen(false);
      setEditingBonus(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to save weekly bonus.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ── Top Header Bar ── */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-[1.5rem] font-bold tracking-[-0.01em] text-white">
            Weekly Bonus Tickets
          </h2>
          <p className="mt-0.5 text-[0.85rem] text-admin-muted">
            Configure the 7-day scratch ticket rewards (Monday through Sunday) for mobile users.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            title="Refresh"
            className="flex h-10 w-10 items-center justify-center rounded-admin border border-[rgba(244,114,182,0.25)] bg-admin-surface text-admin-muted transition-colors hover:bg-admin-surface/80 hover:text-white"
          >
            <RefreshCw size={17} className={isFetching ? "animate-spin" : ""} />
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-2 rounded-admin px-4 py-2.5 text-[0.875rem] font-semibold text-white shadow-[0_2px_14px_rgba(244,114,182,0.35)] transition-all hover:opacity-95"
            style={{
              background: "linear-gradient(135deg, #F472B6 0%, #DB2777 100%)",
            }}
          >
            <Plus size={18} />
            <span>Create Weekly Bonus</span>
          </button>
        </div>
      </div>

      {/* ── Weekly Bonus Configurations List ── */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center rounded-admin-lg border border-[rgba(244,114,182,0.15)] bg-admin-card py-16 text-admin-muted">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-admin-primary border-t-transparent mb-3" />
          <p className="text-[0.88rem]">Loading weekly bonus configurations...</p>
        </div>
      ) : bonuses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-admin-lg border border-[rgba(244,114,182,0.15)] bg-admin-card py-16 text-center text-admin-muted">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-admin-surface text-admin-primary mb-3">
            <Gift size={28} />
          </div>
          <h3 className="text-[1.1rem] font-bold text-white mb-1">No Weekly Bonuses Found</h3>
          <p className="text-[0.85rem] max-w-sm text-admin-muted mb-4">
            Create your first weekly bonus configuration to enable the 7-day reward tickets in the mobile app.
          </p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-2 rounded-admin px-4 py-2 text-[0.85rem] font-semibold text-white bg-admin-primary"
          >
            <Plus size={16} />
            <span>Create Weekly Bonus</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {bonuses.map((bonus) => (
            <div
              key={bonus._id}
              className={`rounded-admin-lg border bg-admin-card p-6 shadow-admin transition-all ${
                bonus.isActive
                  ? "border-[rgba(244,114,182,0.25)] shadow-[0_0_20px_rgba(244,114,182,0.15)]"
                  : "border-[rgba(244,114,182,0.18)] opacity-85"
              }`}
            >
              {/* Card Top Info */}
              <div className="flex flex-col justify-between gap-4 border-b border-[rgba(244,114,182,0.15)] pb-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-[12px] text-white shrink-0"
                    style={{
                      background: bonus.isActive
                        ? "linear-gradient(135deg, #F472B6 0%, #DB2777 100%)"
                        : "linear-gradient(135deg, #4B5563 0%, #374151 100%)",
                      boxShadow: bonus.isActive ? "0 0 16px rgba(244, 114, 182, 0.3)" : "none",
                    }}
                  >
                    <Gift size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-[1.15rem] font-bold text-white">{bonus.title}</h3>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[0.72rem] font-semibold ${
                          bonus.isActive
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                        }`}
                      >
                        {bonus.isActive ? (
                          <>
                            <CheckCircle2 size={11} /> Active
                          </>
                        ) : (
                          <>
                            <XCircle size={11} /> Inactive
                          </>
                        )}
                      </span>
                    </div>
                    {bonus.description && (
                      <p className="mt-0.5 text-[0.8rem] text-admin-muted">{bonus.description}</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(bonus)}
                    className={`rounded-admin px-3 py-1.5 text-[0.78rem] font-semibold transition-colors ${
                      bonus.isActive
                        ? "border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                        : "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                    }`}
                  >
                    {bonus.isActive ? "Deactivate" : "Set as Active"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(bonus)}
                    className="flex items-center gap-1.5 rounded-admin border border-[rgba(244,114,182,0.25)] bg-admin-surface px-3 py-1.5 text-[0.78rem] font-medium text-white transition-colors hover:bg-admin-surface/80"
                  >
                    <Edit2 size={13} />
                    <span>Edit 7 Days</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeletingBonus(bonus)}
                    className="flex h-8 w-8 items-center justify-center rounded-admin border border-red-500/25 bg-red-500/10 text-red-400 transition-colors hover:bg-red-500/20"
                    title="Delete bonus"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* 7 Days Preview Grid */}
              <div className="mt-5">
                <div className="mb-2.5 flex items-center justify-between text-[0.78rem] font-semibold uppercase tracking-[0.06em] text-admin-muted">
                  <span>Weekly Ticket Progression</span>
                  <span>7 Days Configured</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 md:grid-cols-7">
                  {bonus.days?.map((day) => (
                    <div
                      key={day.dayNumber}
                      className="flex flex-col items-center justify-between rounded-admin border border-[rgba(244,114,182,0.18)] bg-admin-surface/80 p-3 text-center transition-all hover:border-[rgba(244,114,182,0.4)]"
                    >
                      {/* Top Day Badge */}
                      <div className="flex w-full items-center justify-between">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-admin-primary/20 text-[0.68rem] font-bold text-admin-primary">
                          {day.dayNumber}
                        </span>
                        <span className="text-[0.72rem] font-medium text-admin-muted">
                          {day.dayName.slice(0, 3)}
                        </span>
                      </div>

                      {/* Center Visual / Icon / Image */}
                      <div className="my-2 flex h-12 w-12 items-center justify-center rounded-full bg-admin-card border border-[rgba(244,114,182,0.15)] overflow-hidden">
                        {day.image ? (
                          <img
                            src={day.image}
                            alt={day.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Gift size={22} color="var(--primary)" />
                        )}
                      </div>

                      {/* Reward Title & Type */}
                      <div className="w-full">
                        <p className="truncate text-[0.78rem] font-bold text-white">{day.title}</p>
                        <span className="mt-0.5 inline-block truncate rounded bg-black/40 px-1.5 py-0.5 text-[0.65rem] text-admin-primary">
                          {day.rewardType}
                          {day.tokenAmount > 0 ? ` (+${day.tokenAmount} tk)` : ""}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      <WeeklyBonusModal
        isOpen={isModalOpen}
        bonusData={editingBonus}
        isLoading={createMutation.isPending || updateMutation.isPending}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBonus(null);
        }}
        onSubmit={handleFormSubmit}
      />

      {/* ── Delete Confirmation Modal ── */}
      <ConfirmModal
        isOpen={Boolean(deletingBonus)}
        title="Delete Weekly Bonus"
        message={`Are you sure you want to delete "${deletingBonus?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        isLoading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingBonus(null)}
      />
    </div>
  );
};

export default WeeklyBonusPage;
