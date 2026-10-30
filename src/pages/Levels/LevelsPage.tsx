import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  Award,
  Plus,
  Trash2,
  Save,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  Users,
  SlidersHorizontal,
} from "lucide-react";
import {
  useLevelConfigQuery,
  useLevelSummaryQuery,
  useLevelUsersQuery,
  useRecalculateLevelsMutation,
  useSaveLevelConfigMutation,
} from "../../hooks/useLevels";
import { LevelConfig, LevelTier, LevelUsersFilter } from "../../types/level.types";
import { ConfirmModal } from "../../components/ConfirmModal";
import { Dropdown } from "../../components/common/Dropdown";
import { formatDateTime } from "../Referrals/ReferralsPage";
import { PAGE_SIZE, MAX_LEVEL_TIERS, MAX_INACTIVITY_DAYS } from "../../constants";

type TierField = "malePoints" | "femalePoints";
type TierErrors = Partial<Record<TierField, string>>;

const INPUT_CLASS =
  "h-9 w-full rounded-admin border bg-admin-surface px-3 text-xs text-white placeholder:text-admin-muted focus:border-admin-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-50";
const BUTTON_CLASS =
  "inline-flex h-9 items-center gap-1.5 rounded-admin border border-[rgba(244,114,182,0.2)] bg-admin-surface px-3 text-xs font-medium text-white transition-colors hover:bg-[rgba(244,114,182,0.12)] disabled:cursor-not-allowed disabled:opacity-40";

const isWhole = (n: number, min: number, max = Number.MAX_SAFE_INTEGER) => Number.isInteger(n) && n >= min && n <= max;

// Mirrors validateLevelConfig in BE/src/services/level.service.js so mistakes show before saving
const validateTiers = (tiers: LevelTier[]): TierErrors[] =>
  tiers.map((tier, i) => {
    const errors: TierErrors = {};
    const prev = tiers[i - 1];
    for (const field of ["malePoints", "femalePoints"] as const) {
      if (!isWhole(tier[field], 0)) errors[field] = "Whole number ≥ 0";
      else if (i === 0 && tier[field] !== 0) errors[field] = "Lv0 starts at 0";
      else if (prev && tier[field] <= prev[field]) errors[field] = `Must be above Lv${i - 1} (${prev[field]})`;
    }
    return errors;
  });

const LevelChip: React.FC<{ level: number }> = ({ level }) => (
  <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(244,114,182,0.15)] px-2 py-0.5 text-[0.7rem] font-bold italic text-admin-primary">
    <Award size={11} /> Lv{level}
  </span>
);

// ── Level Rules editor ─────────────────────────────────────────────────────────

