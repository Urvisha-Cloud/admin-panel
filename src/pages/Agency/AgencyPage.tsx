import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  Building2,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Copy,
  Users,
  UserPlus,
  Wallet,
} from "lucide-react";
import Dropdown from "../../components/common/Dropdown";
import { ConfirmModal } from "../../components/ConfirmModal";
import { AgencyModal } from "./AgencyModal";
import { AgencyWithdrawalsPage, formatRupees } from "./AgencyWithdrawalsPage";
import { getPathSegments, navigate, subscribeToLocation } from "../../utils/navigation";
import {
  useAgenciesQuery,
  useCreateAgencyMutation,
  useDeleteAgencyMutation,
  useUpdateAgencyMutation,
} from "../../hooks/useAgencies";
import {
  Agency,
  AgencyListFilters,
  CreateAgencyPayload,
  UpdateAgencyPayload,
} from "../../types/agency.types";

const initialFilters: AgencyListFilters = {
  page: 1,
  limit: 12,
  search: "",
  status: "all",
};

const statusFilterOptions = [
  { value: "all", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const formatDate = (dateStr: string) => {
  if (!dateStr) return "-";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

interface AgencyRowProps {
  agency: Agency;
  isExpanded: boolean;
  onToggleExpand: (agency: Agency) => void;
  onEdit: (agency: Agency) => void;
  onDelete: (agency: Agency) => void;
  onToggleStatus: (agency: Agency) => void;
  isTogglingStatus?: boolean;
  onViewWithdrawals: (agency: Agency) => void;
}

const TABLE_COLUMNS = 10;

const AgencyRow: React.FC<AgencyRowProps> = ({
  agency,
  isExpanded,
  onToggleExpand,
  onEdit,
  onDelete,
  onToggleStatus,
  isTogglingStatus = false,
  onViewWithdrawals,
}) => {
  const members = agency.members || [];
  const assigned = agency.assignedCount || members.length;
  const limit = agency.personCount || 10;
  const isActive = agency.status === "active";
  const earnings = agency.earnings;

  return (
    <>
      <tr className={`text-white/90 transition-colors hover:bg-admin-surface/40 ${isExpanded ? "bg-admin-surface/30" : ""}`}>
        {/* Expand */}
        <td className="w-10 py-3 pl-4 pr-0">
          <button
            type="button"
            onClick={() => onToggleExpand(agency)}
            title={isExpanded ? "Hide members" : "Show members"}
            aria-expanded={isExpanded}
            className="flex h-7 w-7 items-center justify-center rounded-admin text-admin-muted hover:bg-admin-surface hover:text-white transition-colors"
          >
            <ChevronDown size={15} className={`transition-transform ${isExpanded ? "rotate-180 text-admin-primary" : ""}`} />
          </button>
        </td>

        {/* Agency */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[rgba(244,114,182,0.15)] text-xs font-bold uppercase text-admin-primary">
              {agency.name.charAt(0)}
            </span>
            <div className="min-w-0">
              <p className="truncate font-semibold text-white">{agency.name}</p>
              <p className="truncate text-[0.7rem] text-admin-muted">{agency.email}</p>
            </div>
          </div>
        </td>

        {/* Status */}
        <td className="px-4 py-3">
          <span
            className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[0.68rem] font-medium ${
              isActive ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-400" : "bg-red-400"}`} />
            {isActive ? "Active" : "Inactive"}
          </span>
        </td>

        {/* Commission */}
        <td className="px-4 py-3 text-right font-semibold text-white">{agency.percentage}%</td>

        {/* Members */}
        <td className="px-4 py-3 text-right">
          <span className="font-semibold text-white">{assigned}</span>
          <span className="text-admin-subtle"> / {limit}</span>
        </td>

        {/* Earnings */}
        <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-admin-primary">
          {formatRupees(earnings?.agencyAmount ?? 0)}
        </td>
        <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-emerald-400">
          {formatRupees(earnings?.memberAmount ?? 0)}
        </td>

        {/* Withdrawals */}
        <td className="px-4 py-3 text-right">
          <button
            type="button"
            onClick={() => onViewWithdrawals(agency)}
            title="View agency & member withdrawals"
            className="inline-flex items-center gap-1 whitespace-nowrap rounded-admin border border-[rgba(244,114,182,0.14)] px-2.5 py-1 text-[0.7rem] font-medium text-admin-muted hover:border-admin-primary hover:text-admin-primary transition-colors"
          >
            <Wallet size={12} />
            {earnings?.withdrawalCount ?? 0}
            <ChevronRight size={12} />
          </button>
        </td>

        {/* Created */}
        <td className="whitespace-nowrap px-4 py-3 text-admin-muted">{formatDate(agency.createdAt)}</td>

        {/* Actions */}
        <td className="px-4 py-3">
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              role="switch"
              aria-checked={isActive}
              aria-label={isActive ? "Deactivate agency" : "Activate agency"}
              disabled={isTogglingStatus}
              onClick={() => onToggleStatus(agency)}
              title={isActive ? "Click to deactivate" : "Click to activate"}
              className={`relative mr-1 inline-flex h-[18px] w-8 shrink-0 cursor-pointer items-center rounded-full p-[2px] transition-all duration-200 ease-in-out focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 ${
                isActive ? "bg-admin-primary" : "bg-white/15 hover:bg-white/20"
              }`}
              style={
                isActive
                  ? {
                      background: "linear-gradient(135deg, #F472B6 0%, #DB2777 100%)",
                      boxShadow: "0 0 10px rgba(244, 114, 182, 0.4)",
                    }
                  : {}
              }
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                  isActive ? "translate-x-3.5" : "translate-x-0"
                }`}
              />
            </button>
            <button
              type="button"
              onClick={() => onEdit(agency)}
              title="Edit agency & members"
              className="flex h-8 w-8 items-center justify-center rounded-admin text-admin-muted hover:bg-admin-surface hover:text-white transition-colors"
            >
              <Edit2 size={14} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(agency)}
              title="Delete agency"
              className="flex h-8 w-8 items-center justify-center rounded-admin text-admin-muted hover:bg-red-500/15 hover:text-red-400 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </td>
      </tr>

      {/* Expanded member list */}
      {isExpanded && (
        <tr className="bg-admin-surface/20">
          <td colSpan={TABLE_COLUMNS} className="px-4 pb-4 pt-1">
            <div className="ml-10 rounded-admin-md border border-[rgba(244,114,182,0.14)] bg-admin-card p-4">
              {/* Header: title, capacity bar, manage button */}
              <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-admin bg-[rgba(244,114,182,0.15)] text-admin-primary">
                    <Users size={14} />
                  </span>
                  <p className="text-sm font-semibold text-white">Members</p>
                  <span className="rounded-full bg-admin-surface px-2 py-0.5 text-[0.65rem] font-semibold text-admin-muted">
                    {members.length}
                  </span>
                </div>

                <div className="flex min-w-[180px] flex-1 items-center gap-3 sm:max-w-xs">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-admin-surface">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#F472B6] to-[#DB2777]"
                      style={{ width: `${Math.min(100, (assigned / limit) * 100)}%` }}
                    />
                  </div>
                  <span className="whitespace-nowrap text-[0.7rem] text-admin-muted">
                    <span className="font-semibold text-white">{assigned}</span> / {limit} slots
                    {assigned >= limit && <span className="ml-1.5 font-semibold text-amber-400">· Full</span>}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onEdit(agency)}
                  className="ml-auto inline-flex items-center gap-1.5 rounded-admin border border-[rgba(244,114,182,0.2)] px-3 py-1.5 text-[0.7rem] font-semibold text-admin-primary hover:bg-[rgba(244,114,182,0.08)] transition-colors"
                >
                  <UserPlus size={13} /> Manage members
                </button>
              </div>

              {members.length > 0 ? (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {members.map((member, index) => (
                    <div
                      key={member}
                      className="group flex items-center gap-3 rounded-admin border border-[rgba(244,114,182,0.1)] bg-admin-surface/40 px-3 py-2.5 hover:border-[rgba(244,114,182,0.3)] hover:bg-admin-surface/70 transition-colors"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgba(244,114,182,0.15)] text-xs font-bold uppercase text-admin-primary">
                        {member.charAt(0)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold capitalize text-white" title={member}>
                          {member.split("@")[0].replace(/[._]/g, " ")}
                        </p>
                        <p className="truncate text-[0.68rem] text-admin-muted" title={member}>
                          {member}
                        </p>
                      </div>
                      <span className="text-[0.65rem] font-medium text-admin-subtle group-hover:hidden">
                        #{index + 1}
                      </span>
                      <button
                        type="button"
                        title="Copy email"
                        onClick={() => {
                          navigator.clipboard?.writeText(member);
                          toast.success("Email copied.");
                        }}
                        className="hidden h-6 w-6 items-center justify-center rounded-admin text-admin-muted hover:bg-admin-card hover:text-admin-primary group-hover:flex"
                      >
                        <Copy size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onEdit(agency)}
                  className="flex w-full items-center justify-center gap-2 rounded-admin border border-dashed border-[rgba(244,114,182,0.22)] px-3 py-3 text-xs text-admin-muted hover:border-admin-primary hover:text-admin-primary transition-colors"
                >
                  <UserPlus size={14} />
                  <span>No members yet. Add members</span>
                </button>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

const getWithdrawalsIdFromPath = (): string | null => {
  const [tab, section, id] = getPathSegments();
  return tab === "agency" && section === "withdrawals" && id ? id : null;
};

export const AgencyPage: React.FC = () => {
  const [filters, setFilters] = useState<AgencyListFilters>(initialFilters);
  const [isAgencyModalOpen, setIsAgencyModalOpen] = useState<boolean>(false);
  const [editingAgency, setEditingAgency] = useState<Agency | null>(null);
  const [deletingAgency, setDeletingAgency] = useState<Agency | null>(null);
  const [expandedAgencyId, setExpandedAgencyId] = useState<string | null>(null);
  const [withdrawalsAgencyId, setWithdrawalsAgencyId] = useState<string | null>(getWithdrawalsIdFromPath);

  // The withdrawals page lives at /agency/withdrawals/<id> so it survives a refresh and back/forward
  useEffect(() => subscribeToLocation(() => setWithdrawalsAgencyId(getWithdrawalsIdFromPath())), []);

  const { data, isLoading, isFetching, isError, refetch } = useAgenciesQuery(filters);
  const createMutation = useCreateAgencyMutation();
  const updateMutation = useUpdateAgencyMutation();
  const deleteMutation = useDeleteAgencyMutation();

  const agencies = data?.agencies ?? [];
  const pagination = data?.pagination;

  const updateFilter = <K extends keyof AgencyListFilters>(
    key: K,
    value: AgencyListFilters[K]
  ) => {
    setFilters((prev) => ({
      ...prev,
      page: key === "page" ? (value as number) : 1,
      [key]: value,
    }));
  };

  const handleOpenCreate = () => {
    setEditingAgency(null);
    setIsAgencyModalOpen(true);
  };

  const handleOpenEdit = (agency: Agency) => {
    setEditingAgency(agency);
    setIsAgencyModalOpen(true);
  };

  const handleAgencySubmit = async (
    payload: CreateAgencyPayload | UpdateAgencyPayload
  ) => {
    try {
      if (editingAgency) {
        await updateMutation.mutateAsync({
          id: editingAgency.id,
          payload: payload as UpdateAgencyPayload,
        });
        toast.success("Agency updated successfully.");
      } else {
        await createMutation.mutateAsync(payload as CreateAgencyPayload);
        toast.success("Agency created successfully.");
      }
      setIsAgencyModalOpen(false);
      setEditingAgency(null);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to save agency."
      );
    }
  };

  const handleToggleStatus = async (agency: Agency) => {
    const nextStatus = agency.status === "active" ? "inactive" : "active";
    try {
      await updateMutation.mutateAsync({ id: agency.id, payload: { status: nextStatus } });
      toast.success(`${agency.name} is now ${nextStatus}.`);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to update agency status."
      );
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingAgency) return;
    try {
      await deleteMutation.mutateAsync(deletingAgency.id);
      toast.success("Agency deleted successfully.");
      setDeletingAgency(null);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to delete agency."
      );
    }
  };

  if (withdrawalsAgencyId) {
    return (
      <AgencyWithdrawalsPage
        agencyId={withdrawalsAgencyId}
        onBack={() => {
          navigate("/agency");
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">Agencies</h1>
            <span className="rounded-full bg-[rgba(244,114,182,0.12)] px-2 py-0.5 text-[0.68rem] font-semibold text-admin-primary">
              Super Admin
            </span>
          </div>
          <p className="mt-1 text-xs text-admin-muted sm:text-sm">
            Manage partner agencies, their commission and the members assigned to them.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 rounded-admin bg-gradient-to-r from-[#F472B6] to-[#DB2777] px-4 py-2.5 text-xs font-semibold text-white hover:opacity-95 active:scale-95 transition-all sm:text-sm"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Create Agency</span>
        </button>
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-subtle" />
          <input
            type="text"
            placeholder="Search by agency name or email..."
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="w-full rounded-admin border border-[rgba(244,114,182,0.16)] bg-admin-card py-2.5 pl-9 pr-3 text-xs text-white outline-none placeholder:text-admin-subtle focus:border-admin-primary sm:text-sm transition-colors"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="w-full sm:w-44">
            <Dropdown
              value={filters.status}
              onChange={(val) => updateFilter("status", val as AgencyListFilters["status"])}
              options={statusFilterOptions}
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

      {/* ── Agency Table ── */}
      {isLoading ? (
        <div className="py-20 text-center text-sm text-admin-muted">
          <div className="mb-3 inline-block h-8 w-8 animate-spin rounded-full border-2 border-admin-primary border-t-transparent" />
          <p>Loading agencies...</p>
        </div>
      ) : isError ? (
        <div className="rounded-admin-md border border-red-500/20 bg-admin-card py-14 text-center text-sm text-red-400">
          <p>Failed to load agencies. Please verify your Super Admin session.</p>
          <button
            onClick={() => refetch()}
            className="mt-3 rounded-admin border border-[rgba(244,114,182,0.2)] bg-admin-surface px-4 py-2 text-xs text-white"
          >
            Retry
          </button>
        </div>
      ) : agencies.length === 0 ? (
        <div className="rounded-admin-md border border-dashed border-[rgba(244,114,182,0.22)] bg-admin-card py-16 text-center text-admin-muted">
          <Building2 size={40} className="mx-auto mb-3 text-admin-primary opacity-40" />
          <h3 className="text-base font-semibold text-white">No agencies found</h3>
          <p className="mt-1 text-xs text-admin-subtle">
            {filters.search || filters.status !== "all"
              ? "Try clearing your filters to see more results."
              : "Create your first partner agency to get started."}
          </p>
          {!filters.search && filters.status === "all" && (
            <button
              type="button"
              onClick={handleOpenCreate}
              className="mt-4 inline-flex items-center gap-1.5 rounded-admin bg-[rgba(244,114,182,0.12)] px-4 py-2 text-xs font-semibold text-admin-primary hover:bg-[rgba(244,114,182,0.2)] transition-colors"
            >
              <Plus size={14} /> Create Agency
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-admin-md border border-[rgba(244,114,182,0.16)] bg-admin-card">
          <table className="w-full min-w-[1080px] text-left text-xs">
            <thead className="bg-admin-surface/60 text-[0.65rem] uppercase tracking-wider text-admin-muted">
              <tr>
                <th className="w-10 py-3 pl-4 pr-0" />
                <th className="px-4 py-3 font-medium">Agency</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Commission</th>
                <th className="px-4 py-3 text-right font-medium">Members</th>
                <th className="px-4 py-3 text-right font-medium">Agency earned</th>
                <th className="px-4 py-3 text-right font-medium">Paid to members</th>
                <th className="px-4 py-3 text-right font-medium">Withdrawals</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(244,114,182,0.08)]">
              {agencies.map((agency) => (
                <AgencyRow
                  key={agency.id}
                  agency={agency}
                  isExpanded={expandedAgencyId === agency.id}
                  onToggleExpand={(item) =>
                    setExpandedAgencyId((prev) => (prev === item.id ? null : item.id))
                  }
                  onEdit={handleOpenEdit}
                  onDelete={setDeletingAgency}
                  onToggleStatus={handleToggleStatus}
                  isTogglingStatus={
                    updateMutation.isPending && updateMutation.variables?.id === agency.id
                  }
                  onViewWithdrawals={(item) => {
                    navigate(`/agency/withdrawals/${encodeURIComponent(item.id)}`);
                  }}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Pagination ── */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-admin-muted">
          <span>
            Page <span className="font-semibold text-white">{pagination.page}</span> of{" "}
            <span className="font-semibold text-white">{pagination.totalPages}</span> ·{" "}
            {pagination.total} agencies
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => updateFilter("page", pagination.page - 1)}
              className="flex h-8 w-8 items-center justify-center rounded-admin border border-[rgba(244,114,182,0.2)] bg-admin-card text-white disabled:opacity-40 hover:bg-admin-surface transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => updateFilter("page", pagination.page + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-admin border border-[rgba(244,114,182,0.2)] bg-admin-card text-white disabled:opacity-40 hover:bg-admin-surface transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ── Create / Edit Agency Modal ── */}
      <AgencyModal
        isOpen={isAgencyModalOpen}
        agencyData={editingAgency}
        isLoading={createMutation.isPending || updateMutation.isPending}
        onClose={() => {
          setIsAgencyModalOpen(false);
          setEditingAgency(null);
        }}
        onSubmit={handleAgencySubmit}
      />

      {/* ── Confirm Delete Agency Modal ── */}
      <ConfirmModal
        isOpen={Boolean(deletingAgency)}
        title="Delete Agency"
        message={`Are you sure you want to delete agency '${deletingAgency?.name}'? Its member list will be removed as well.`}
        confirmText="Delete Agency"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingAgency(null)}
      />
    </div>
  );
};

export default AgencyPage;
