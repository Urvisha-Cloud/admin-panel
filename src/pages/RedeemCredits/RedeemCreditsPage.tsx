import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  Coins,
  CircleDollarSign,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import Dropdown from "../../components/common/Dropdown";
import { ConfirmModal } from "../../components/ConfirmModal";
import { RedeemPackageModal } from "./RedeemPackageModal";
import {
  useCreateRedeemPackageMutation,
  useDeleteRedeemPackageMutation,
  useRedeemPackagesQuery,
  useToggleRedeemPackageStatusMutation,
  useUpdateRedeemPackageMutation,
  useUpdateRedeemPackageOrderMutation,
} from "../../hooks/useRedeemPackages";
import {
  CreateRedeemPackagePayload,
  RedeemPackage,
  RedeemPackageListFilters,
  UpdateRedeemPackagePayload,
} from "../../types/redeemPackage.types";

const initialFilters: RedeemPackageListFilters = {
  page: 1,
  limit: 50,
  search: "",
  isActive: "all",
};

interface DisplayOrderStepperProps {
  pkg: RedeemPackage;
  onOrderChange: (pkg: RedeemPackage, newOrder: number) => Promise<void> | void;
  disabled?: boolean;
}

const DisplayOrderStepper: React.FC<DisplayOrderStepperProps> = ({
  pkg,
  onOrderChange,
  disabled,
}) => {
  const [val, setVal] = useState<string>(String(pkg.displayOrder ?? 0));

  useEffect(() => {
    setVal(String(pkg.displayOrder ?? 0));
  }, [pkg.displayOrder]);

  const commitValue = () => {
    const num = parseInt(val, 10);
    if (!isNaN(num) && num >= 0 && num !== pkg.displayOrder) {
      onOrderChange(pkg, num);
    } else {
      setVal(String(pkg.displayOrder ?? 0));
    }
  };

  const handleStep = (delta: number) => {
    const current = parseInt(val, 10) || 0;
    const nextVal = Math.max(0, current + delta);
    if (nextVal !== pkg.displayOrder) {
      setVal(String(nextVal));
      onOrderChange(pkg, nextVal);
    }
  };

  return (
    <div className="flex items-center">
      <div className="group relative flex h-8 items-center rounded-admin border border-[rgba(244,114,182,0.25)] bg-admin-surface/80 shadow-sm transition-all duration-200 focus-within:border-admin-primary focus-within:shadow-[0_0_10px_rgba(244,114,182,0.35)] hover:border-[rgba(244,114,182,0.45)]">
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={val}
          disabled={disabled}
          onChange={(e) => setVal(e.target.value.replace(/[^0-9]/g, ""))}
          onBlur={commitValue}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              commitValue();
              (e.target as HTMLInputElement).blur();
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              handleStep(1);
            } else if (e.key === "ArrowDown") {
              e.preventDefault();
              handleStep(-1);
            }
          }}
          className="w-10 bg-transparent px-1.5 py-1 text-center text-xs font-bold text-white outline-none placeholder:text-admin-subtle"
        />

        {/* Vertical Up / Down Arrow Steppers */}
        <div className="flex flex-col border-l border-[rgba(244,114,182,0.2)] pr-0.5">
          <button
            type="button"
            title="Increase order (+1)"
            disabled={disabled}
            onClick={() => handleStep(1)}
            className="flex h-3.5 w-4 items-center justify-center rounded-t text-admin-muted transition-colors hover:bg-admin-primary/25 hover:text-white active:scale-90 disabled:opacity-30"
          >
            <ChevronUp size={12} strokeWidth={2.8} />
          </button>
          <button
            type="button"
            title="Decrease order (-1)"
            disabled={disabled || (parseInt(val, 10) || 0) <= 0}
            onClick={() => handleStep(-1)}
            className="flex h-3.5 w-4 items-center justify-center rounded-b text-admin-muted transition-colors hover:bg-admin-primary/25 hover:text-white active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronDown size={12} strokeWidth={2.8} />
          </button>
        </div>
      </div>
    </div>
  );
};

