import React, { useState, useEffect } from "react";
import { X, Save, AlertCircle } from "lucide-react";
import { ImageUpload } from "../../components/ImageUpload";
import { FemaleIcon, MaleIcon } from "../../components/GenderIcons";
import Dropdown from "../../components/common/Dropdown";
import {
  HomeCarouselImage,
  GenderType,
  CreateCarouselPayload,
  UpdateCarouselPayload,
} from "../../types/homeCarousel.types";

interface CarouselImageFormProps {
  isOpen: boolean;
  initialData?: HomeCarouselImage | null;
  defaultGender?: GenderType;
  isLoading?: boolean;
  activeCount?: number;
  onClose: () => void;
  onSubmitCreate: (payload: CreateCarouselPayload) => Promise<void>;
  onSubmitUpdate: (payload: UpdateCarouselPayload) => Promise<void>;
}

export const CarouselImageForm: React.FC<CarouselImageFormProps> = ({
  isOpen,
  initialData,
  defaultGender = "female",
  isLoading = false,
  activeCount = 0,
  onClose,
  onSubmitCreate,
  onSubmitUpdate,
}) => {
  const isEditing = !!initialData;

  const [gender, setGender] = useState<GenderType>(initialData?.gender || defaultGender);
  const [order, setOrder] = useState<number>(initialData?.order || 1);
  const [isActive, setIsActive] = useState<boolean>(initialData ? initialData.isActive : true);
  const [title, setTitle] = useState<string>(initialData?.title || "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setGender(initialData.gender);
        setOrder(initialData.order);
        setIsActive(initialData.isActive);
        setTitle(initialData.title || "");
        setSelectedFile(null);
      } else {
        setGender(defaultGender);
        setOrder(Math.min(activeCount + 1, 5));
        setIsActive(true);
        setTitle("");
        setSelectedFile(null);
      }
      setErrorMessage("");
    }
  }, [isOpen, initialData, defaultGender, activeCount]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    // Manual client-side validation
    if (!isEditing && !selectedFile) {
      setErrorMessage("Please select an image file to upload.");
      return;
    }

    if (!gender || (gender !== "female" && gender !== "male")) {
      setErrorMessage("Target gender must be either Female or Male.");
      return;
    }

    if (isNaN(order) || order < 1 || order > 5) {
      setErrorMessage("Order must be between 1 and 5.");
      return;
    }

    try {
      if (isEditing && initialData) {
        await onSubmitUpdate({
          id: initialData._id,
          file: selectedFile || undefined,
          gender,
          order,
          isActive,
          title,
        });
      } else if (selectedFile) {
        await onSubmitCreate({
          file: selectedFile,
          gender,
          order,
          isActive,
          title,
        });
      }
      onClose();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || "Failed to save carousel image.";
      setErrorMessage(msg);
    }
  };

  return (
    <div onClick={onClose} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-5">
      <div onClick={(e) => e.stopPropagation()} className="flex max-h-[90vh] w-full max-w-[520px] flex-col gap-[18px] overflow-y-auto rounded-admin-lg border border-[rgba(244,114,182,0.2)] bg-admin-card p-6 shadow-admin">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[1.2rem] font-bold text-white">
              {isEditing ? "Edit Carousel Image" : "Add New Carousel Image"}
            </h3>
            <p className="mt-[2px] text-[0.8rem] text-admin-muted">
              {isEditing
                ? "Update display order, target gender, or replace image"
                : "Upload high-quality image for the mobile home carousel"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center rounded-admin bg-transparent p-1.5 text-admin-muted"
          >
            <X size={20} />
          </button>
        </div>

        {errorMessage && (
          <div className="flex items-center gap-2 rounded-admin border border-[rgba(244,114,182,0.2)]-danger bg-admin-danger-bg px-[14px] py-[10px] text-[0.85rem] text-red-400">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Image Upload Area */}
          <div>
            <label className="mb-1.5 block text-[0.85rem] font-semibold text-white">
              Carousel Image{" "}
              {isEditing && (
                <span className="font-normal text-admin-muted">(Leave blank to keep existing)</span>
              )}
            </label>
            <ImageUpload
              currentImageUrl={initialData?.imageUrl}
              onFileSelect={(file) => setSelectedFile(file)}
            />
          </div>

          {/* Target Gender */}
          <div>
            <label className="mb-1.5 block text-[0.85rem] font-semibold text-white">
              Target Audience
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setGender("female")}
                className={`flex items-center justify-center gap-2 rounded-admin px-[10px] py-[10px] text-[0.85rem] transition-all ${gender === "female"
                  ? "border border-admin-primary bg-admin-primary-glow font-semibold text-admin-primary"
                  : "border border-[rgba(244,114,182,0.2)] bg-admin-surface font-normal text-admin-muted"
                  }`}
              >
                <FemaleIcon size={16} />
                <span>Female (For Males)</span>
              </button>
              <button
                type="button"
                onClick={() => setGender("male")}
                className={`flex items-center justify-center gap-2 rounded-admin px-[10px] py-[10px] text-[0.85rem] transition-all ${gender === "male"
                  ? "border border-blue-500 bg-[rgba(59,130,246,0.2)] font-semibold text-blue-400"
                  : "border border-[rgba(244,114,182,0.2)] bg-admin-surface font-normal text-admin-muted"
                  }`}
              >
                <MaleIcon size={16} />
                <span>Male (For Females)</span>
              </button>
            </div>
          </div>

          {/* Slot Order & Title Row */}
          <div className="grid gap-3" style={{ gridTemplateColumns: "120px 1fr" }}>
            <div>
              <label className="mb-1.5 block text-[0.85rem] font-semibold text-white">
                Order (1–5)
              </label>
              <Dropdown
                id="carousel-order"
                value={String(order)}
                onChange={(value) => setOrder(Number(value))}
                options={[
                  { value: "1", label: "Slot 1 (Center)" },
                  { value: "2", label: "Slot 2" },
                  { value: "3", label: "Slot 3" },
                  { value: "4", label: "Slot 4" },
                  { value: "5", label: "Slot 5" },
                ]}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[0.85rem] font-semibold text-white">
                Title / Label (Optional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Featured Model 1"
                className="w-full rounded-admin border border-[rgba(244,114,182,0.2)] bg-admin-surface px-3 py-[10px] text-[0.9rem] text-white outline-none"
              />
            </div>
          </div>

          {/* Active Checkbox */}
          <label className="flex cursor-pointer items-center gap-2.5 rounded-admin border border-[rgba(244,114,182,0.2)] bg-admin-surface px-[14px] py-[10px]">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-[18px] w-[18px] cursor-pointer accent-admin-primary"
            />
            <span className="text-[0.85rem] font-medium text-white">
              Active on Mobile Carousel
            </span>
          </label>

          {/* Actions */}
          <div className="mt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-admin bg-admin-surface px-4 py-[10px] text-[0.875rem] font-medium text-admin-muted hover:bg-white/10 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`flex items-center gap-2 rounded-admin bg-admin-primary px-5 py-[10px] text-[0.875rem] font-bold text-[#120E10] shadow-glow ${isLoading ? "opacity-70" : "opacity-100"
                }`}
            >
              <Save size={16} />
              <span>{isLoading ? "Saving..." : isEditing ? "Update Image" : "Upload Image"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
