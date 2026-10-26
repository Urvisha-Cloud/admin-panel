import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { toast } from "react-toastify";
import { AlertCircle, CheckCircle2, Coins, IndianRupee } from "lucide-react";
import { getTokenValue, updateTokenValue } from "../../services/appSettings.service";

export interface TokenValueSettingsHandle {
  save: () => Promise<void>;
  reload: () => Promise<void>;
}

interface TokenValueSettingsProps {
  onBusyChange?: (busy: boolean) => void;
}

// Starts at the minimum withdrawal (MIN_WITHDRAW_TOKENS in BE redeem.controller.js)
const PREVIEW_AMOUNTS = [1000, 2000, 5000, 10000];

const formatRupees = (amount: number) =>
  `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

export const TokenValueSettings = forwardRef<TokenValueSettingsHandle, TokenValueSettingsProps>(
  ({ onBusyChange }, ref) => {
    const [value, setValue] = useState<string>("");
    const [savedValue, setSavedValue] = useState<number | null>(null);
    const [updatedAt, setUpdatedAt] = useState<string | null>(null);
    const [error, setError] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSaving, setIsSaving] = useState<boolean>(false);

    useEffect(() => {
      onBusyChange?.(isLoading || isSaving);
    }, [isLoading, isSaving, onBusyChange]);

    const reload = async () => {
      try {
        setIsLoading(true);
        const data = await getTokenValue();
        setSavedValue(data.rupeesPerToken);
        setValue(data.rupeesPerToken !== null ? String(data.rupeesPerToken) : "");
        setUpdatedAt(data.updatedAt);
        setError("");
      } catch (err: any) {
        toast.error(err?.response?.data?.message || err?.message || "Failed to load token value.");
      } finally {
        setIsLoading(false);
      }
    };

    useEffect(() => {
      reload();
    }, []);

    const validate = (): number | null => {
      const parsed = Number(value);
      if (!value.trim() || !Number.isFinite(parsed)) {
        setError("Token value is required.");
        return null;
      }
      if (parsed <= 0) {
        setError("Token value must be greater than 0.");
        return null;
      }
      if (parsed > 100000) {
        setError("Token value cannot exceed ₹1,00,000.");
        return null;
      }
      if (!/^\d+(\.\d{1,2})?$/.test(value.trim())) {
        setError("Use at most 2 decimal places (e.g. 0.50).");
        return null;
      }
      setError("");
      return parsed;
    };

    const save = async () => {
      const parsed = validate();
      if (parsed === null) {
        toast.error("Please enter a valid token value.");
        return;
      }
      try {
        setIsSaving(true);
        const data = await updateTokenValue(parsed);
        setSavedValue(data.rupeesPerToken);
        setUpdatedAt(data.updatedAt);
        toast.success("Token value updated successfully!");
      } catch (err: any) {
        toast.error(err?.response?.data?.message || err?.message || "Failed to save token value.");
      } finally {
        setIsSaving(false);
      }
    };

    useImperativeHandle(ref, () => ({ save, reload }));

    const handleChange = (raw: string) => {
      // Digits with an optional decimal point
      const sanitized = raw.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
      setValue(sanitized);
      if (error) setError("");
    };

    const previewRate = Number(value);
    const hasPreview = value.trim() !== "" && Number.isFinite(previewRate) && previewRate > 0;
    const isDirty = savedValue === null ? value.trim() !== "" : Number(value) !== savedValue;

    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
        className="space-y-6"
      >
        {/* Info Banner */}
        <div className="rounded-admin-md border border-[rgba(244,114,182,0.25)] bg-[rgba(244,114,182,0.06)] p-4 sm:p-5">
          <div className="flex items-start gap-3.5">
            <div className="rounded-lg bg-[rgba(244,114,182,0.2)] p-2 text-admin-primary">
              <CheckCircle2 size={18} />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">Token to Rupee Conversion</h4>
              <p className="text-xs leading-relaxed text-admin-muted">
                Define how much 1 token is worth in Indian Rupees. This rate is the reference value
                of a token across the platform.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Rate Input Card */}
          <div className="rounded-admin-md border border-[rgba(244,114,182,0.2)] bg-admin-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Token Value</h3>
                <p className="mt-0.5 text-xs text-admin-muted">
                  {savedValue !== null
                    ? `Current rate: 1 Token = ${formatRupees(savedValue)}`
                    : "Not configured yet"}
                </p>
              </div>
              {isDirty && !isLoading && (
                <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[0.7rem] font-semibold text-amber-300">
                  Unsaved
                </span>
              )}
            </div>

            <label htmlFor="rupees-per-token" className="mb-1.5 block text-xs font-semibold text-white">
              Value of 1 Token <span className="text-red-400">*</span>
            </label>
            <div className="flex items-stretch gap-3">
              {/* Fixed left side: 1 Token */}
              <div className="flex shrink-0 items-center gap-2 rounded-admin-sm border border-[rgba(244,114,182,0.22)] bg-admin-surface px-3.5 text-sm font-semibold text-white">
                <Coins size={16} className="text-admin-primary" />
                <span>1 Token</span>
              </div>
              <span className="flex items-center text-lg font-bold text-admin-muted">=</span>
              {/* Rupee input */}
              <div className="relative flex-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-admin-muted">
                  <IndianRupee size={16} />
                </div>
                <input
                  id="rupees-per-token"
                  type="text"
                  inputMode="decimal"
                  value={value}
                  onChange={(e) => handleChange(e.target.value)}
                  placeholder={isLoading ? "Loading..." : "e.g. 1.00"}
                  disabled={isLoading || isSaving}
                  className={`w-full rounded-admin-sm border bg-[#1E1119] py-2.5 pl-9 pr-14 text-sm font-semibold text-white transition-all placeholder:text-admin-subtle focus:outline-none ${
                    error
                      ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      : "border-[rgba(244,114,182,0.22)] focus:border-admin-primary focus:ring-1 focus:ring-admin-primary"
                  }`}
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-xs font-semibold text-admin-muted">
                  INR
                </div>
              </div>
            </div>

            {error ? (
              <div className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400">
                <AlertCircle size={13} />
                <span>{error}</span>
              </div>
            ) : (
              <p className="mt-1.5 text-[0.72rem] text-admin-subtle">
                Up to 2 decimal places. Example: 0.50 means 2 tokens make ₹1.
              </p>
            )}

            {updatedAt && (
              <p className="mt-4 border-t border-[rgba(244,114,182,0.12)] pt-3 text-[0.72rem] text-admin-subtle">
                Last updated{" "}
                {new Date(updatedAt).toLocaleString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
          </div>

          {/* Live Conversion Preview */}
          <div className="rounded-admin-md border border-[rgba(244,114,182,0.2)] bg-admin-card p-5">
            <h3 className="text-base font-bold text-white">Conversion Preview</h3>
            <p className="mt-0.5 text-xs text-admin-muted">Minimum withdrawal is 1,000 tokens. Updates as you type.</p>

            <div className="mt-4 divide-y divide-[rgba(244,114,182,0.1)] rounded-admin border border-[rgba(244,114,182,0.12)]">
              {PREVIEW_AMOUNTS.map((tokens) => (
                <div key={tokens} className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <span className="flex items-center gap-2 text-admin-muted">
                    <Coins size={14} className="text-admin-primary" />
                    {tokens.toLocaleString("en-IN")} {tokens === 1 ? "Token" : "Tokens"}
                  </span>
                  <span className="font-semibold text-white">
                    {hasPreview ? formatRupees(tokens * previewRate) : "—"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Save Bar */}
        <div className="flex items-center justify-end gap-3 border-t border-[rgba(244,114,182,0.15)] pt-4">
          <button
            type="button"
            onClick={reload}
            disabled={isLoading || isSaving}
            className="rounded-admin-md border border-[rgba(244,114,182,0.25)] bg-admin-card px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[rgba(244,114,182,0.1)] disabled:opacity-50"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={isLoading || isSaving}
            className="flex items-center gap-2 rounded-admin-md bg-gradient-to-r from-[#F472B6] to-[#DB2777] px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-pink-500/20 transition-all hover:scale-[1.02] hover:opacity-95 disabled:opacity-50"
          >
            <IndianRupee size={16} />
            <span>{isSaving ? "Saving..." : "Save Token Value"}</span>
          </button>
        </div>
      </form>
    );
  }
);

TokenValueSettings.displayName = "TokenValueSettings";
