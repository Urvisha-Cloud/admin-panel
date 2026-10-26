import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Building2, AlertCircle, UserPlus, Users, Trash2 } from "lucide-react";
import Dropdown from "../../components/common/Dropdown";
import {
  Agency,
  CreateAgencyPayload,
  UpdateAgencyPayload,
} from "../../types/agency.types";

interface AgencyModalProps {
  isOpen: boolean;
  agencyData: Agency | null;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateAgencyPayload | UpdateAgencyPayload) => Promise<void>;
}

interface FormState {
  name: string;
  email: string;
  percentage: string;
  personCount: string;
  status: "active" | "inactive";
  members: string[];
}

interface FormErrors {
  name?: string;
  email?: string;
  percentage?: string;
  personCount?: string;
  members?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputCls =
  "w-full rounded-admin border border-[rgba(244,114,182,0.2)] bg-admin-surface px-3 py-[10px] text-[0.88rem] text-white outline-none transition-colors focus:border-admin-primary placeholder:text-admin-subtle";

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export const AgencyModal: React.FC<AgencyModalProps> = ({
  isOpen,
  agencyData,
  isLoading,
  onClose,
  onSubmit,
}) => {
  const isEdit = Boolean(agencyData);

  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    percentage: "",
    personCount: "",
    status: "active",
    members: [],
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [memberInput, setMemberInput] = useState("");

  useEffect(() => {
    if (agencyData) {
      setForm({
        name: agencyData.name || "",
        email: agencyData.email || "",
        percentage: String(agencyData.percentage ?? 20),
        personCount: String(agencyData.personCount ?? 10),
        status: agencyData.status || "active",
        members: agencyData.members || [],
      });
    } else {
      setForm({
        name: "",
        email: "",
        percentage: "",
        personCount: "",
        status: "active",
        members: [],
      });
    }
    setErrors({});
    setMemberInput("");
  }, [agencyData, isOpen]);

  if (!isOpen) return null;

  const personLimit = Math.max(Math.floor(Number(form.personCount)) || 0, 0);
  // Not a hard cap: adding a member past the limit raises Person Count to match (same rule as the server)
  const isAtCapacity = personLimit > 0 && form.members.length >= personLimit;

  const handleAddMember = () => {
    const email = memberInput.trim().toLowerCase();
    let error: string | undefined;

    if (!email) error = "Enter an email address to add";
    else if (!EMAIL_REGEX.test(email)) error = "Enter a valid email address";
    else if (email === form.email.trim().toLowerCase()) error = "The agency's own email cannot be a member";
    else if (form.members.includes(email)) error = `'${email}' is already added`;
    else if (personLimit < 1) error = "Set a valid Person Count first";

    setErrors((prev) => ({ ...prev, members: error }));
    if (error) return;

    setForm((prev) => {
      const members = [...prev.members, email];
      const limit = Math.floor(Number(prev.personCount)) || 0;
      return {
        ...prev,
        members,
        personCount: members.length > limit ? String(members.length) : prev.personCount,
      };
    });
    setMemberInput("");
  };

  const handleRemoveMember = (email: string) => {
    setForm((prev) => ({ ...prev, members: prev.members.filter((m) => m !== email) }));
    setErrors((prev) => ({ ...prev, members: undefined }));
  };

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = "Agency Name is required";
    }

    if (!form.email.trim()) {
      nextErrors.email = "Email address is required";
    } else if (!EMAIL_REGEX.test(form.email.trim())) {
      nextErrors.email = "Enter a valid email address";
    }

    const percentageNum = Number(form.percentage);
    if (form.percentage === "" || isNaN(percentageNum) || percentageNum < 0 || percentageNum > 100) {
      nextErrors.percentage = "Percentage must be between 0 and 100";
    }

