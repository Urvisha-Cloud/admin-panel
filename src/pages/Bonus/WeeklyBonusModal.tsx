import React, { useState, useEffect } from "react";
import {
  X,
  Gift,
  Calendar,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import Dropdown from "../../components/common/Dropdown";
import { ImageUpload } from "../../components/ImageUpload";
import { useUploadBonusImageMutation } from "../../hooks/useBonusQueries";
import {
  WeeklyBonus,
  BonusDayConfig,
  BonusRewardType,
  CreateWeeklyBonusPayload,
  UpdateWeeklyBonusPayload,
} from "../../types/bonus.types";

interface WeeklyBonusModalProps {
  isOpen: boolean;
  bonusData: WeeklyBonus | null;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateWeeklyBonusPayload | UpdateWeeklyBonusPayload) => Promise<void>;
}

const inputCls =
  "w-full rounded-admin border border-[rgba(244,114,182,0.2)] bg-admin-surface px-3 py-[10px] text-[0.88rem] text-white outline-none transition-colors focus:border-admin-primary placeholder:text-admin-subtle";

const rewardTypeOptions = [
  { value: "token", label: "Token (Coins)" },
  { value: "star", label: "Star" },
  { value: "video", label: "Video Call (Minutes)" },
  { value: "private_call", label: "Private Call (Minutes)" },
  { value: "chat", label: "Chat / Message Pass" },
  { value: "flower", label: "Flower / Heart" },
  { value: "emoji", label: "Emoji / Sticker" },
  { value: "gift", label: "Special Gift" },
  { value: "surprise", label: "Surprise Treasure" },
];

const defaultDays: BonusDayConfig[] = [
  {
    dayNumber: 1,
    dayName: "Monday",
    rewardType: "token",
    title: "+10 Tokens",
    description: "Day 1 check-in bonus reward",
    value: 10,
    tokenAmount: 10,
    image: "",
    isActive: true,
  },
  {
    dayNumber: 2,
    dayName: "Tuesday",
    rewardType: "star",
    title: "5-Star",
    description: "Day 2 check-in 5-star reward",
    value: 5,
    tokenAmount: 0,
    image: "",
    isActive: true,
  },
  {
    dayNumber: 3,
    dayName: "Wednesday",
    rewardType: "flower",
    title: "Flower",
    description: "Day 3 check-in flower reward",
    value: 1,
    tokenAmount: 0,
    image: "",
    isActive: true,
  },
  {
    dayNumber: 4,
    dayName: "Thursday",
    rewardType: "token",
    title: "+25 Tokens",
    description: "Day 4 check-in token reward",
    value: 25,
    tokenAmount: 25,
    image: "",
    isActive: true,
  },
  {
    dayNumber: 5,
    dayName: "Friday",
    rewardType: "chat",
    title: "Chat Pass",
    description: "Day 5 check-in chat pass reward",
    value: 1,
    tokenAmount: 0,
    image: "",
    isActive: true,
  },
  {
    dayNumber: 6,
    dayName: "Saturday",
    rewardType: "flower",
    title: "Heart Pass",
    description: "Day 6 check-in heart pass reward",
    value: 1,
    tokenAmount: 0,
    image: "",
    isActive: true,
  },
  {
    dayNumber: 7,
    dayName: "Sunday",
    rewardType: "surprise",
    title: "Surprise (+50 Tokens)",
    description: "Special Sunday mystery treasure",
    value: 50,
    tokenAmount: 50,
    image: "",
    isActive: true,
  },
];

