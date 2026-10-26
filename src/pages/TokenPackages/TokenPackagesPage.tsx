import React, { useState } from "react";
import { toast } from "react-toastify";
import {
  Plus,
  Coins,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Dropdown from "../../components/common/Dropdown";
import { ConfirmModal } from "../../components/ConfirmModal";
import { TokenPackageModal } from "./TokenPackageModal";
import {
  useCreateTokenPackageMutation,
  useDeleteTokenPackageMutation,
  useTogglePackageStatusMutation,
  useTokenPackagesQuery,
  useUpdateTokenPackageMutation,
} from "../../hooks/useTokenPackages";
import {
  CreateTokenPackagePayload,
  TokenPackage,
  TokenPackageListFilters,
  UpdateTokenPackagePayload,
} from "../../types/tokenPackage.types";

const initialFilters: TokenPackageListFilters = {
  page: 1,
  limit: 10,
  search: "",
  gender: "all",
  isActive: "all",
};

export const TokenPackagesPage: React.FC = () => {
  const [filters, setFilters] = useState<TokenPackageListFilters>(initialFilters);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingPackage, setEditingPackage] = useState<TokenPackage | null>(null);
  const [deletingPackage, setDeletingPackage] = useState<TokenPackage | null>(null);

  const { data, isLoading, isFetching, isError, refetch } = useTokenPackagesQuery(filters);
  const createMutation = useCreateTokenPackageMutation();
  const updateMutation = useUpdateTokenPackageMutation();
  const toggleMutation = useTogglePackageStatusMutation();
  const deleteMutation = useDeleteTokenPackageMutation();

  const packages = data?.packages ?? [];
  const pagination = data?.pagination;

  const updateFilter = <K extends keyof TokenPackageListFilters>(
    key: K,
    value: TokenPackageListFilters[K]
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

  const handleOpenEdit = (pkg: TokenPackage) => {
    setEditingPackage(pkg);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (pkg: TokenPackage) => {
    const newStatus = !pkg.isActive;
    try {
      await toggleMutation.mutateAsync({ id: pkg.id, isActive: newStatus });
      toast.success(
        `Token package ${newStatus ? "activated" : "deactivated"} successfully.`
      );
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to update package status."
      );
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingPackage) return;
    try {
      await deleteMutation.mutateAsync(deletingPackage.id);
      toast.success("Token package deleted successfully.");
      setDeletingPackage(null);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to delete token package."
      );
    }
  };

  const handleFormSubmit = async (
    payload: CreateTokenPackagePayload | UpdateTokenPackagePayload
  ) => {
    try {
      if (editingPackage) {
        await updateMutation.mutateAsync({ id: editingPackage.id, payload });
        toast.success("Token package updated successfully.");
      } else {
        await createMutation.mutateAsync(payload as CreateTokenPackagePayload);
        toast.success("Token package created successfully.");
      }
      setIsModalOpen(false);
      setEditingPackage(null);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to save token package."
      );
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return "-";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ── Top Header Bar ── */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-[1.5rem] font-bold tracking-[-0.01em] text-white">
            Token Packages
          </h2>
          <p className="mt-0.5 text-[0.85rem] text-admin-muted">
            Manage token packages available to users.
          </p>
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
          <span>Add Token Package</span>
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
            placeholder="Search by label, tokens, price..."
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="w-full rounded-admin border border-[rgba(244,114,182,0.2)] bg-admin-surface py-2.5 pl-10 pr-3.5 text-[0.86rem] text-white outline-none transition-colors focus:border-admin-primary placeholder:text-admin-subtle"
          />
        </div>

        {/* Status Filter */}
        <div className="w-[180px]">
          <Dropdown
            value={filters.isActive}
            onChange={(val) => updateFilter("isActive", val as any)}
            options={[
              { value: "all", label: "All Statuses" },
              { value: "true", label: "Active" },
              { value: "false", label: "Inactive" },
            ]}
          />
        </div>

        {/* Refresh Button */}
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          title="Refresh token packages"
          className="flex h-11 w-11 items-center justify-center rounded-admin border border-[rgba(244,114,182,0.2)] bg-admin-surface text-admin-primary transition-all duration-200 hover:bg-admin-surface/80 active:scale-95 disabled:opacity-50"
        >
          <RefreshCw size={17} className={isFetching ? "animate-spin" : ""} />
        </button>
      </div>

      {/* ── Table Container ── */}
      <div className="overflow-hidden rounded-admin-lg border border-[rgba(244,114,182,0.2)] bg-admin-card shadow-admin">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-[0.86rem]">
            <thead>
              <tr className="border-b border-[rgba(244,114,182,0.2)] bg-admin-surface/50 text-[0.75rem] font-bold uppercase tracking-[0.05em] text-admin-muted">
                <th className="px-5 py-3.5">Tokens</th>
                <th className="px-5 py-3.5">Price</th>
                <th className="px-5 py-3.5">Discount</th>
                <th className="px-5 py-3.5">Label</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Created</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[rgba(244,114,182,0.1)]">
              {isLoading ? (
                // Loading Skeleton Rows
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-5 py-4">
                      <div className="h-5 w-24 rounded bg-white/10" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-5 w-16 rounded bg-white/10" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-5 w-12 rounded bg-white/10" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-5 w-16 rounded bg-white/10" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-5 w-14 rounded-full bg-white/10" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-5 w-20 rounded bg-white/10" />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="ml-auto h-8 w-8 rounded bg-white/10" />
                    </td>
                  </tr>
                ))
              ) : isError ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-admin-danger">
                    Failed to load token packages. Please check connection and try again.
                  </td>
                </tr>
              ) : packages.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-admin-muted">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-admin-surface text-admin-subtle">
                        <Coins size={28} />
                      </div>
                      <p className="text-[0.95rem] font-medium text-white">
                        No token packages found.
                      </p>
                      <p className="text-[0.8rem] text-admin-subtle">
                        {filters.search || filters.isActive !== "all"
                          ? "Try adjusting your search or filters."
                          : "Get started by creating your first token package."}
                      </p>
                      {!filters.search && filters.isActive === "all" && (
                        <button
                          type="button"
                          onClick={handleOpenAdd}
                          className="mt-2 flex items-center gap-1.5 rounded-admin bg-admin-surface px-4 py-2 text-[0.82rem] font-semibold text-admin-primary transition-colors hover:bg-admin-surface/80"
                        >
                          <Plus size={15} /> Add Token Package
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                packages.map((pkg) => (
                  <tr
                    key={pkg.id}
                    className="transition-colors hover:bg-admin-surface/40"
                  >
                    {/* Tokens */}
                    <td className="px-5 py-4 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[rgba(244,114,182,0.12)] text-admin-primary">
                          <Coins size={15} />
                        </div>
                        <span>{pkg.tokens.toLocaleString()} Tokens</span>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="px-5 py-4 font-medium text-admin-primary">
                      {pkg.currency === "USD" ? "$" : `${pkg.currency} `}
                      {pkg.price.toFixed(2)}
                    </td>

                    {/* Discount */}
                    <td className="px-5 py-4">
                      {pkg.discountPercentage > 0 ? (
                        <span className="inline-flex items-center rounded-full bg-[rgba(16,185,129,0.15)] px-2.5 py-0.5 text-[0.72rem] font-semibold text-admin-success">
                          {pkg.discountPercentage}% OFF
                        </span>
                      ) : (
                        <span className="text-admin-subtle">-</span>
                      )}
                    </td>

                    {/* Label */}
                    <td className="px-5 py-4">
                      {pkg.label ? (
                        <span className="inline-flex items-center rounded-full border border-[rgba(244,114,182,0.3)] bg-[rgba(244,114,182,0.12)] px-2.5 py-0.5 text-[0.72rem] font-bold text-admin-primary">
                          {pkg.label}
                        </span>
                      ) : (
                        <span className="text-admin-subtle">-</span>
                      )}
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

                    {/* Created Date */}
                    <td className="px-5 py-4 text-[0.8rem] text-admin-muted">
                      {formatDate(pkg.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="relative px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(pkg)}
                          title="Edit token package"
                          className="flex h-8 w-8 items-center justify-center rounded-admin border border-[rgba(244,114,182,0.2)] bg-admin-surface text-admin-muted transition-colors hover:border-admin-primary hover:text-white"
                        >
                          <Edit2 size={14} />
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => setDeletingPackage(pkg)}
                          title="Delete token package"
                          className="flex h-8 w-8 items-center justify-center rounded-admin border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.1)] text-red-400 transition-colors hover:bg-[rgba(239,68,68,0.2)] hover:text-red-300"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
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
              Showing{" "}
              <span className="font-semibold text-white">
                {(pagination.page - 1) * pagination.limit + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-white">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{" "}
              of <span className="font-semibold text-white">{pagination.total}</span> packages
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => updateFilter("page", filters.page - 1)}
                disabled={!pagination.hasPrevPage}
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
                disabled={!pagination.hasNextPage}
                className="flex h-8 items-center gap-1 rounded-admin border border-[rgba(244,114,182,0.2)] bg-admin-surface px-3 text-[0.8rem] font-medium text-admin-muted transition-colors hover:bg-admin-surface/80 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Add / Edit Modal ── */}
      <TokenPackageModal
        isOpen={isModalOpen}
        packageData={editingPackage}
        isLoading={createMutation.isPending || updateMutation.isPending}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPackage(null);
        }}
        onSubmit={handleFormSubmit}
      />

      {/* ── Delete Confirmation Modal ── */}
      <ConfirmModal
        isOpen={Boolean(deletingPackage)}
        title="Delete Token Package?"
        message={`Are you sure you want to delete the package with ${deletingPackage?.tokens.toLocaleString()} Tokens ($${deletingPackage?.price.toFixed(
          2
        )})? This action cannot be undone.`}
        confirmText="Delete Package"
        cancelText="Cancel"
        isLoading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingPackage(null)}
      />
    </div>
  );
};

export default TokenPackagesPage;
