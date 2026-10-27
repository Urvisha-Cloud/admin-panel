import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Coins, AlertCircle } from "lucide-react";
import Dropdown from "../../components/common/Dropdown";
import {
  CreateTokenPackagePayload,
  PackageGender,
  TokenPackage,
  UpdateTokenPackagePayload,
} from "../../types/tokenPackage.types";

interface TokenPackageModalProps {
  isOpen: boolean;
  packageData: TokenPackage | null;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateTokenPackagePayload | UpdateTokenPackagePayload) => Promise<void>;
}

interface FormState {
  tokens: string;
  price: string;
  currency: string;
  discountPercentage: string;
  label: string;
  gender: PackageGender;
  isActive: boolean;
  sortOrder: string;
}

interface FormErrors {
  tokens?: string;
  price?: string;
  currency?: string;
  discountPercentage?: string;
  label?: string;
  gender?: string;
  sortOrder?: string;
}

const inputCls =
  "w-full rounded-admin border border-[rgba(244,114,182,0.2)] bg-admin-surface px-3 py-[10px] text-[0.88rem] text-white outline-none transition-colors focus:border-admin-primary placeholder:text-admin-subtle";

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

const statusOptions = [
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
];

export const TokenPackageModal: React.FC<TokenPackageModalProps> = ({
  isOpen,
  packageData,
  isLoading,
  onClose,
  onSubmit,
}) => {
  const isEdit = Boolean(packageData);

  const [form, setForm] = useState<FormState>({
    tokens: "",
    price: "",
    currency: "USD",
    discountPercentage: "0",
    label: "",
    gender: "male",
    isActive: true,
    sortOrder: "0",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (packageData) {
      setForm({
        tokens: String(packageData.tokens ?? ""),
        price: String(packageData.price ?? ""),
        currency: packageData.currency || "USD",
        discountPercentage: String(packageData.discountPercentage ?? 0),
        label: packageData.label || "",
        gender: packageData.gender || "male",
        isActive: packageData.isActive ?? true,
        sortOrder: String(packageData.sortOrder ?? 0),
      });
    } else {
      setForm({
        tokens: "",
        price: "",
        currency: "USD",
        discountPercentage: "0",
        label: "",
        gender: "male",
        isActive: true,
        sortOrder: "0",
      });
    }
    setErrors({});
  }, [packageData, isOpen]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    const numTokens = Number(form.tokens);
    if (!form.tokens.trim()) {
      newErrors.tokens = "Tokens count is required.";
    } else if (isNaN(numTokens) || numTokens <= 0 || !Number.isInteger(numTokens)) {
      newErrors.tokens = "Tokens must be a positive integer greater than 0.";
    }

    const numPrice = Number(form.price);
    if (!form.price.trim()) {
      newErrors.price = "Price is required.";
    } else if (isNaN(numPrice) || numPrice <= 0) {
      newErrors.price = "Price must be a positive number greater than 0.";
    }

    if (!form.currency.trim()) {
      newErrors.currency = "Currency is required (e.g. USD).";
    }

    const numDiscount = Number(form.discountPercentage);
    if (isNaN(numDiscount) || numDiscount < 0 || numDiscount > 100) {
      newErrors.discountPercentage = "Discount must be between 0 and 100%.";
    }

    if (!form.gender || !["male", "female"].includes(form.gender)) {
      newErrors.gender = "Gender is required (Male or Female).";
    }

    const numSort = Number(form.sortOrder);
    if (isNaN(numSort)) {
      newErrors.sortOrder = "Sort order must be a valid number.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || isLoading) return;

    const payload: CreateTokenPackagePayload = {
      tokens: parseInt(form.tokens, 10),
      price: parseFloat(form.price),
      currency: form.currency.trim().toUpperCase() || "USD",
      discountPercentage: parseInt(form.discountPercentage, 10) || 0,
      label: form.label.trim() ? form.label.trim() : null,
      gender: form.gender,
      isActive: form.isActive,
      sortOrder: parseInt(form.sortOrder, 10) || 0,
    };

    await onSubmit(payload);
  };

  // Portal to body so the overlay covers the whole viewport, including the header
  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center p-5 bg-black/70 backdrop-blur-sm animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-[560px] overflow-y-auto rounded-admin-lg border border-[rgba(244,114,182,0.2)] bg-admin-card p-6 shadow-admin"
      >
        {/* Header */}
        <div className="mb-5 flex items-center justify-between border-b border-[rgba(244,114,182,0.15)] pb-4">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-[10px] text-white"
              style={{
                background: "linear-gradient(135deg, #F472B6 0%, #DB2777 100%)",
                boxShadow: "0 0 12px rgba(244, 114, 182, 0.3)",
              }}
            >
              <Coins size={18} />
            </div>
            <div>
              <h3 className="text-[1.15rem] font-bold text-white">
                {isEdit ? "Edit Token Package" : "Add Token Package"}
              </h3>
              <p className="text-[0.75rem] text-admin-muted">
                {isEdit
                  ? "Update package pricing, tokens, and display properties."
                  : "Create a new token package available for in-app purchase."}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Row 1: Tokens & Price */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[0.8rem] font-semibold text-admin-muted">
                Tokens <span className="text-admin-danger">*</span>
              </label>
              <input
                type="number"
                min="1"
                step="1"
                placeholder="e.g. 100"
                value={form.tokens}
                onChange={(e) => setForm({ ...form, tokens: e.target.value })}
                className={`${inputCls} ${errors.tokens ? "border-admin-danger" : ""}`}
              />
              {errors.tokens && (
                <p className="mt-1 flex items-center gap-1 text-[0.75rem] text-admin-danger">
                  <AlertCircle size={12} /> {errors.tokens}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-[0.8rem] font-semibold text-admin-muted">
                Price <span className="text-admin-danger">*</span>
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="e.g. 9.99"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className={`${inputCls} ${errors.price ? "border-admin-danger" : ""}`}
              />
              {errors.price && (
                <p className="mt-1 flex items-center gap-1 text-[0.75rem] text-admin-danger">
                  <AlertCircle size={12} /> {errors.price}
                </p>
              )}
            </div>
          </div>

          {/* Row 2: Currency & Discount Percentage */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[0.8rem] font-semibold text-admin-muted">
                Currency <span className="text-admin-danger">*</span>
              </label>
              <input
                type="text"
                placeholder="USD"
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })}
                className={`${inputCls} ${errors.currency ? "border-admin-danger" : ""}`}
                maxLength={6}
              />
              {errors.currency && (
                <p className="mt-1 flex items-center gap-1 text-[0.75rem] text-admin-danger">
                  <AlertCircle size={12} /> {errors.currency}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-[0.8rem] font-semibold text-admin-muted">
                Discount Percentage (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                placeholder="0"
                value={form.discountPercentage}
                onChange={(e) => setForm({ ...form, discountPercentage: e.target.value })}
                className={`${inputCls} ${errors.discountPercentage ? "border-admin-danger" : ""}`}
              />
              {errors.discountPercentage && (
                <p className="mt-1 flex items-center gap-1 text-[0.75rem] text-admin-danger">
                  <AlertCircle size={12} /> {errors.discountPercentage}
                </p>
              )}
            </div>
          </div>

          {/* Row 3: Label & Gender */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[0.8rem] font-semibold text-admin-muted">
                Badge Label (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Popular, Best Value, 20% OFF"
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                className={inputCls}
                maxLength={30}
              />
              <p className="mt-1 text-[0.7rem] text-admin-subtle">
                Appears as a highlight badge over the card.
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-[0.8rem] font-semibold text-admin-muted">
                Target Gender <span className="text-admin-danger">*</span>
              </label>
              <Dropdown
                value={form.gender}
                onChange={(val) => setForm({ ...form, gender: val as PackageGender })}
                options={genderOptions}
                placeholder="Select Gender"
                error={errors.gender}
              />
            </div>
          </div>

          {/* Row 4: Status & Sort Order */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[0.8rem] font-semibold text-admin-muted">
                Status
              </label>
              <Dropdown
                value={String(form.isActive)}
                onChange={(val) => setForm({ ...form, isActive: val === "true" })}
                options={statusOptions}
                placeholder="Select Status"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[0.8rem] font-semibold text-admin-muted">
                Sort Order
              </label>
              <input
                type="number"
                step="1"
                placeholder="0"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                className={`${inputCls} ${errors.sortOrder ? "border-admin-danger" : ""}`}
              />
              <p className="mt-1 text-[0.7rem] text-admin-subtle">
                Lower numbers appear first in the app.
              </p>
              {errors.sortOrder && (
                <p className="mt-1 flex items-center gap-1 text-[0.75rem] text-admin-danger">
                  <AlertCircle size={12} /> {errors.sortOrder}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex items-center justify-end gap-3 border-t border-[rgba(244,114,182,0.15)] pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-admin bg-admin-surface px-4 py-2 text-[0.875rem] font-medium text-admin-muted transition-colors hover:bg-admin-surface/80 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 rounded-admin px-5 py-2 text-[0.875rem] font-semibold text-white shadow-[0_2px_12px_rgba(244,114,182,0.35)] transition-all hover:opacity-95 disabled:opacity-60"
              style={{
                background: "linear-gradient(135deg, #F472B6 0%, #DB2777 100%)",
              }}
            >
              {isLoading ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Saving...
                </>
              ) : isEdit ? (
                "Save Changes"
              ) : (
                "Create Package"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default TokenPackageModal;
