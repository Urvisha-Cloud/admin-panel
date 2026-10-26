import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import {
  Settings,
  Gift,
  Save,
  RefreshCw,
  Coins,
  Gem,
  Heart,
  Info,
  Minus,
  Plus,
  AlertCircle,
  Package,
  Image as ImageIcon,
  Video as VideoIcon,
  IndianRupee,
} from "lucide-react";
import {
  getAdminGiftSettings,
  updateAdminGiftSettings,
} from "../../services/giftSettings.service";
import { getCurrentAdmin } from "../../services/auth.service";
import { GiftSettingItem } from "../../types/giftSettings.types";
import { TokenValueSettings, TokenValueSettingsHandle } from "./TokenValueSettings";

type SettingsTab = "gifts" | "token-value";

const STATIC_GIFTS = [
  {
    giftType: "box",
    name: "Gift Box",
    description: "Classic surprise gift box sent in direct chats",
    defaultCost: 10,
    icon: Package,
    category: "gift",
  },
  {
    giftType: "heart",
    name: "Heart",
    description: "Express affection and warm appreciation",
    defaultCost: 5,
    icon: Heart,
    category: "gift",
  },
  {
    giftType: "coin",
    name: "Crown Coin",
    description: "Royal crown golden coin of high honor",
    defaultCost: 25,
    icon: Coins,
    category: "gift",
  },
  {
    giftType: "diamond",
    name: "Diamond",
    description: "Sparkling precious luxury gemstone",
    defaultCost: 50,
    icon: Gem,
    category: "gift",
  },
  {
    giftType: "photo_download",
    name: "Photo Download",
    description: "Tokens required to unlock and download received full-resolution photos",
    defaultCost: 5,
    icon: ImageIcon,
    category: "media",
  },
  {
    giftType: "video_download",
    name: "Video Download",
    description: "Tokens required to unlock and stream/download received videos",
    defaultCost: 15,
    icon: VideoIcon,
    category: "media",
  },
];