const LevelRulesEditor: React.FC<{ isSuperAdmin: boolean }> = ({ isSuperAdmin }) => {
  const { data, isLoading, isError, refetch } = useLevelConfigQuery();
  const saveMutation = useSaveLevelConfigMutation();
  const recalcMutation = useRecalculateLevelsMutation();
  const [draft, setDraft] = useState<LevelConfig | null>(null);
  const [confirmRecalc, setConfirmRecalc] = useState<boolean>(false);

  const saved = data?.data;
  useEffect(() => {
    if (saved) setDraft({ ...saved, tiers: saved.tiers.map((t) => ({ ...t })) });
  }, [saved]);

  const errors = useMemo(() => (draft ? validateTiers(draft.tiers) : []), [draft]);
  const daysValid = draft ? isWhole(draft.femaleInactivityDays, 1, MAX_INACTIVITY_DAYS) : true;
  const hasErrors = errors.some((e) => Object.keys(e).length > 0) || !daysValid;
  const isDirty = Boolean(draft && saved && JSON.stringify({ ...draft, updatedAt: null }) !== JSON.stringify({ ...saved, updatedAt: null }));
  const readOnly = !isSuperAdmin;

  if (isLoading || !draft) {
    return isError ? (
      <div className="py-10 text-center text-sm text-red-400">
        <p>Failed to load level rules.</p>
        <button onClick={() => refetch()} className={`${BUTTON_CLASS} mt-3`}>Retry</button>
      </div>
    ) : (
      <div className="py-10 text-center text-sm text-admin-muted">Loading level rules...</div>
    );
  }

  const setTier = (index: number, field: TierField, value: string) =>
    setDraft((d) => d && { ...d, tiers: d.tiers.map((t, i) => (i === index ? { ...t, [field]: value === "" ? NaN : Number(value) } : t)) });

  const addTier = () =>
    setDraft((d) => {
      if (!d) return d;
      const last = d.tiers[d.tiers.length - 1];
      return {
        ...d,
        tiers: [
          ...d.tiers,
          {
            level: d.tiers.length,
            malePoints: (last?.malePoints || 0) * 2 || 100,
            femalePoints: (last?.femalePoints || 0) + 500,
          },
        ],
      };
    });

  const removeLastTier = () => setDraft((d) => d && { ...d, tiers: d.tiers.slice(0, -1) });

  const save = async () => {
    try {
      await saveMutation.mutateAsync(draft);
      toast.success("Level rules saved.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to save level rules.");
    }
  };

  const recalculate = async () => {
    try {
      const res = await recalcMutation.mutateAsync();
      toast.success(`Recalculated ${res.data.checked} users — ${res.data.changed} level changes.`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to recalculate levels.");
    } finally {
      setConfirmRecalc(false);
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-wider text-admin-muted">
          <SlidersHorizontal size={12} /> Level rules
          {saved?.updatedAt && <span className="ml-2 normal-case tracking-normal">Updated {formatDateTime(saved.updatedAt)}</span>}
        </h3>
        {isSuperAdmin && (
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setConfirmRecalc(true)} disabled={isDirty || recalcMutation.isPending} className={BUTTON_CLASS} title={isDirty ? "Save your changes first" : undefined}>
              <RefreshCw size={14} className={recalcMutation.isPending ? "animate-spin" : ""} /> Recalculate all levels
            </button>
            <button
              type="button"
              onClick={save}
              disabled={!isDirty || hasErrors || saveMutation.isPending}
              className="inline-flex h-9 items-center gap-1.5 rounded-admin bg-admin-primary px-4 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Save size={14} /> {saveMutation.isPending ? "Saving..." : "Save"}
            </button>
          </div>
        )}
      </div>

      {readOnly && <p className="text-xs text-admin-muted">Only a Super Admin can change level rules.</p>}

      {/* Max level + future inactivity setting */}
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-admin border border-[rgba(244,114,182,0.14)] bg-admin-surface/60 px-4 py-3">
          <p className="text-[0.65rem] font-medium uppercase tracking-wider text-admin-muted">Maximum level</p>
          <div className="mt-1.5 flex items-center gap-3">
            <LevelChip level={draft.tiers.length - 1} />
            <p className="text-[0.7rem] text-admin-muted">Set by the rows below — use “Add level” or the bin on the last row.</p>
          </div>
        </div>

        <div className="rounded-admin border border-[rgba(244,114,182,0.14)] bg-admin-surface/60 px-4 py-3">
          <label className="text-[0.65rem] font-medium uppercase tracking-wider text-admin-muted">Female video call inactivity days</label>
          <div className="mt-1.5 flex items-center gap-3">
            <input
              type="number"
              min={1}
              max={MAX_INACTIVITY_DAYS}
              value={Number.isNaN(draft.femaleInactivityDays) ? "" : draft.femaleInactivityDays}
              disabled={readOnly}
              onChange={(e) => setDraft({ ...draft, femaleInactivityDays: e.target.value === "" ? NaN : Number(e.target.value) })}
              className={`${INPUT_CLASS} max-w-[100px] ${daysValid ? "border-[rgba(244,114,182,0.2)]" : "border-red-400"}`}
            />
            <p className="text-[0.7rem] text-admin-muted">
              For the future video call feature: no call for this many days → level −1 (repeats every N days). Not active yet.
            </p>
          </div>
        </div>
      </div>

      {/* Tiers */}
      <div className="overflow-hidden rounded-admin border border-[rgba(244,114,182,0.12)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-xs">
            <thead className="bg-admin-surface/60 text-[0.65rem] uppercase tracking-wider text-admin-muted">
              <tr>
                <th className="w-20 px-4 py-2.5 font-medium">Level</th>
                <th className="px-4 py-2.5 font-medium">Male: tokens bought</th>
                <th className="px-4 py-2.5 font-medium">Female: token balance</th>
                <th className="w-12 px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(244,114,182,0.08)]">
              {draft.tiers.map((tier, i) => (
                <tr key={i} className="align-top text-white/90">
                  <td className="px-4 py-2.5"><LevelChip level={i} /></td>
                  {(["malePoints", "femalePoints"] as const).map((field) => (
                    <td key={field} className="px-4 py-2">
                      <input
                        type="number"
                        min={0}
                        value={Number.isNaN(tier[field]) ? "" : tier[field]}
                        disabled={readOnly || i === 0}
                        onChange={(e) => setTier(i, field, e.target.value)}
                        className={`${INPUT_CLASS} ${errors[i]?.[field] ? "border-red-400" : "border-[rgba(244,114,182,0.2)]"}`}
                      />
                      {errors[i]?.[field] && <p className="mt-1 text-[0.65rem] text-red-400">{errors[i][field]}</p>}
                    </td>
                  ))}
                  <td className="px-4 py-2.5 text-right">
                    {!readOnly && i === draft.tiers.length - 1 && draft.tiers.length > 2 && (
                      <button type="button" onClick={removeLastTier} title="Remove this level" className="text-red-400 hover:text-red-300">
                        <Trash2 size={15} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!readOnly && (
          <div className="border-t border-[rgba(244,114,182,0.12)] px-4 py-3">
            <button type="button" onClick={addTier} disabled={draft.tiers.length >= MAX_LEVEL_TIERS} className={BUTTON_CLASS}>
              <Plus size={14} /> Add level
            </button>
          </div>
        )}
      </div>
      <p className="text-[0.7rem] text-admin-muted">
        Male levels only go up. Female levels follow the token balance, up and down. Saving new numbers doesn't move
        anyone — use “Recalculate all levels” after saving.
      </p>

      <ConfirmModal
        isOpen={confirmRecalc}
        title="Recalculate all levels?"
        message="Applies the saved rules to every user. Men can only move up; women move up or down to match their token balance."
        confirmText="Recalculate"
        variant="primary"
        isLoading={recalcMutation.isPending}
        onConfirm={recalculate}
        onCancel={() => setConfirmRecalc(false)}
      />
    </section>
  );
};

// ── Users by level ─────────────────────────────────────────────────────────────

const LevelUsersTable: React.FC = () => {
  const [filter, setFilter] = useState<LevelUsersFilter>({ page: 1, limit: PAGE_SIZE, search: "", gender: "", level: "" });
  const [searchInput, setSearchInput] = useState<string>("");
  const summaryQuery = useLevelSummaryQuery();
  const { data, isLoading, isFetching, isError, refetch } = useLevelUsersQuery(filter);

  useEffect(() => {
    const timer = setTimeout(() => setFilter((f) => (f.search === searchInput ? f : { ...f, search: searchInput, page: 1 })), 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const users = data?.data.users ?? [];
  const pagination = data?.data.pagination;
  const summary = summaryQuery.data?.data ?? [];
  const levels = Array.from(new Set(summary.map((r) => r.level))).sort((a, b) => a - b);
  const countOf = (gender: string, level: number) => summary.find((r) => r.gender === gender && r.level === level)?.count ?? 0;

  return (
    <section className="space-y-4">
      <h3 className="flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-wider text-admin-muted">
        <Users size={12} /> Users by level
        {isFetching && <span className="ml-2 normal-case tracking-normal">Updating...</span>}
      </h3>

      {levels.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {levels.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setFilter((f) => ({ ...f, level: f.level === String(level) ? "" : String(level), page: 1 }))}
              className={`rounded-admin border px-3 py-2 text-left transition-colors ${
                filter.level === String(level) ? "border-admin-primary bg-[rgba(244,114,182,0.12)]" : "border-[rgba(244,114,182,0.14)] bg-admin-surface/60"
              }`}
            >
              <LevelChip level={level} />
              <p className="mt-1 text-[0.65rem] text-admin-muted">♂ {countOf("male", level)} · ♀ {countOf("female", level)}</p>
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative w-full sm:w-72">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-admin-muted" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search name or email"
            className={`${INPUT_CLASS} border-[rgba(244,114,182,0.2)] pl-9`}
          />
        </div>
        <Dropdown
          value={filter.gender}
          onChange={(value) => setFilter((f) => ({ ...f, gender: value as LevelUsersFilter["gender"], page: 1 }))}
          options={[{ value: "", label: "All genders" }, { value: "male", label: "Male" }, { value: "female", label: "Female" }]}
          className="sm:w-40"
        />
      </div>

      <div className="overflow-hidden rounded-admin border border-[rgba(244,114,182,0.12)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-xs">
            <thead className="bg-admin-surface/60 text-[0.65rem] uppercase tracking-wider text-admin-muted">
              <tr>
                <th className="px-4 py-2.5 font-medium">User</th>
                <th className="px-4 py-2.5 font-medium">Gender</th>
                <th className="px-4 py-2.5 font-medium">Level</th>
                <th className="px-4 py-2.5 text-right font-medium">Points</th>
                <th className="px-4 py-2.5 font-medium">Level changed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(244,114,182,0.08)]">
              {isLoading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-admin-muted">Loading...</td></tr>
              ) : isError ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-red-400">
                    Failed to load users. <button onClick={() => refetch()} className="underline">Retry</button>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-admin-muted">No users match.</td></tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="text-white/90">
                    <td className="px-4 py-2.5">
                      <p className="font-medium text-white">{u.name}</p>
                      <p className="text-[0.68rem] text-admin-muted">{u.email}</p>
                    </td>
                    <td className="px-4 py-2.5 capitalize text-admin-muted">{u.gender || "—"}</td>
                    <td className="px-4 py-2.5"><LevelChip level={u.level} /></td>
                    <td className="px-4 py-2.5 text-right font-semibold">{u.points.toLocaleString("en-IN")}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-admin-muted">{formatDateTime(u.levelChangedAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between gap-3 border-t border-[rgba(244,114,182,0.15)] px-5 py-3.5">
            <p className="text-[0.8rem] text-admin-muted">
              Page <span className="font-semibold text-white">{pagination.page}</span> of {pagination.totalPages} · {pagination.total} users
            </p>
            <div className="flex gap-2">
              <button type="button" disabled={pagination.page <= 1} onClick={() => setFilter((f) => ({ ...f, page: f.page - 1 }))} className={BUTTON_CLASS}>
                <ChevronLeft size={14} /> Previous
              </button>
              <button type="button" disabled={pagination.page >= pagination.totalPages} onClick={() => setFilter((f) => ({ ...f, page: f.page + 1 }))} className={BUTTON_CLASS}>
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export const LevelsPage: React.FC<{ isSuperAdmin: boolean }> = ({ isSuperAdmin }) => (
  <div className="space-y-8">
    <div>
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[rgba(244,114,182,0.15)] text-admin-primary">
          <Award size={18} strokeWidth={2.2} />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">Levels</h1>
      </div>
      <p className="mt-1 text-xs text-admin-muted sm:text-sm">
        Men level up from tokens bought and never drop. Women's level follows their token balance, up and down.
      </p>
    </div>

    <LevelRulesEditor isSuperAdmin={isSuperAdmin} />
    <LevelUsersTable />
  </div>
);

export default LevelsPage;
