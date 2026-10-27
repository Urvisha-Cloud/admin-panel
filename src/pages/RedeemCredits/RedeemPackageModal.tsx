import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, CircleDollarSign, AlertCircle, Coins, DollarSign, Loader2 } from "lucide-react";
import Dropdown from "../../components/common/Dropdown";
import { ImageUpload } from "../../components/ImageUpload";
import { useUploadRedeemPackageImageMutation } from "../../hooks/useRedeemPackages";
import {
  CreateRedeemPackagePayload,
  RedeemPackage,
  UpdateRedeemPackagePayload,
} from "../../types/redeemPackage.types";

interface RedeemPackageModalProps {
  isOpen: boolean;
  packageData: RedeemPackage | null;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateRedeemPackagePayload | UpdateRedeemPackagePayload) => Promise<void>;
}

interface FormState {
  title: string;
  icon: string;
  requiredTokens: string;
  creditValue: string;
  displayOrder: string;
  isActive: boolean;
}

interface FormErrors {
  title?: string;
  icon?: string;
  requiredTokens?: string;
  creditValue?: string;
  displayOrder?: string;
}

const inputCls =
  "w-full rounded-admin border border-[rgba(244,114,182,0.2)] bg-admin-surface px-3 py-[10px] text-[0.88rem] text-white outline-none transition-colors focus:border-admin-primary placeholder:text-admin-subtle";

const statusOptions = [
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
];

