import React, { useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "react-toastify";
import {
  AlertCircle,
  CheckCircle2,
  Edit2,
  Eye,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
  X,
  XCircle,
  Camera,
  Maximize2,
} from "lucide-react";
import Dropdown from "../../components/common/Dropdown";
import { ConfirmModal } from "../../components/ConfirmModal";
import { getCurrentAdmin, notifyAdminAuthChanged } from "../../services/auth.service";
import {
  useDeleteUserMutation,
  useReviewUserVerificationMutation,
  useUpdateUserMutation,
  useUsersQuery,
} from "../../hooks/useUsers";
import {
  AccountStatus,
  AdminUser,
  AuthProvider,
  FaceVerificationStatus,
  UpdateUserPayload,
  UserGender,
  UserRole,
} from "../../types/user.types";

interface PhotoPreviewState {
  imageUrl: string;
  angle: "center" | "left" | "right";
  userName: string;
  userEmail: string;
  allPhotos?: {
    center?: string;
    left?: string;
    right?: string;
  };
}

const initialFilters = {
  page: 1,
  limit: 10,
  search: "",
  gender: "all" as UserGender | "all",
  role: "all" as UserRole | "all",
  isBlocked: "all" as "all" | "blocked" | "unblocked",
  accountStatus: "all" as AccountStatus | "all",
  faceStatus: "all" as FaceVerificationStatus | "all",
  authProvider: "all" as AuthProvider | "all",
};

const statusColors: Record<string, { color: string; background: string }> = {
  superAdmin: { color: "#C4B5FD", background: "rgba(196, 181, 253, 0.15)" },
  admin: { color: "#F472B6", background: "rgba(244, 114, 182, 0.15)" },
  user: { color: "var(--text-muted)", background: "rgba(255, 255, 255, 0.08)" },
  approved: { color: "var(--success)", background: "var(--success-bg)" },
  rejected: { color: "#F87171", background: "var(--danger-bg)" },
  pending: { color: "var(--warning)", background: "var(--warning-bg)" },
  submitted: { color: "var(--warning)", background: "var(--warning-bg)" },
  pending_admin_approval: { color: "var(--warning)", background: "var(--warning-bg)" },
  pending_verification: { color: "var(--text-muted)", background: "rgba(255,255,255,0.08)" },
  blocked: { color: "#F87171", background: "var(--danger-bg)" },
  unblocked: { color: "var(--success)", background: "var(--success-bg)" },
};

// "pending_admin_approval" → "pending admin approval", "superAdmin" → "super Admin"
const displayStatus = (value: string) => value.replace(/_/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2");

const StatusBadge: React.FC<{ value: string }> = ({ value }) => {
  const palette = statusColors[value] || { color: "var(--text-muted)", background: "rgba(255,255,255,0.08)" };
  return (
    <span
      className="inline-flex items-center whitespace-nowrap rounded-full px-2 py-1 text-[0.72rem] font-semibold capitalize"
      style={{ color: palette.color, backgroundColor: palette.background }}
    >
      {displayStatus(value)}
    </span>
  );
};

const ModalShell: React.FC<{ title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }> = ({
  title,
  onClose,
  children,
  wide = false,
}) =>
  // Portal to body so the overlay covers the whole viewport, including the header
  createPortal(
  <div onClick={onClose} className="fixed inset-0 z-[100] flex items-center justify-center p-5 bg-black/70 backdrop-blur-sm animate-fade-in">
    <div
      onClick={(event) => event.stopPropagation()}
      className={`max-h-[90vh] w-full overflow-y-auto rounded-admin-lg border border-[rgba(244,114,182,0.2)] bg-admin-card p-6 shadow-admin ${
        wide ? "max-w-[720px]" : "max-w-[520px]"
      }`}
    >
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-[1.2rem] text-white">{title}</h3>
        <button type="button" onClick={onClose} title="Close" className="rounded-admin bg-transparent p-1.5 text-admin-muted hover:text-white">
          <X size={19} />
        </button>
      </div>
      {children}
    </div>
  </div>,
  document.body
);

const inputCls = "w-full rounded-admin border border-[rgba(244,114,182,0.2)] bg-admin-surface px-3 py-[10px] text-[0.88rem] text-white outline-none";

// ── Image Preview Modal ──
const ImagePreviewModal: React.FC<{
  preview: PhotoPreviewState;
  onClose: () => void;
  onSelectAngle: (angle: "center" | "left" | "right") => void;
}> = ({ preview, onClose, onSelectAngle }) => {
  const currentUrl = preview.allPhotos?.[preview.angle] || preview.imageUrl;
  const angleDetails: Record<"center" | "left" | "right", { title: string; hint: string }> = {
    center: { title: "Center Scan (0°)", hint: "Front-facing straight angle" },
    left: { title: "Left Scan (~30°)", hint: "Head turned 30° to the left" },
    right: { title: "Right Scan (~30°)", hint: "Head turned 30° to the right" },
  };

  const currentAngleInfo = angleDetails[preview.angle] || { title: "Face Scan", hint: "" };

  return createPortal(
    <div onClick={onClose} className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92vh] w-full max-w-[580px] flex-col overflow-hidden rounded-admin-lg border border-[rgba(244,114,182,0.3)] bg-admin-card shadow-2xl"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[rgba(244,114,182,0.15)] bg-admin-surface px-5 py-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[1.1rem] font-bold text-white">{preview.userName}</h3>
              <span className="rounded-full bg-admin-primary-glow px-2.5 py-0.5 text-[0.72rem] font-semibold text-admin-primary">
                {currentAngleInfo.title}
              </span>
            </div>
            <p className="mt-0.5 text-[0.78rem] text-admin-muted">
              {preview.userEmail} • {currentAngleInfo.hint}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            title="Close preview"
            className="rounded-admin bg-transparent p-1.5 text-admin-muted hover:bg-white/10 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Angle Selector Tabs */}
        {preview.allPhotos && (
          <div className="flex items-center gap-2 border-b border-[rgba(244,114,182,0.1)] bg-admin-card px-5 py-2.5">
            {(["center", "left", "right"] as const).map((angleKey) => {
              const url = preview.allPhotos?.[angleKey];
              const isSelected = preview.angle === angleKey;
              const hasImg = Boolean(url && url.trim().length > 0);

              return (
                <button
                  key={angleKey}
                  type="button"
                  disabled={!hasImg}
                  onClick={() => onSelectAngle(angleKey)}
                  className={`flex items-center gap-1.5 rounded-admin px-3 py-1.5 text-[0.78rem] font-semibold capitalize transition-all ${
                    isSelected
                      ? "bg-admin-primary text-[#120E10] shadow-[0_0_10px_rgba(244,114,182,0.4)]"
                      : hasImg
                      ? "bg-admin-surface text-admin-muted hover:bg-white/10 hover:text-white"
                      : "bg-transparent text-white/20 cursor-not-allowed"
                  }`}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{
                      backgroundColor: isSelected
                        ? "#120E10"
                        : hasImg
                        ? "var(--primary)"
                        : "rgba(255,255,255,0.2)",
                    }}
                  />
                  {angleKey} {hasImg ? "" : "(No photo)"}
                </button>
              );
            })}
          </div>
        )}

        {/* Image Preview Container */}
        <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-black/60 p-4">
          {currentUrl ? (
            <img
              src={currentUrl}
              alt={`${preview.userName} - ${preview.angle}`}
              className="max-h-[55vh] w-auto max-w-full rounded-admin-md object-contain shadow-md"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          ) : (
            <div className="flex h-64 flex-col items-center justify-center text-admin-muted">
              <Camera size={48} className="opacity-30 mb-2" />
              <p className="text-[0.88rem]">No photo recorded for {preview.angle} angle</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-[rgba(244,114,182,0.15)] bg-admin-surface px-5 py-3 text-[0.8rem] text-admin-muted">
          <span>
            Showing angle: <strong className="text-white capitalize">{preview.angle}</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-admin bg-admin-card px-4 py-1.5 text-[0.82rem] font-semibold text-white hover:bg-white/10"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// ── Single Thumbnail Button with Error Fallback ──
const ThumbnailButton: React.FC<{
  label: string;
  short: string;
  url?: string;
  userName: string;
  userEmail: string;
  photos: any;
  angleKey: "center" | "left" | "right";
  onPreview: (preview: PhotoPreviewState) => void;
}> = ({ label, short, url, userName, userEmail, photos, angleKey, onPreview }) => {
  const [hasError, setHasError] = useState(false);
  const isValid = Boolean(url && url.trim().length > 0) && !hasError;

  return (
    <button
      type="button"
      disabled={!isValid}
      onClick={() => {
        if (isValid && url) {
          onPreview({
            imageUrl: url,
            angle: angleKey,
            userName,
            userEmail,
            allPhotos: photos,
          });
        }
      }}
      title={isValid ? `Click to preview ${label} face scan (${userName})` : `No ${label} photo available`}
      className={`group relative flex h-[50px] w-[50px] shrink-0 items-center justify-center overflow-hidden rounded-lg border transition-all duration-200 ${
        isValid
          ? "border-[rgba(244,114,182,0.45)] bg-admin-surface hover:border-admin-primary hover:shadow-[0_0_14px_rgba(244,114,182,0.55)] hover:scale-105 cursor-pointer"
          : "border-white/10 bg-white/5 opacity-40 cursor-default"
      }`}
    >
      {isValid && url ? (
        <>
          <img
            src={url}
            alt={`${label} scan`}
            onError={() => setHasError(true)}
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-110"
          />
          <span className="absolute bottom-0 right-0 rounded-tl-md bg-black/90 px-1.5 py-[2px] text-[0.65rem] font-extrabold text-admin-primary leading-none shadow">
            {short}
          </span>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center">
          <span className="text-[0.85rem] font-bold text-admin-muted">
            {short}
          </span>
        </div>
      )}
    </button>
  );
};

// ── Face Photo 3-Angle Thumbnails Component ──
const FacePhotoThumbnails: React.FC<{
  user: AdminUser;
  onPreview: (preview: PhotoPreviewState) => void;
}> = ({ user, onPreview }) => {
  const photos = user.faceVerification?.photos || (user as any).photos || { center: "", left: "", right: "" };

  const angles: Array<{ key: "center" | "left" | "right"; label: string; short: string }> = [
    { key: "center", label: "Center", short: "C" },
    { key: "left", label: "Left", short: "L" },
    { key: "right", label: "Right", short: "R" },
  ];

  return (
    <div className="flex items-center gap-2">
      {angles.map(({ key, label, short }) => (
        <ThumbnailButton
          key={key}
          label={label}
          short={short}
          url={photos[key]}
          userName={user.name}
          userEmail={user.email}
          photos={photos}
          angleKey={key}
          onPreview={onPreview}
        />
      ))}
    </div>
  );
};

export const UserManagementPage: React.FC = () => {
  const [filters, setFilters] = useState(initialFilters);
  const [viewingUser, setViewingUser] = useState<AdminUser | null>(null);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  // Admins and Super Admins can both grant the Super Admin role
  const canGrantSuperAdmin = ["admin", "superAdmin"].includes(getCurrentAdmin()?.role ?? "");
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);
  const [blockingUser, setBlockingUser] = useState<{ user: AdminUser; targetBlocked: boolean } | null>(null);
  const [rejectingUser, setRejectingUser] = useState<AdminUser | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [approvingUser, setApprovingUser] = useState<AdminUser | null>(null);
  const [editDraft, setEditDraft] = useState<UpdateUserPayload | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<PhotoPreviewState | null>(null);

  const { data, isLoading, isFetching, isError, refetch } = useUsersQuery(filters);
  const updateMutation = useUpdateUserMutation();
  const deleteMutation = useDeleteUserMutation();
  const reviewMutation = useReviewUserVerificationMutation();
  const users = data?.users || [];
  const pagination = data?.pagination;

  const showError = (error: any, fallback: string) => {
    toast.error(error?.response?.data?.message || error?.message || fallback);
  };

  const updateFilter = (key: string, value: string) => {
    setFilters((current) => ({ ...current, [key]: value, page: 1 }));
  };

  const handleConfirmApprove = async () => {
    if (!approvingUser) return;
    try {
      await reviewMutation.mutateAsync({ id: approvingUser.id, payload: { status: "approved" } });
      setApprovingUser(null);
      toast.success(`${approvingUser.name}'s verification approved successfully.`);
    } catch (error) {
      showError(error, "Failed to approve verification.");
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingUser) return;
    try {
      await reviewMutation.mutateAsync({
        id: rejectingUser.id,
        payload: { status: "rejected", rejectionReason: rejectionReason.trim() },
      });
      setRejectingUser(null);
      setRejectionReason("");
      toast.success(`${rejectingUser.name}'s verification rejected.`);
    } catch (error) {
      showError(error, "Failed to reject verification.");
    }
  };

  const handleConfirmToggleBlock = async () => {
    if (!blockingUser) return;
    try {
      await updateMutation.mutateAsync({
        id: blockingUser.user.id,
        payload: {
          firstName: blockingUser.user.firstName,
          lastName: blockingUser.user.lastName,
          email: blockingUser.user.email,
          gender: blockingUser.user.gender,
          role: blockingUser.user.role,
          accountStatus: blockingUser.user.accountStatus,
          tokenBalance: blockingUser.user.tokenBalance,
          profileImage: blockingUser.user.profileImage,
          isBlocked: blockingUser.targetBlocked,
        },
      });
      toast.success(
        blockingUser.targetBlocked
          ? `${blockingUser.user.name}'s account has been blocked.`
          : `${blockingUser.user.name}'s account has been unblocked.`
      );
      setBlockingUser(null);
    } catch (error) {
      showError(error, `Failed to ${blockingUser.targetBlocked ? "block" : "unblock"} user.`);
    }
  };

  const openEdit = (user: AdminUser) => {
    setEditingUser(user);
    setEditDraft({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      gender: user.gender,
      role: user.role,
      isBlocked: Boolean(user.isBlocked),
      accountStatus: user.accountStatus,
      tokenBalance: user.tokenBalance,
      profileImage: user.profileImage,
    });
  };

  const handleUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingUser || !editDraft) return;
    try {
      await updateMutation.mutateAsync({ id: editingUser.id, payload: editDraft });
      // Editing your own account can change your role: refresh the sidebar tabs right away
      if (editingUser.id === getCurrentAdmin()?._id) notifyAdminAuthChanged();
      setEditingUser(null);
      setEditDraft(null);
      toast.success("User updated successfully.");
    } catch (error) {
      showError(error, "Failed to update user.");
    }
  };

  const handleDelete = async () => {
    if (!deletingUser) return;
    try {
      await deleteMutation.mutateAsync(deletingUser.id);
      setDeletingUser(null);
      toast.success("User deleted successfully.");
    } catch (error) {
      showError(error, "Failed to delete user.");
    }
  };

  return (
    <div className="mx-auto flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-[14px]">
          <div
            className="flex h-[52px] w-[52px] items-center justify-center rounded-[14px] border border-[rgba(244,114,182,0.35)] text-admin-primary"
            style={{
              background: "linear-gradient(135deg, rgba(244,114,182,0.22), rgba(219,39,119,0.12))",
            }}
          >
            <UserRound size={25} />
          </div>
          <div>
            <h2 className="text-[1.65rem] font-bold text-white">User Management</h2>
            <p className="mt-[3px] text-[0.85rem] text-admin-muted">
              Review accounts, face biometric photos, and access details.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          title="Refresh users"
          className="flex items-center gap-2 rounded-admin border border-[rgba(244,114,182,0.2)] bg-admin-surface px-[14px] py-[9px] text-admin-muted hover:text-white"
        >
          <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Filters Row */}
      <div className="grid gap-2.5 rounded-admin-md border border-[rgba(244,114,182,0.2)] bg-admin-card p-4 lg:grid-cols-[minmax(200px,2fr)_repeat(6,minmax(120px,1fr))]">
        <div className="relative">
          <Search size={16} color="var(--text-muted)" className="absolute left-3 top-[13px]" />
          <input
            value={filters.search}
            onChange={(event) => updateFilter("search", event.target.value)}
            placeholder="Search name or email"
            className={`${inputCls} pl-9`}
          />
        </div>
        <Dropdown value={filters.isBlocked} onChange={(value) => updateFilter("isBlocked", value)} options={[{ value: "all", label: "All access" }, { value: "unblocked", label: "Unblocked" }, { value: "blocked", label: "Blocked" }]} />
        <Dropdown value={filters.gender} onChange={(value) => updateFilter("gender", value)} options={[{ value: "all", label: "All genders" }, { value: "female", label: "Female" }, { value: "male", label: "Male" }, { value: "", label: "Not specified" }]} />
        <Dropdown value={filters.faceStatus} onChange={(value) => updateFilter("faceStatus", value)} options={[{ value: "all", label: "Face: all" }, { value: "pending", label: "Face: pending" }, { value: "submitted", label: "Face: submitted" }, { value: "approved", label: "Face: approved" }, { value: "rejected", label: "Face: rejected" }]} />
        <Dropdown value={filters.accountStatus} onChange={(value) => updateFilter("accountStatus", value)} options={[{ value: "all", label: "All accounts" }, { value: "approved", label: "Approved" }, { value: "pending_admin_approval", label: "Pending approval" }, { value: "pending_verification", label: "Pending verification" }, { value: "rejected", label: "Rejected" }]} />
        <Dropdown value={filters.role} onChange={(value) => updateFilter("role", value)} options={[{ value: "all", label: "All roles" }, { value: "user", label: "Users" }, { value: "agency", label: "Agencies" }, { value: "admin", label: "Admins" }, { value: "superAdmin", label: "Super admins" }]} />
        <Dropdown value={filters.authProvider} onChange={(value) => updateFilter("authProvider", value)} options={[{ value: "all", label: "All providers" }, { value: "email", label: "Email" }, { value: "google", label: "Google" }, { value: "apple", label: "Apple" }]} />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-admin-md border border-[rgba(244,114,182,0.2)] bg-admin-card">
        {isError ? (
          <div className="py-[50px] text-center text-red-400">Unable to load users. Please try again.</div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-admin-surface">
                  {[
                    "User",
                    "Role",
                    "isBlocked",
                    "Face Photos",
                    "Status",
                    "Tokens",
                    "Created",
                    "Actions",
                    "Verification",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className={`whitespace-nowrap px-3.5 py-3 text-[0.7rem] uppercase tracking-[0.04em] text-admin-muted ${
                        heading === "isBlocked" || heading === "Tokens" || heading === "Role" ? "text-center" : "text-left"
                      }`}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 6 }).map((_, index) => (
                    <tr key={index}>
                      <td colSpan={9} className={`h-[58px] border-t border-[rgba(244,114,182,0.2)] ${index % 2 ? "bg-[rgba(244,114,182,0.025)]" : "bg-transparent"}`} />
                    </tr>
                  ))
                  : users.length === 0
                    ? (
                      <tr>
                        <td colSpan={9} className="py-14 text-center text-admin-muted">
                          No users match the current filters.
                        </td>
                      </tr>
                    )
                    : users.map((user) => {
                      const faceStatus = user.faceVerification?.status || "pending";
                      const isReviewable = faceStatus === "pending" || faceStatus === "submitted";
                      const isApproved = faceStatus === "approved";
                      const isRejected = faceStatus === "rejected";
                      return (
                        <tr key={user.id} className="border-t border-[rgba(244,114,182,0.15)] transition-colors hover:bg-white/[0.02]">
                          {/* ── 1. Combined User Column (Profile + Name + Email + Gender) ── */}
                          <td className="px-3.5 py-2.5">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-admin-primary-glow text-[0.85rem] font-bold text-admin-primary">
                                {user.profileImage ? (
                                  <img src={user.profileImage} alt="" className="h-full w-full object-cover" />
                                ) : (
                                  (user.firstName || user.email).charAt(0).toUpperCase()
                                )}
                              </div>
                              <div className="min-w-0 max-w-[210px]">
                                <div className="flex items-center gap-1.5">
                                  <span className="truncate text-[0.83rem] font-semibold text-white">
                                    {user.name}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 text-[0.74rem] text-admin-muted">
                                  <span className="truncate" title={user.email}>{user.email}</span>
                                  {user.gender && <span className="shrink-0 capitalize">• {user.gender}</span>}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* ── 2. Role Column ── */}
                          <td className="px-3.5 py-2.5 text-center">
                            <StatusBadge value={user.role} />
                          </td>

                          {/* ── 2. isBlocked Switch Toggle ── */}
                          <td className="px-3 py-2.5 text-center">
                            <div className="flex items-center justify-center">
                              <button
                                type="button"
                                role="switch"
                                aria-checked={user.isBlocked}
                                disabled={updateMutation.isPending}
                                onClick={() => setBlockingUser({ user, targetBlocked: !user.isBlocked })}
                                title={
                                  user.isBlocked
                                    ? "Blocked (Click to unblock)"
                                    : "Unblocked (Click to block)"
                                }
                                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${
                                  user.isBlocked
                                    ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]"
                                    : "bg-white/15 hover:bg-white/20"
                                }`}
                                style={
                                  user.isBlocked
                                    ? {
                                        background: "linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)",
                                        boxShadow: "0 0 8px rgba(239, 68, 68, 0.4)",
                                      }
                                    : {}
                                }
                              >
                                <span
                                  aria-hidden="true"
                                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                                    user.isBlocked ? "translate-x-4" : "translate-x-0"
                                  }`}
                                />
                              </button>
                            </div>
                          </td>

                          {/* ── 3. Face Photos (Status Badge + Photos) ── */}
                          <td className="px-3.5 py-2.5">
                            <div className="flex items-center gap-2">
                              <StatusBadge value={faceStatus} />
                              <FacePhotoThumbnails user={user} onPreview={(p) => setPreviewPhoto(p)} />
                            </div>
                          </td>

                          {/* ── 4. Status (Account Status & Email Verified) ── */}
                          <td className="px-3.5 py-2.5">
                            <div className="flex flex-col items-start gap-1">
                              <StatusBadge value={user.accountStatus} />
                              {user.isEmailVerified ? (
                                <span className="inline-flex items-center gap-1 text-[0.68rem] text-emerald-400">
                                  <CheckCircle2 size={11} /> Email verified
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[0.68rem] text-amber-400">
                                  <AlertCircle size={11} /> Email unverified
                                </span>
                              )}
                            </div>
                          </td>

                          {/* ── 5. Tokens ── */}
                          <td className="px-3 py-2.5 text-center text-[0.82rem] font-bold text-admin-primary">
                            {user.tokenBalance}
                          </td>

                          {/* ── 6. Created ── */}
                          <td className="whitespace-nowrap px-3.5 py-2.5 text-[0.78rem] text-admin-muted">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>

                          {/* ── 7. Actions (View / Edit / Delete) ── */}
                          <td className="px-3.5 py-2.5">
                            <div className="flex items-center gap-1.5">
                              <button type="button" title="View user details" onClick={() => setViewingUser(user)} className="rounded-admin bg-admin-surface p-[6px] text-admin-muted hover:text-white transition-colors"><Eye size={14} /></button>
                              <button type="button" title="Edit user" onClick={() => openEdit(user)} className="rounded-admin bg-admin-surface p-[6px] text-admin-muted hover:text-white transition-colors"><Edit2 size={14} /></button>
                              <button type="button" title="Delete user" onClick={() => setDeletingUser(user)} className="rounded-admin bg-admin-danger-bg p-[6px] text-red-400 hover:text-red-300 transition-colors"><Trash2 size={14} /></button>
                            </div>
                          </td>

                          {/* ── 8. Verification Review Actions (Approve / Reject) (Last Column) ── */}
                          <td className="px-3.5 py-2.5">
                            <div className="flex items-center gap-1.5">
                              {isReviewable && (
                                <>
                                  <button
                                    type="button"
                                    title="Approve verification"
                                    disabled={reviewMutation.isPending}
                                    onClick={() => setApprovingUser(user)}
                                    className="whitespace-nowrap rounded-admin bg-admin-success-bg px-2.5 py-1 text-[0.74rem] font-bold text-admin-success hover:bg-admin-success/20 disabled:opacity-50 transition-colors"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    type="button"
                                    title="Reject verification"
                                    disabled={reviewMutation.isPending}
                                    onClick={() => { setRejectingUser(user); setRejectionReason(""); }}
                                    className="whitespace-nowrap rounded-admin bg-admin-danger-bg px-2.5 py-1 text-[0.74rem] font-bold text-red-400 hover:bg-red-500/20 disabled:opacity-50 transition-colors"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}

                              {isApproved && (
                                <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-admin bg-admin-success-bg px-2.5 py-1 text-[0.74rem] font-bold text-admin-success">
                                  <CheckCircle2 size={12} />
                                  Approved
                                </span>
                              )}

                              {isRejected && (
                                <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-admin bg-admin-danger-bg px-2.5 py-1 text-[0.74rem] font-bold text-red-400">
                                  <XCircle size={12} />
                                  Rejected
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-[0.82rem] text-admin-muted">
          <span>{pagination.total} users total</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={filters.page <= 1}
              onClick={() => setFilters((current) => ({ ...current, page: current.page - 1 }))}
              className="rounded-admin bg-admin-surface px-3 py-[7px] text-admin-muted hover:text-white disabled:opacity-50"
            >
              Previous
            </button>
            <span>Page {pagination.page} of {pagination.totalPages}</span>
            <button
              type="button"
              disabled={filters.page >= pagination.totalPages}
              onClick={() => setFilters((current) => ({ ...current, page: current.page + 1 }))}
              className="rounded-admin bg-admin-surface px-3 py-[7px] text-admin-muted hover:text-white disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* ── Image Preview Modal ── */}
      {previewPhoto && (
        <ImagePreviewModal
          preview={previewPhoto}
          onClose={() => setPreviewPhoto(null)}
          onSelectAngle={(angle) => setPreviewPhoto({ ...previewPhoto, angle })}
        />
      )}

      {/* ── View User Modal ── */}
      {viewingUser && (
        <ModalShell title="User Details" onClose={() => setViewingUser(null)} wide>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              ["Name", viewingUser.name],
              ["Email", viewingUser.email],
              ["Gender", viewingUser.gender || "Not specified"],
              ["Role", viewingUser.role],
              ["Account access", viewingUser.isBlocked ? "Blocked" : "Unblocked"],
              ["Verification status", displayStatus(viewingUser.accountStatus)],
              ["Auth provider", viewingUser.authProvider],
              ["Token balance", String(viewingUser.tokenBalance)],
              ["Email verified", viewingUser.isEmailVerified ? "Yes" : "No"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-admin bg-admin-surface p-3">
                <div className="mb-1 text-[0.72rem] text-admin-muted">{label}</div>
                <div className="break-all text-[0.86rem] capitalize text-white">{value}</div>
              </div>
            ))}
          </div>

          {/* ── Face Verification & Biometric Photos Section ── */}
          <div className="mt-4 rounded-admin-md border border-[rgba(244,114,182,0.15)] bg-admin-surface p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h4 className="text-[0.92rem] font-bold text-white">Face Biometric Photos</h4>
                <p className="text-[0.76rem] text-admin-muted">Three-angle identity verification scans</p>
              </div>
              <StatusBadge value={viewingUser.faceVerification?.status || "pending"} />
            </div>

            {/* 3 Photos Grid */}
            <div className="grid grid-cols-3 gap-3">
              {(["center", "left", "right"] as const).map((angleKey) => {
                const photos = viewingUser.faceVerification?.photos || viewingUser.photos;
                const photoUrl = photos?.[angleKey];
                const hasImg = Boolean(photoUrl && photoUrl.trim().length > 0);

                const titles: Record<string, string> = {
                  center: "Center (0°)",
                  left: "Left (~30°)",
                  right: "Right (~30°)",
                };

                return (
                  <div
                    key={angleKey}
                    className="flex flex-col items-center rounded-admin border border-[rgba(244,114,182,0.15)] bg-admin-card p-3 text-center"
                  >
                    <span className="mb-2 text-[0.75rem] font-semibold capitalize text-admin-muted">
                      {titles[angleKey]}
                    </span>

                    {hasImg ? (
                      <div
                        onClick={() =>
                          setPreviewPhoto({
                            imageUrl: photoUrl || "",
                            angle: angleKey,
                            userName: viewingUser.name,
                            userEmail: viewingUser.email,
                            allPhotos: photos,
                          })
                        }
                        className="group relative h-24 w-24 cursor-pointer overflow-hidden rounded-admin border border-[rgba(244,114,182,0.3)] bg-admin-surface hover:border-admin-primary"
                      >
                        <img src={photoUrl} alt={angleKey} className="h-full w-full object-cover" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                          <Maximize2 size={18} className="text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex h-24 w-24 flex-col items-center justify-center rounded-admin border border-white/10 bg-white/5 text-admin-muted">
                        <Camera size={22} className="opacity-30 mb-1" />
                        <span className="text-[0.68rem]">Not uploaded</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {viewingUser.faceVerification?.rejectionReason && (
              <div className="mt-3 rounded-admin bg-admin-danger-bg p-3 border border-red-500/20">
                <span className="text-[0.74rem] font-semibold text-red-400 block mb-0.5">Rejection Reason</span>
                <p className="text-[0.82rem] text-red-300">{viewingUser.faceVerification.rejectionReason}</p>
              </div>
            )}
          </div>
        </ModalShell>
      )}

      {/* Edit User Modal */}
      {editingUser && editDraft && (
        <ModalShell title="Edit User" onClose={() => { setEditingUser(null); setEditDraft(null); }}>
          <form onSubmit={handleUpdate} className="flex flex-col gap-[14px]">
            <div className="grid grid-cols-2 gap-3">
              <label className="text-[0.8rem] text-admin-muted">
                First name
                <input value={editDraft.firstName} onChange={(event) => setEditDraft({ ...editDraft, firstName: event.target.value })} className={`${inputCls} mt-1.5`} />
              </label>
              <label className="text-[0.8rem] text-admin-muted">
                Last name
                <input value={editDraft.lastName} onChange={(event) => setEditDraft({ ...editDraft, lastName: event.target.value })} className={`${inputCls} mt-1.5`} />
              </label>
            </div>
            <label className="text-[0.8rem] text-admin-muted">
              Email
              <input type="email" required value={editDraft.email} onChange={(event) => setEditDraft({ ...editDraft, email: event.target.value })} className={`${inputCls} mt-1.5`} />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <Dropdown label="Gender" value={editDraft.gender} onChange={(value) => setEditDraft({ ...editDraft, gender: value as UserGender })} options={[{ value: "", label: "Not specified" }, { value: "female", label: "Female" }, { value: "male", label: "Male" }]} />
              <Dropdown label="Role" value={editDraft.role} onChange={(value) => setEditDraft({ ...editDraft, role: value as UserRole })} options={[{ value: "user", label: "User" }, { value: "agency", label: "Agency" }, { value: "admin", label: "Admin" }, ...(canGrantSuperAdmin || editingUser?.role === "superAdmin" ? [{ value: "superAdmin", label: "Super Admin" }] : [])]} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Dropdown label="Account access" value={editDraft.isBlocked ? "blocked" : "unblocked"} onChange={(value) => setEditDraft({ ...editDraft, isBlocked: value === "blocked" })} options={[{ value: "unblocked", label: "Unblocked (Normal access)" }, { value: "blocked", label: "Blocked (Restricted)" }]} />
              <Dropdown label="Verification status" value={editDraft.accountStatus} onChange={(value) => setEditDraft({ ...editDraft, accountStatus: value as AccountStatus })} options={[{ value: "approved", label: "Approved" }, { value: "pending_admin_approval", label: "Pending approval" }, { value: "pending_verification", label: "Pending verification" }, { value: "rejected", label: "Rejected" }]} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-[0.8rem] text-admin-muted">
                Token balance
                <input type="number" min="0" value={editDraft.tokenBalance} onChange={(event) => setEditDraft({ ...editDraft, tokenBalance: Number(event.target.value) })} className={`${inputCls} mt-1.5`} />
              </label>
              <label className="text-[0.8rem] text-admin-muted">
                Profile image URL
                <input value={editDraft.profileImage} onChange={(event) => setEditDraft({ ...editDraft, profileImage: event.target.value })} className={`${inputCls} mt-1.5`} />
              </label>
            </div>
            <div className="mt-1.5 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => { setEditingUser(null); setEditDraft(null); }}
                className="rounded-admin bg-admin-surface px-[15px] py-[9px] text-[0.85rem] font-medium text-admin-muted hover:bg-white/10 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button type="submit" disabled={updateMutation.isPending} className={`rounded-admin bg-admin-primary px-[17px] py-[9px] font-bold text-[#120E10] ${updateMutation.isPending ? "opacity-70" : ""}`}>
                {updateMutation.isPending ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        </ModalShell>
      )}

      {/* ── Approve Confirmation Modal ── */}
      {approvingUser && (
        <ModalShell title="Approve Verification" onClose={() => { if (!reviewMutation.isPending) setApprovingUser(null); }}>
          <div className="mb-5 flex items-start gap-4 rounded-admin-md border border-[rgba(16,185,129,0.25)] bg-[rgba(16,185,129,0.07)] p-4">
            <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-[rgba(16,185,129,0.18)] text-admin-success">
              <ShieldCheck size={22} />
            </div>
            <div>
              <p className="text-[0.95rem] font-semibold text-white">
                Approve <span className="text-admin-primary">{approvingUser.name}</span>
              </p>
              <p className="mt-1 text-[0.83rem] leading-[1.5] text-admin-muted">
                You are about to approve this user's face verification. Their account will be marked as verified and they will gain access to all verified-user features.
              </p>
            </div>
          </div>
          <div className="mb-5 grid grid-cols-3 gap-2">
            {([
              ["Email", approvingUser.email],
              ["Face status", approvingUser.faceVerification?.status || "pending"],
              ["Access", approvingUser.isBlocked ? "Blocked" : "Unblocked"],
            ] as [string, string][]).map(([label, value]) => (
              <div key={label} className="rounded-admin bg-admin-surface p-3">
                <div className="mb-1 text-[0.7rem] text-admin-muted">{label}</div>
                <div className="truncate text-[0.8rem] capitalize text-white">{value}</div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setApprovingUser(null)}
              disabled={reviewMutation.isPending}
              className="rounded-admin bg-admin-surface px-[15px] py-[9px] text-[0.875rem] font-medium text-admin-muted hover:bg-white/10 hover:text-white transition-colors disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmApprove}
              disabled={reviewMutation.isPending}
              className="flex items-center gap-2 rounded-admin bg-admin-success px-[18px] py-[9px] text-[0.875rem] font-semibold text-white shadow-[0_2px_14px_rgba(16,185,129,0.3)] disabled:opacity-60"
            >
              {reviewMutation.isPending ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Approving...
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  Confirm Approve
                </>
              )}
            </button>
          </div>
        </ModalShell>
      )}

      {/* ── Reject Confirmation Modal ── */}
      {rejectingUser && (
        <ModalShell title="Reject Verification" onClose={() => { if (!reviewMutation.isPending) { setRejectingUser(null); setRejectionReason(""); } }}>
          <div className="mb-5 flex items-start gap-4 rounded-admin-md border border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.07)] p-4">
            <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-[rgba(239,68,68,0.18)] text-red-400">
              <XCircle size={22} />
            </div>
            <div>
              <p className="text-[0.95rem] font-semibold text-white">
                Reject <span className="text-admin-primary">{rejectingUser.name}</span>
              </p>
              <p className="mt-1 text-[0.83rem] leading-[1.5] text-admin-muted">
                Provide a clear reason so the user knows what to correct and resubmit.
              </p>
            </div>
          </div>
          <label className="mb-1.5 block text-[0.8rem] text-admin-muted">
            Rejection reason <span className="text-red-400">*</span>
          </label>
          <textarea
            value={rejectionReason}
            onChange={(event) => setRejectionReason(event.target.value)}
            rows={4}
            placeholder="Explain clearly what the user should correct and resubmit..."
            className={`${inputCls} resize-y`}
          />
          {rejectionReason.trim().length === 0 && (
            <p className="mt-1.5 text-[0.78rem] text-red-400/80">A rejection reason is required.</p>
          )}
          <div className="mt-5 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => { setRejectingUser(null); setRejectionReason(""); }}
              disabled={reviewMutation.isPending}
              className="rounded-admin bg-admin-surface px-[15px] py-[9px] text-[0.875rem] font-medium text-admin-muted hover:bg-white/10 hover:text-white transition-colors disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmReject}
              disabled={reviewMutation.isPending || rejectionReason.trim().length === 0}
              className="flex items-center gap-2 rounded-admin bg-admin-danger px-[18px] py-[9px] text-[0.875rem] font-semibold text-white shadow-[0_2px_14px_rgba(239,68,68,0.3)] disabled:opacity-50"
            >
              {reviewMutation.isPending ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Rejecting...
                </>
              ) : (
                <>
                  <XCircle size={16} />
                  Confirm Reject
                </>
              )}
            </button>
          </div>
        </ModalShell>
      )}

      {/* ── Block / Unblock Confirmation Modal ── */}
      <ConfirmModal
        isOpen={Boolean(blockingUser)}
        title={blockingUser?.targetBlocked ? "Block User Account?" : "Unblock User Account?"}
        message={
          blockingUser
            ? blockingUser.targetBlocked
              ? `Are you sure you want to block ${blockingUser.user.name}? Their app access will be immediately restricted.`
              : `Are you sure you want to unblock ${blockingUser.user.name}? They will regain normal access to the application.`
            : ""
        }
        confirmText={blockingUser?.targetBlocked ? "Confirm Block" : "Confirm Unblock"}
        variant={blockingUser?.targetBlocked ? "danger" : "success"}
        isLoading={updateMutation.isPending}
        onCancel={() => setBlockingUser(null)}
        onConfirm={handleConfirmToggleBlock}
      />

      {/* ── Delete Confirmation Modal ── */}
      <ConfirmModal
        isOpen={Boolean(deletingUser)}
        title="Delete user?"
        message={deletingUser ? `This permanently removes ${deletingUser.name} and their account data.` : ""}
        isLoading={deleteMutation.isPending}
        onCancel={() => setDeletingUser(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default UserManagementPage;