    const personCountNum = Number(form.personCount);
    if (form.personCount === "" || isNaN(personCountNum) || personCountNum < 1) {
      nextErrors.personCount = "Person Count must be at least 1";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (isEdit) {
      await onSubmit({
        name: form.name.trim(),
        percentage: Number(form.percentage),
        personCount: Number(form.personCount),
        status: form.status,
        members: form.members,
      });
    } else {
      await onSubmit({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        percentage: Number(form.percentage),
        personCount: Number(form.personCount),
        members: form.members,
      });
    }
  };

  // Portal to body so the overlay covers the whole viewport, including the header
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-admin-md border border-[rgba(244,114,182,0.2)] bg-admin-card shadow-admin-card overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[rgba(244,114,182,0.2)] px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[rgba(244,114,182,0.15)] text-admin-primary">
              <Building2 size={18} strokeWidth={2.2} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                {isEdit ? "Edit Agency" : "Create New Agency"}
              </h2>
              <p className="text-xs text-admin-muted">
                {isEdit
                  ? "Update agency details and maximum person capacity"
                  : "Register a new agency account and set commission/person limits"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-admin-muted hover:bg-admin-surface hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="max-h-[75vh] overflow-y-auto px-6 py-5 space-y-4">
            {/* Agency Name */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-admin-muted">
                Agency Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Star Media Agency"
                className={`${inputCls} ${errors.name ? "border-red-400" : ""}`}
              />
              {errors.name && (
                <div className="mt-1 flex items-center gap-1 text-xs text-red-400">
                  <AlertCircle size={13} />
                  <span>{errors.name}</span>
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-admin-muted">
                Email Address <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                disabled={isEdit}
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="e.g. agency@example.com"
                className={`${inputCls} ${isEdit ? "opacity-60 cursor-not-allowed" : ""} ${
                  errors.email ? "border-red-400" : ""
                }`}
              />
              {isEdit ? (
                <p className="mt-1 text-[0.72rem] text-admin-subtle">
                  Email address cannot be changed after creation.
                </p>
              ) : errors.email ? (
                <div className="mt-1 flex items-center gap-1 text-xs text-red-400">
                  <AlertCircle size={13} />
                  <span>{errors.email}</span>
                </div>
              ) : null}
            </div>

            {/* Percentage & Person Count in a 2-column Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Percentage */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-admin-muted">
                  Percentage (%) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step="0.1"
                    value={form.percentage}
                    onChange={(e) => setForm((prev) => ({ ...prev, percentage: e.target.value }))}
                    placeholder="20"
                    className={`${inputCls} ${errors.percentage ? "border-red-400" : ""}`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-admin-subtle">
                    %
                  </span>
                </div>
                {errors.percentage && (
                  <div className="mt-1 flex items-center gap-1 text-xs text-red-400">
                    <AlertCircle size={13} />
                    <span>{errors.percentage}</span>
                  </div>
                )}
              </div>

              {/* Person Count */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-admin-muted">
                  Person Count (Limit) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  step="1"
                  value={form.personCount}
                  onChange={(e) => setForm((prev) => ({ ...prev, personCount: e.target.value }))}
                  placeholder="10"
                  className={`${inputCls} ${errors.personCount ? "border-red-400" : ""}`}
                />
                {errors.personCount && (
                  <div className="mt-1 flex items-center gap-1 text-xs text-red-400">
                    <AlertCircle size={13} />
                    <span>{errors.personCount}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Members (emails; users don't need to be registered yet).
                Shown once a Person Count is set; stays visible if members already exist. */}
            {(personLimit >= 1 || form.members.length > 0) && (
            <div className="rounded-admin border border-[rgba(244,114,182,0.16)] bg-admin-surface/40">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[rgba(244,114,182,0.12)] px-4 py-3">
                <div>
                  <label className="block text-xs font-semibold text-white">Members</label>
                  <p className="mt-0.5 text-[0.7rem] text-admin-subtle">
                    Optional. Linked automatically when they sign up with this email.
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-[0.7rem] font-semibold ${
                    isAtCapacity
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-[rgba(244,114,182,0.12)] text-admin-primary"
                  }`}
                >
                  {form.members.length} / {personLimit || "–"}
                  {isAtCapacity ? " · Full" : ""}
                </span>
              </div>

              <div className="space-y-3 p-4">
                {/* Limit reached is only a note; adding more raises Person Count */}
                {isAtCapacity && (
                  <div className="flex items-center gap-2 rounded-admin bg-emerald-500/10 px-3 py-2 text-[0.75rem] text-emerald-300">
                    <Users size={14} className="shrink-0" />
                    <span>Person Count reached. Adding another member raises the limit automatically.</span>
                  </div>
                )}
                <div>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={memberInput}
                      onChange={(e) => {
                        setMemberInput(e.target.value);
                        if (errors.members) setErrors((prev) => ({ ...prev, members: undefined }));
                      }}
                      onKeyDown={(e) => {
                        // Enter adds the email instead of submitting the whole form
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddMember();
                        }
                      }}
                      placeholder="Enter member email and press Enter"
                      className={`${inputCls} ${errors.members ? "border-red-400" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={handleAddMember}
                      disabled={!memberInput.trim()}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-admin bg-gradient-to-r from-[#F472B6] to-[#DB2777] px-3.5 text-xs font-semibold text-white hover:opacity-95 disabled:opacity-40 transition-opacity"
                    >
                      <UserPlus size={14} />
                      <span>Add</span>
                    </button>
                  </div>
                </div>

                {errors.members && (
                  <div className="flex items-center gap-1 text-xs text-red-400">
                    <AlertCircle size={13} />
                    <span>{errors.members}</span>
                  </div>
                )}

                {/* Member list */}
                {form.members.length > 0 ? (
                  <ul className="max-h-48 divide-y divide-[rgba(244,114,182,0.1)] overflow-y-auto rounded-admin border border-[rgba(244,114,182,0.12)] bg-admin-card">
                    {form.members.map((member, index) => (
                      <li key={member} className="group flex items-center gap-3 px-3 py-2">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[rgba(244,114,182,0.12)] text-[0.65rem] font-semibold text-admin-primary">
                          {index + 1}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-[0.8rem] text-white" title={member}>
                          {member}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(member)}
                          title="Remove member"
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-admin text-admin-subtle hover:bg-red-500/15 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex items-center justify-center gap-2 rounded-admin border border-dashed border-[rgba(244,114,182,0.2)] px-3 py-4 text-[0.75rem] text-admin-subtle">
                    <Users size={14} className="shrink-0 text-admin-primary opacity-60" />
                    <span>No members added yet</span>
                  </div>
                )}
              </div>
            </div>
            )}

            {/* Status Dropdown (when editing) */}
            {isEdit && (
              <div>
                <label className="mb-1.5 block text-xs font-medium text-admin-muted">
                  Agency Status
                </label>
                <Dropdown
                  value={form.status}
                  onChange={(val) => setForm((prev) => ({ ...prev, status: val as "active" | "inactive" }))}
                  options={statusOptions}
                />
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-[rgba(244,114,182,0.2)] bg-admin-card px-6 py-4">
            <button
              type="button"
              disabled={isLoading}
              onClick={onClose}
              className="rounded-admin border border-[rgba(244,114,182,0.25)] bg-admin-surface px-4 py-2 text-xs font-medium text-admin-muted hover:bg-[rgba(244,114,182,0.1)] hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center rounded-admin bg-gradient-to-r from-[#F472B6] to-[#DB2777] px-5 py-2 text-xs font-semibold text-white shadow-[0_0_15px_rgba(244,114,182,0.3)] hover:opacity-95 active:scale-95 disabled:opacity-50 transition-all"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Saving...</span>
                </div>
              ) : (
                <span>{isEdit ? "Update Agency" : "Create Agency"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