export const SettingsPage: React.FC = () => {
  const isSuperAdmin = getCurrentAdmin()?.role === "superAdmin";
  const [activeSubTab, setActiveSubTab] = useState<SettingsTab>("gifts");
  const tokenValueRef = useRef<TokenValueSettingsHandle>(null);
  const [isTokenValueBusy, setIsTokenValueBusy] = useState<boolean>(false);
  const [giftCosts, setGiftCosts] = useState<Record<string, string>>({
    box: "10",
    heart: "5",
    coin: "25",
    diamond: "50",
    photo_download: "5",
    video_download: "15",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Load existing gift token settings
  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const data: GiftSettingItem[] = await getAdminGiftSettings();
      if (data && data.length > 0) {
        const costMap: Record<string, string> = {};
        data.forEach((item) => {
          costMap[item.giftType] = String(item.tokenCost);
        });
        setGiftCosts((prev) => ({ ...prev, ...costMap }));
      }
      setErrors({});
    } catch (err: any) {
      console.error("Failed to load settings:", err);
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to load settings."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleCostChange = (giftType: string, value: string) => {
    // Clean string input to digits only
    const sanitized = value.replace(/[^0-9]/g, "");
    setGiftCosts((prev) => ({
      ...prev,
      [giftType]: sanitized,
    }));

    // Clear specific error on edit
    if (errors[giftType]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[giftType];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    STATIC_GIFTS.forEach((gift) => {
      const val = giftCosts[gift.giftType];
      const parsed = parseInt(val, 10);
      if (!val || isNaN(parsed)) {
        newErrors[gift.giftType] = "Token cost is required.";
      } else if (parsed <= 0) {
        newErrors[gift.giftType] = "Token cost must be greater than 0.";
      } else if (parsed > 100000) {
        newErrors[gift.giftType] = "Token cost cannot exceed 100,000.";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please correct the invalid token cost values.");
      return;
    }

    try {
      setIsSaving(true);
      const payload = STATIC_GIFTS.map((gift) => ({
        giftType: gift.giftType,
        tokenCost: parseInt(giftCosts[gift.giftType] || String(gift.defaultCost), 10),
      }));

      await updateAdminGiftSettings(payload);
      toast.success("Token costs updated successfully!");
    } catch (err: any) {
      console.error("Failed to save settings:", err);
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to save settings."
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Header actions apply to whichever tab is open
  const isTokenTab = activeSubTab === "token-value";
  const isHeaderBusy = isTokenTab ? isTokenValueBusy : isLoading || isSaving;
  const handleHeaderRefresh = () => (isTokenTab ? tokenValueRef.current?.reload() : fetchSettings());
  const handleHeaderSave = (e: React.FormEvent) =>
    isTokenTab ? tokenValueRef.current?.save() : handleSave(e);

  return (
    <div className="flex flex-col gap-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-[14px]">
          <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-[rgba(244,114,182,0.12)] text-admin-primary">
            <Settings size={21} />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">Settings</h2>
            <p className="mt-0.5 text-xs text-admin-muted sm:text-sm">
              Manage gift pricing, photo/video download token costs, and platform parameters.
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleHeaderRefresh}
            disabled={isHeaderBusy}
            className="flex h-9 items-center gap-2 rounded-admin border border-[rgba(244,114,182,0.2)] bg-admin-card px-3.5 text-[0.8rem] font-medium text-admin-muted transition-colors hover:bg-admin-surface hover:text-white disabled:opacity-50"
          >
            <RefreshCw size={14} className={isHeaderBusy ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleHeaderSave}
            disabled={isHeaderBusy}
            className="flex h-9 items-center gap-2 rounded-admin bg-admin-primary px-4 text-[0.8rem] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Save size={14} />
            <span>{!isTokenTab && isSaving ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </div>

      {/* ── Tabs Navigation ── */}
      <div className="flex border-b border-[rgba(244,114,182,0.12)]">
        <button
          type="button"
          onClick={() => setActiveSubTab("gifts")}
          className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
            activeSubTab === "gifts"
              ? "border-admin-primary text-admin-primary"
              : "border-transparent text-admin-muted hover:text-white"
          }`}
        >
          <Gift size={15} />
          <span>Token Costs</span>
        </button>
        {isSuperAdmin && (
          <button
            type="button"
            onClick={() => setActiveSubTab("token-value")}
            className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
              activeSubTab === "token-value"
                ? "border-admin-primary text-admin-primary"
                : "border-transparent text-admin-muted hover:text-white"
            }`}
          >
            <IndianRupee size={15} />
            <span>Token Value</span>
          </button>
        )}
      </div>

      {activeSubTab === "token-value" && isSuperAdmin && (
        <TokenValueSettings ref={tokenValueRef} onBusyChange={setIsTokenValueBusy} />
      )}

      {/* ── Main Settings Content ── */}
      {activeSubTab === "gifts" && (
        <form onSubmit={handleSave} className="space-y-6">
          <p className="flex items-center gap-2 text-xs text-admin-muted">
            <Info size={14} className="shrink-0" />
            The mobile app reads these costs live, so changes apply as soon as you save.
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {STATIC_GIFTS.map((gift) => {
              const IconComp = gift.icon;
              const hasError = !!errors[gift.giftType];
              const current = parseInt(giftCosts[gift.giftType], 10) || 0;
              const isBusy = isLoading || isSaving;

              return (
                <div
                  key={gift.giftType}
                  className={`rounded-admin border bg-admin-card p-4 transition-colors ${
                    hasError
                      ? "border-red-500/60"
                      : "border-[rgba(244,114,182,0.12)] hover:border-[rgba(244,114,182,0.28)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-admin-surface text-admin-muted">
                        <IconComp size={17} />
                      </div>
                      <div className="min-w-0">
                        <label
                          htmlFor={`cost-${gift.giftType}`}
                          className="block text-sm font-semibold text-white"
                        >
                          {gift.name}
                        </label>
                        <p className="truncate text-xs text-admin-muted">{gift.description}</p>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-full bg-admin-surface px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-wider text-admin-muted">
                      {gift.category === "media" ? "Media" : "Gift"}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <button
                      type="button"
                      aria-label={`Decrease ${gift.name} cost`}
                      onClick={() => handleCostChange(gift.giftType, String(Math.max(1, current - 1)))}
                      disabled={isBusy || current <= 1}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-admin border border-[rgba(244,114,182,0.15)] bg-admin-surface text-admin-muted transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Minus size={15} />
                    </button>
                    <div className="relative flex-1">
                      <input
                        id={`cost-${gift.giftType}`}
                        type="text"
                        inputMode="numeric"
                        value={giftCosts[gift.giftType] ?? ""}
                        onChange={(e) => handleCostChange(gift.giftType, e.target.value)}
                        placeholder={String(gift.defaultCost)}
                        disabled={isBusy}
                        className="h-10 w-full rounded-admin border border-[rgba(244,114,182,0.15)] bg-admin-surface px-3 pr-14 text-center text-lg font-bold text-white transition-colors placeholder:font-normal placeholder:text-admin-subtle focus:border-admin-primary focus:outline-none disabled:opacity-60"
                      />
                      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-admin-muted">
                        tokens
                      </span>
                    </div>
                    <button
                      type="button"
                      aria-label={`Increase ${gift.name} cost`}
                      onClick={() => handleCostChange(gift.giftType, String(Math.min(100000, current + 1)))}
                      disabled={isBusy || current >= 100000}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-admin border border-[rgba(244,114,182,0.15)] bg-admin-surface text-admin-muted transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Plus size={15} />
                    </button>
                  </div>

                  {hasError && (
                    <p className="mt-2 flex items-center gap-1 text-[0.7rem] text-red-400">
                      <AlertCircle size={12} />
                      {errors[gift.giftType]}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </form>
      )}
    </div>
  );
};

export default SettingsPage;