export const RedeemPackageModal: React.FC<RedeemPackageModalProps> = ({
  isOpen,
  packageData,
  isLoading,
  onClose,
  onSubmit,
}) => {
  const isEdit = Boolean(packageData);
  const uploadImageMutation = useUploadRedeemPackageImageMutation();

  const [form, setForm] = useState<FormState>({
    title: "",
    icon: "",
    requiredTokens: "",
    creditValue: "",
    displayOrder: "0",
    isActive: true,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isUploading, setIsUploading] = useState<boolean>(false);

  useEffect(() => {
    if (packageData) {
      setForm({
        title: packageData.title || "",
        icon: packageData.icon || "",
        requiredTokens: String(packageData.requiredTokens ?? ""),
        creditValue: String(packageData.creditValue ?? ""),
        displayOrder: String(packageData.displayOrder ?? 0),
        isActive: packageData.isActive ?? true,
      });
    } else {
      setForm({
        title: "",
        icon: "",
        requiredTokens: "",
        creditValue: "",
        displayOrder: "0",
        isActive: true,
      });
    }
    setErrors({});
    setIsUploading(false);
  }, [packageData, isOpen]);

  if (!isOpen) return null;

  const handleImageFileSelect = async (file: File | null) => {
    if (!file) {
      setForm((prev) => ({ ...prev, icon: "" }));
      return;
    }

    try {
      setIsUploading(true);
      setErrors((prev) => ({ ...prev, icon: undefined }));
      const uploadedUrl = await uploadImageMutation.mutateAsync(file);
      setForm((prev) => ({ ...prev, icon: uploadedUrl }));
    } catch (err: any) {
      setErrors((prev) => ({
        ...prev,
        icon: err?.message || "Failed to upload package image.",
      }));
    } finally {
      setIsUploading(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.title.trim()) {
      newErrors.title = "Package title is required.";
    }

    if (!form.icon || !form.icon.trim()) {
      newErrors.icon = "Package icon is required.";
    }

    const numTokens = Number(form.requiredTokens);
    if (!form.requiredTokens.trim()) {
      newErrors.requiredTokens = "Required tokens is required.";
    } else if (isNaN(numTokens) || numTokens <= 0 || !Number.isInteger(numTokens)) {
      newErrors.requiredTokens = "Required tokens must be a positive integer.";
    }

    const numCredit = Number(form.creditValue);
    if (!form.creditValue.trim()) {
      newErrors.creditValue = "Credit value is required.";
    } else if (isNaN(numCredit) || numCredit <= 0) {
      newErrors.creditValue = "Credit value must be a positive number.";
    }

    const numOrder = Number(form.displayOrder);
    if (form.displayOrder !== "" && (isNaN(numOrder) || numOrder < 0)) {
      newErrors.displayOrder = "Display order must be a non-negative number.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || isUploading) return;

    const payload: CreateRedeemPackagePayload = {
      title: form.title.trim(),
      icon: form.icon.trim(),
      requiredTokens: Number(form.requiredTokens),
      creditValue: Number(form.creditValue),
      displayOrder: Number(form.displayOrder) || 0,
      isActive: form.isActive,
    };

    await onSubmit(payload);
  };

  // Portal to body so the overlay covers the whole viewport, including the header
  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center p-5 bg-black/70 backdrop-blur-sm animate-fade-in"
    >
      {/* Modal Dialog */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-[480px] overflow-y-auto rounded-admin-lg border border-[rgba(244,114,182,0.2)] bg-admin-card p-5 sm:p-6 shadow-admin"
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between border-b border-[rgba(244,114,182,0.15)] pb-3.5">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-[10px] text-white"
              style={{
                background: "linear-gradient(135deg, #F472B6 0%, #DB2777 100%)",
                boxShadow: "0 0 12px rgba(244, 114, 182, 0.3)",
              }}
            >
              <CircleDollarSign size={18} />
            </div>
            <div>
              <h3 className="text-[1.1rem] font-bold text-white">
                {isEdit ? "Edit Redeem Package" : "Create Redeem Package"}
              </h3>
              <p className="text-[0.75rem] text-admin-muted">
                {isEdit
                  ? "Update package details, token cost & credit payout."
                  : "Add a new token to credit conversion package for users."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            title="Close"
            className="rounded-admin bg-transparent p-1.5 text-admin-muted transition-colors hover:bg-admin-surface hover:text-white"
          >
            <X size={19} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {/* Title */}
          <div>
            <label className="mb-1.5 block text-[0.8rem] font-semibold text-admin-muted">
              Package Title <span className="text-pink-400">*</span>
            </label>
            <input
              type="text"
              className={inputCls}
              placeholder="e.g. 3 Star, 5 Coins, Diamond"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            />
            {errors.title && (
              <p className="mt-1 flex items-center gap-1 text-xs text-red-400">
                <AlertCircle size={12} /> {errors.title}
              </p>
            )}
          </div>

          {/* Image Upload Component (Compact Mode) */}
          <div>
            <label className="mb-1.5 block text-[0.8rem] font-semibold text-admin-muted">
              Package Icon / Image <span className="text-pink-400">*</span>
            </label>
            <ImageUpload
              currentImageUrl={form.icon || undefined}
              onFileSelect={handleImageFileSelect}
              error={errors.icon}
              compact={true}
            />
            {isUploading && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-pink-400">
                <Loader2 size={13} className="animate-spin" /> Uploading image to storage...
              </p>
            )}
          </div>

          {/* Tokens and Credits in 2 columns */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[0.8rem] font-semibold text-admin-muted">
                Required Tokens <span className="text-pink-400">*</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-admin-muted">
                  <Coins size={15} />
                </div>
                <input
                  type="number"
                  min="1"
                  className={`${inputCls} pl-9`}
                  placeholder="e.g. 100"
                  value={form.requiredTokens}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, requiredTokens: e.target.value }))
                  }
                />
              </div>
              {errors.requiredTokens && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-400">
                  <AlertCircle size={12} /> {errors.requiredTokens}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-[0.8rem] font-semibold text-admin-muted">
                Credit Value ($) <span className="text-pink-400">*</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-admin-muted">
                  <DollarSign size={15} />
                </div>
                <input
                  type="number"
                  min="1"
                  className={`${inputCls} pl-9`}
                  placeholder="e.g. 500"
                  value={form.creditValue}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, creditValue: e.target.value }))
                  }
                />
              </div>
              {errors.creditValue && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-400">
                  <AlertCircle size={12} /> {errors.creditValue}
                </p>
              )}
            </div>
          </div>

          {/* Display Order and Status in 2 columns */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[0.8rem] font-semibold text-admin-muted">
                Display Order
              </label>
              <input
                type="number"
                min="0"
                className={inputCls}
                placeholder="0"
                value={form.displayOrder}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, displayOrder: e.target.value }))
                }
              />
              {errors.displayOrder && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-400">
                  <AlertCircle size={12} /> {errors.displayOrder}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-[0.8rem] font-semibold text-admin-muted">
                Status
              </label>
              <Dropdown
                options={statusOptions}
                value={String(form.isActive)}
                onChange={(val) =>
                  setForm((prev) => ({ ...prev, isActive: val === "true" }))
                }
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="mt-4 flex items-center justify-end gap-3 border-t border-[rgba(244,114,182,0.15)] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-admin border border-[rgba(244,114,182,0.2)] bg-admin-surface px-4 py-2.5 text-[0.85rem] font-semibold text-admin-muted transition-colors hover:bg-admin-surface/80 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center justify-center gap-2 rounded-admin px-5 py-2.5 text-[0.88rem] font-semibold text-white shadow-[0_2px_12px_rgba(244,114,182,0.35)] transition-all duration-200 hover:opacity-95 active:scale-[0.98] disabled:opacity-50"
              style={{
                background: "linear-gradient(135deg, #F472B6 0%, #DB2777 100%)",
              }}
            >
              <span>{isLoading ? "Saving..." : isEdit ? "Save Changes" : "Create Package"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default RedeemPackageModal;