export const WeeklyBonusModal: React.FC<WeeklyBonusModalProps> = ({
  isOpen,
  bonusData,
  isLoading,
  onClose,
  onSubmit,
}) => {
  const isEdit = Boolean(bonusData);
  const [selectedDayTab, setSelectedDayTab] = useState<number>(1);
  const [title, setTitle] = useState<string>("Standard Weekly Bonus");
  const [description, setDescription] = useState<string>("7-day check-in rewards");
  const [isActive, setIsActive] = useState<boolean>(true);
  const [days, setDays] = useState<BonusDayConfig[]>(defaultDays);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);

  const uploadImageMutation = useUploadBonusImageMutation();

  useEffect(() => {
    if (bonusData) {
      setTitle(bonusData.title || "Standard Weekly Bonus");
      setDescription(bonusData.description || "");
      setIsActive(bonusData.isActive ?? true);
      if (Array.isArray(bonusData.days) && bonusData.days.length === 7) {
        setDays(JSON.parse(JSON.stringify(bonusData.days)));
      } else {
        setDays(defaultDays);
      }
    } else {
      setTitle("Standard Weekly Bonus");
      setDescription("7-day check-in rewards");
      setIsActive(true);
      setDays(defaultDays);
    }
    setSelectedDayTab(1);
    setErrors({});
  }, [bonusData, isOpen]);

  if (!isOpen) return null;

  const currentDayConfig = days.find((d) => d.dayNumber === selectedDayTab) || days[0];

  const updateCurrentDay = (field: keyof BonusDayConfig, val: any) => {
    setDays((prevDays) =>
      prevDays.map((d) => {
        if (d.dayNumber === selectedDayTab) {
          const updated = { ...d, [field]: val };
          // Auto sync token amount if rewardType is token
          if (field === "rewardType" && val === "token" && !d.tokenAmount) {
            updated.tokenAmount = Number(d.value) || 10;
          }
          return updated;
        }
        return d;
      })
    );
  };

  const handleImageFileSelect = async (file: File | null) => {
    if (!file) {
      updateCurrentDay("image", "");
      return;
    }

    try {
      setIsUploadingImage(true);
      const imageUrl = await uploadImageMutation.mutateAsync(file);
      updateCurrentDay("image", imageUrl);
    } catch (err: any) {
      alert(err?.message || "Failed to upload reward image");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!title.trim()) {
      errs.title = "Weekly bonus title is required.";
    }

    days.forEach((day) => {
      if (!day.title.trim()) {
        errs[`day_${day.dayNumber}_title`] = `Day ${day.dayNumber} (${day.dayName}) title is required.`;
      }
    });

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || isLoading || isUploadingImage) return;

    const payload: CreateWeeklyBonusPayload = {
      title: title.trim(),
      description: description.trim(),
      isActive,
      days,
    };

    await onSubmit(payload);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[94vh] w-full max-w-[820px] flex-col rounded-admin-lg border border-[rgba(244,114,182,0.2)] bg-admin-card shadow-admin"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[rgba(244,114,182,0.15)] px-6 py-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-[11px] text-white"
              style={{
                background: "linear-gradient(135deg, #F472B6 0%, #DB2777 100%)",
                boxShadow: "0 0 14px rgba(244, 114, 182, 0.35)",
              }}
            >
              <Gift size={20} />
            </div>
            <div>
              <h3 className="text-[1.18rem] font-bold text-white">
                {isEdit ? "Edit Weekly Bonus" : "Create Weekly Bonus"}
              </h3>
              <p className="text-[0.76rem] text-admin-muted">
                Configure the 7 weekly scratch ticket rewards (Monday to Sunday).
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            title="Close"
            className="rounded-admin bg-transparent p-1.5 text-admin-muted transition-colors hover:bg-admin-surface hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            {/* ── Section 1: Bonus General Settings ── */}
            <div className="rounded-admin-md border border-[rgba(244,114,182,0.15)] bg-admin-surface/50 p-4">
              <h4 className="mb-3 flex items-center gap-2 text-[0.88rem] font-bold text-white">
                <Calendar size={16} color="var(--primary)" />
                General Configuration
              </h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[0.8rem] font-semibold text-admin-muted">
                    Configuration Title <span className="text-admin-danger">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Standard Weekly Bonus"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={`${inputCls} ${errors.title ? "border-admin-danger" : ""}`}
                  />
                  {errors.title && (
                    <p className="mt-1 flex items-center gap-1 text-[0.75rem] text-admin-danger">
                      <AlertCircle size={12} /> {errors.title}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-[0.8rem] font-semibold text-admin-muted">
                    Status
                  </label>
                  <div className="flex items-center gap-3 pt-2">
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="peer h-6 w-11 rounded-full bg-admin-surface peer-checked:bg-admin-primary peer-checked:after:translate-x-full peer-checked:after:border-white after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-['']"></div>
                    </label>
                    <span className="text-[0.85rem] font-medium text-white">
                      {isActive ? "Active (Currently in Use)" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Section 2: 7 Days Navigation Tabs ── */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h4 className="flex items-center gap-2 text-[0.92rem] font-bold text-white">
                  <Sparkles size={16} color="var(--primary)" />
                  Configure All 7 Tickets
                </h4>
                <span className="text-[0.75rem] text-admin-muted">
                  Click a day to configure its reward
                </span>
              </div>

              {/* Day Tabs */}
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                {days.map((day) => {
                  const isSelected = selectedDayTab === day.dayNumber;
                  const hasDayError = errors[`day_${day.dayNumber}_title`];

                  return (
                    <button
                      key={day.dayNumber}
                      type="button"
                      onClick={() => setSelectedDayTab(day.dayNumber)}
                      className={`flex flex-col items-center justify-center rounded-admin p-2.5 transition-all text-center ${
                        isSelected
                          ? "border border-admin-primary bg-admin-primary/20 text-white shadow-[0_0_12px_rgba(244,114,182,0.25)]"
                          : "border border-[rgba(244,114,182,0.15)] bg-admin-surface text-admin-muted hover:border-[rgba(244,114,182,0.3)] hover:text-white"
                      } ${hasDayError ? "border-admin-danger" : ""}`}
                    >
                      <span className="text-[0.72rem] font-medium opacity-80">
                        Day {day.dayNumber}
                      </span>
                      <span className="text-[0.82rem] font-bold">
                        {day.dayName.slice(0, 3)}
                      </span>
                      <span className="mt-1 truncate max-w-full rounded bg-black/40 px-1.5 py-0.5 text-[0.68rem] text-admin-primary">
                        {day.rewardType}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Section 3: Active Day Configuration Form ── */}
            <div className="rounded-admin-md border border-[rgba(244,114,182,0.25)] bg-admin-surface/70 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[rgba(244,114,182,0.15)] pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-admin-primary text-[0.75rem] font-bold text-white">
                    {currentDayConfig.dayNumber}
                  </span>
                  <h5 className="text-[1rem] font-bold text-white">
                    {currentDayConfig.dayName} Configuration
                  </h5>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-[0.78rem] text-admin-muted">Ticket Active:</label>
                  <input
                    type="checkbox"
                    checked={currentDayConfig.isActive}
                    onChange={(e) => updateCurrentDay("isActive", e.target.checked)}
                    className="h-4 w-4 rounded border-gray-600 bg-admin-surface text-admin-primary focus:ring-admin-primary"
                  />
                </div>
              </div>

              {/* Row 1: Reward Type & Reward Title */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[0.8rem] font-semibold text-admin-muted">
                    Reward Type <span className="text-admin-danger">*</span>
                  </label>
                  <Dropdown
                    value={currentDayConfig.rewardType}
                    onChange={(val) => updateCurrentDay("rewardType", val as BonusRewardType)}
                    options={rewardTypeOptions}
                    placeholder="Select Reward Type"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[0.8rem] font-semibold text-admin-muted">
                    Reward Display Title <span className="text-admin-danger">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +10 Tokens, 5 Star, 10 min Video"
                    value={currentDayConfig.title}
                    onChange={(e) => updateCurrentDay("title", e.target.value)}
                    className={`${inputCls} ${
                      errors[`day_${currentDayConfig.dayNumber}_title`] ? "border-admin-danger" : ""
                    }`}
                  />
                  {errors[`day_${currentDayConfig.dayNumber}_title`] && (
                    <p className="mt-1 flex items-center gap-1 text-[0.75rem] text-admin-danger">
                      <AlertCircle size={12} /> {errors[`day_${currentDayConfig.dayNumber}_title`]}
                    </p>
                  )}
                </div>
              </div>

              {/* Row 2: Reward Value & Token Amount Credit */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[0.8rem] font-semibold text-admin-muted">
                    Reward Value (Display or Units)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 10 or 15 or 5"
                    value={String(currentDayConfig.value ?? "")}
                    onChange={(e) => updateCurrentDay("value", e.target.value)}
                    className={inputCls}
                  />
                  <p className="mt-1 text-[0.7rem] text-admin-subtle">
                    Primary amount or unit displayed on the ticket.
                  </p>
                </div>

                <div>
                  <label className="mb-1.5 block text-[0.8rem] font-semibold text-admin-muted">
                    Tokens to Credit (Auto-Added to Balance)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0"
                    value={currentDayConfig.tokenAmount ?? 0}
                    onChange={(e) => updateCurrentDay("tokenAmount", parseInt(e.target.value, 10) || 0)}
                    className={inputCls}
                  />
                  <p className="mt-1 text-[0.7rem] text-admin-subtle">
                    Set &gt; 0 to automatically credit user's token balance upon claiming.
                  </p>
                </div>
              </div>

              {/* Row 3: Description */}
              <div>
                <label className="mb-1.5 block text-[0.8rem] font-semibold text-admin-muted">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Check in today to claim your bonus coins"
                  value={currentDayConfig.description || ""}
                  onChange={(e) => updateCurrentDay("description", e.target.value)}
                  className={inputCls}
                />
              </div>

              {/* Row 4: Reward / Gift Custom Image (Optional) */}
              <div>
                <label className="mb-1.5 block text-[0.8rem] font-semibold text-admin-muted">
                  Custom Gift / Reward Image (Optional S3 Upload)
                </label>
                <p className="mb-2 text-[0.72rem] text-admin-subtle">
                  Upload a custom gift icon or illustration. If blank, the app will use its high-res 3D theme icon.
                </p>
                <ImageUpload
                  currentImageUrl={currentDayConfig.image}
                  onFileSelect={handleImageFileSelect}
                />
                {isUploadingImage && (
                  <p className="mt-1.5 text-[0.75rem] text-admin-primary flex items-center gap-1.5">
                    <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-admin-primary border-t-transparent" />
                    Uploading image to S3...
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-[rgba(244,114,182,0.15)] px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading || isUploadingImage}
              className="rounded-admin bg-admin-surface px-4 py-2 text-[0.875rem] font-medium text-admin-muted transition-colors hover:bg-admin-surface/80 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || isUploadingImage}
              className="flex items-center gap-2 rounded-admin px-6 py-2.5 text-[0.875rem] font-semibold text-white shadow-[0_2px_14px_rgba(244,114,182,0.35)] transition-all hover:opacity-95 disabled:opacity-60"
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
                "Create Weekly Bonus"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WeeklyBonusModal;