export const RedeemCreditsPage: React.FC = () => {
  const [filters, setFilters] = useState<RedeemPackageListFilters>(initialFilters);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingPackage, setEditingPackage] = useState<RedeemPackage | null>(null);
  const [deletingPackage, setDeletingPackage] = useState<RedeemPackage | null>(null);

  const { data, isLoading, isFetching, isError, refetch } = useRedeemPackagesQuery(filters);
  const createMutation = useCreateRedeemPackageMutation();
  const updateMutation = useUpdateRedeemPackageMutation();
  const toggleMutation = useToggleRedeemPackageStatusMutation();
  const updateOrderMutation = useUpdateRedeemPackageOrderMutation();
  const deleteMutation = useDeleteRedeemPackageMutation();

  const packages = data?.packages ?? [];

  const updateFilter = <K extends keyof RedeemPackageListFilters>(
    key: K,
    value: RedeemPackageListFilters[K]
  ) => {
    setFilters((prev) => ({
      ...prev,
      page: key === "page" ? (value as number) : 1,
      [key]: value,
    }));
  };

  const handleOpenAdd = () => {
    setEditingPackage(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pkg: RedeemPackage) => {
    setEditingPackage(pkg);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (pkg: RedeemPackage) => {
    const newStatus = !pkg.isActive;
    try {
      await toggleMutation.mutateAsync({ id: pkg.id, isActive: newStatus });
      toast.success(
        `Package ${newStatus ? "activated" : "deactivated"} successfully.`
      );
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to update package status."
      );
    }
  };

  const handleOrderChange = async (pkg: RedeemPackage, newOrder: number) => {
    if (isNaN(newOrder) || newOrder < 0 || newOrder === pkg.displayOrder) return;
    try {
      await updateOrderMutation.mutateAsync({ id: pkg.id, displayOrder: newOrder });
      toast.success("Display order updated.");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to update display order."
      );
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingPackage) return;
    try {
      await deleteMutation.mutateAsync(deletingPackage.id);
      toast.success("Redeem package deleted successfully.");
      setDeletingPackage(null);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to delete package."
      );
    }
  };

  const handleFormSubmit = async (
    payload: CreateRedeemPackagePayload | UpdateRedeemPackagePayload
  ) => {
    try {
      if (editingPackage) {
        await updateMutation.mutateAsync({ id: editingPackage.id, payload });
        toast.success("Redeem package updated successfully.");
      } else {
        await createMutation.mutateAsync(payload as CreateRedeemPackagePayload);
        toast.success("Redeem package created successfully.");
      }
      setIsModalOpen(false);
      setEditingPackage(null);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to save package."
      );
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ── Top Header Bar ── */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-admin text-white"
              style={{
                background: "linear-gradient(135deg, #F472B6 0%, #DB2777 100%)",
                boxShadow: "0 0 16px rgba(244, 114, 182, 0.3)",
              }}
            >
              <CircleDollarSign size={22} />
            </div>
            <div>
              <h2 className="text-[1.5rem] font-bold tracking-[-0.01em] text-white">
                Redeem Credits
              </h2>
              <p className="mt-0.5 text-[0.85rem] text-admin-muted">
                Manage token to credit payout packages for direct instant redemption.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 rounded-admin px-4 py-2.5 text-[0.88rem] font-semibold text-white shadow-[0_2px_12px_rgba(244,114,182,0.35)] transition-all duration-200 hover:opacity-95 active:scale-[0.98]"
          style={{
            background: "linear-gradient(135deg, #F472B6 0%, #DB2777 100%)",
          }}
        >
          <Plus size={18} strokeWidth={2.4} />
          <span>Add Package</span>
        </button>
      </div>

      {/* ── Search and Filter Controls ── */}
      <div className="flex flex-wrap items-center gap-3 rounded-admin-lg border border-[rgba(244,114,182,0.2)] bg-admin-card p-4 shadow-admin">
        {/* Search input */}
        <div className="relative min-w-[220px] flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-admin-muted"
          />
          <input
            type="text"
            placeholder="Search packages by title..."
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="w-full rounded-admin border border-[rgba(244,114,182,0.2)] bg-admin-surface py-2.5 pl-10 pr-3.5 text-[0.86rem] text-white outline-none transition-colors focus:border-admin-primary placeholder:text-admin-subtle"
          />
        </div>

        {/* Status Filter */}
        <div className="w-[180px]">
          <Dropdown
            options={[
              { value: "all", label: "All Statuses" },
              { value: "true", label: "Active" },
              { value: "false", label: "Inactive" },
            ]}
            value={filters.isActive}
            onChange={(val) => updateFilter("isActive", val as any)}
          />
        </div>

        {/* Refresh Button */}
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          title="Refresh packages"
          className="flex h-11 w-11 items-center justify-center rounded-admin border border-[rgba(244,114,182,0.2)] bg-admin-surface text-admin-primary transition-all duration-200 hover:bg-admin-surface/80 active:scale-95 disabled:opacity-50"
        >
          <RefreshCw size={17} className={isFetching ? "animate-spin" : ""} />
        </button>
      </div>

      {/* ── Table Container ── */}
      <div className="overflow-hidden rounded-admin-lg border border-[rgba(244,114,182,0.2)] bg-admin-card shadow-admin">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-admin-muted">
            <RefreshCw size={28} className="animate-spin text-admin-primary mb-3" />
            <p className="text-sm">Loading redeem packages...</p>
          </div>
        ) : isError ? (
          <div className="py-16 text-center text-red-400">
            <p className="font-semibold">Failed to load redeem packages.</p>
            <button
              onClick={() => refetch()}
              className="mt-3 rounded-admin border border-[rgba(244,114,182,0.3)] bg-admin-surface px-4 py-1.5 text-xs text-white"
            >
              Try Again
            </button>
          </div>
        ) : packages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-admin-muted">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-[rgba(244,114,182,0.25)] bg-admin-surface text-admin-primary shadow-[0_0_16px_rgba(244,114,182,0.15)]">
              <CircleDollarSign size={28} />
            </div>
            <h4 className="text-base font-bold text-white mb-1">No Redeem Packages Found</h4>
            <p className="text-xs text-admin-muted max-w-sm text-center mb-4">
              Create your first token-to-credit redeem package so users can convert their tokens into credits.
            </p>
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 rounded-admin bg-gradient-to-r from-[#F472B6] to-[#DB2777] px-4 py-2.5 text-xs font-bold text-white shadow-[0_2px_12px_rgba(244,114,182,0.35)]"
            >
              <Plus size={14} />
              <span>Create First Package</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-[0.86rem]">
              <thead>
                <tr className="border-b border-[rgba(244,114,182,0.2)] bg-admin-surface/50 text-[0.75rem] font-bold uppercase tracking-[0.05em] text-admin-muted">
                  <th className="px-5 py-3.5">Icon & Package</th>
                  <th className="px-5 py-3.5">Required Tokens</th>
                  <th className="px-5 py-3.5">Credit Value</th>
                  <th className="px-5 py-3.5">Display Order</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(244,114,182,0.1)]">
                {packages.map((pkg) => (
                  <tr
                    key={pkg.id}
                    className="transition-colors hover:bg-admin-surface/40"
                  >
                    {/* Icon & Title */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center">
                          {pkg.icon ? (
                            <img
                              src={pkg.icon}
                              alt={pkg.title}
                              className="h-10 w-10 object-contain"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <CircleDollarSign size={20} className="text-admin-primary" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-white">{pkg.title}</div>
                          <div className="text-[11px] font-mono text-admin-muted">
                            ID: {pkg.id.slice(-6)}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Required Tokens */}
                    <td className="px-5 py-4">
                      <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400">
                        <Coins size={13} />
                        <span>{pkg.requiredTokens.toLocaleString()} Tokens</span>
                      </div>
                    </td>

                    {/* Credit Value */}
                    <td className="px-5 py-4">
                      <div className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
                        <span>${pkg.creditValue.toLocaleString()} Credits</span>
                      </div>
                    </td>

                    {/* Display Order */}
                    <td className="px-5 py-4">
                      <DisplayOrderStepper
                        pkg={pkg}
                        onOrderChange={handleOrderChange}
                        disabled={updateOrderMutation.isPending}
                      />
                    </td>

                    {/* Status Toggle Switch */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={pkg.isActive}
                          onClick={() => handleToggleStatus(pkg)}
                          title={pkg.isActive ? "Click to deactivate" : "Click to activate"}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-200 ease-in-out focus:outline-none ${
                            pkg.isActive ? "bg-admin-primary" : "bg-white/15 hover:bg-white/20"
                          }`}
                          style={
                            pkg.isActive
                              ? {
                                  background: "linear-gradient(135deg, #F472B6 0%, #DB2777 100%)",
                                  boxShadow: "0 0 10px rgba(244, 114, 182, 0.4)",
                                }
                              : {}
                          }
                        >
                          <span
                            aria-hidden="true"
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                              pkg.isActive ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(pkg)}
                          className="rounded-admin p-1.5 text-admin-muted transition-colors hover:bg-admin-surface hover:text-white"
                          title="Edit package"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingPackage(pkg)}
                          className="rounded-admin p-1.5 text-admin-muted transition-colors hover:bg-red-500/10 hover:text-red-400"
                          title="Delete package"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Add / Edit Modal ── */}
      <RedeemPackageModal
        isOpen={isModalOpen}
        packageData={editingPackage}
        isLoading={createMutation.isPending || updateMutation.isPending}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPackage(null);
        }}
        onSubmit={handleFormSubmit}
      />

      {/* ── Confirm Delete Modal ── */}
      <ConfirmModal
        isOpen={Boolean(deletingPackage)}
        title="Delete Redeem Package"
        message={`Are you sure you want to delete "${deletingPackage?.title}"? This action cannot be undone.`}
        confirmText="Delete Package"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingPackage(null)}
      />
    </div>
  );
};

export default RedeemCreditsPage;
