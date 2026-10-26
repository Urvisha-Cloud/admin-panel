import React, { useState } from "react";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  ShieldAlert,
  Coins,
  Images,
  RefreshCw,
  ArrowRight,
  TrendingUp,
  UserCheck,
  UserX,
  AlertCircle,
  Sparkles,
  PieChart as PieChartIcon,
  BarChart3,
  CheckCircle2,
  Clock,
  Layers,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { FemaleIcon, MaleIcon } from "../../components/GenderIcons";
import { useDashboardQuery } from "../../hooks/useDashboard";
import { AdminUser } from "../../types/user.types";
import { TokenPackage } from "../../types/tokenPackage.types";

interface DashboardPageProps {
  onNavigateTab?: (tab: string) => void;
}

const statusColors: Record<string, { color: string; background: string }> = {
  approved: { color: "var(--success)", background: "var(--success-bg)" },
  rejected: { color: "#F87171", background: "var(--danger-bg)" },
  pending: { color: "var(--warning)", background: "var(--warning-bg)" },
  submitted: { color: "var(--warning)", background: "var(--warning-bg)" },
  pending_admin_approval: { color: "var(--warning)", background: "var(--warning-bg)" },
  pending_verification: { color: "var(--text-muted)", background: "rgba(255,255,255,0.08)" },
};

const displayStatus = (value: string) => value.replace(/_/g, " ");

const StatusBadge: React.FC<{ value: string }> = ({ value }) => {
  const palette = statusColors[value] || {
    color: "var(--text-muted)",
    background: "rgba(255,255,255,0.08)",
  };
  return (
    <span
      className="inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-[0.72rem] font-semibold capitalize"
      style={{ color: palette.color, backgroundColor: palette.background }}
    >
      {displayStatus(value)}
    </span>
  );
};

// Custom Tooltip for Verification Chart
const VerificationTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0];
    return (
      <div className="rounded-[10px] border border-[rgba(244,114,182,0.35)] bg-[#1C1518] px-3.5 py-2.5 shadow-2xl">
        <div className="flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: item.payload.fill || item.color }}
          />
          <span className="text-[0.84rem] font-semibold text-white">{item.name}</span>
        </div>
        <div className="mt-1 flex items-baseline gap-1 text-[0.95rem] font-bold text-white">
          <span>{item.value}</span>
          <span className="text-[0.75rem] font-normal text-admin-muted">
            ({item.payload.percentage}%)
          </span>
        </div>
      </div>
    );
  }
  return null;
};

// Custom Tooltip for Token Packages Chart
const TokenTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-[10px] border border-[rgba(244,114,182,0.35)] bg-[#1C1518]/95 p-3 shadow-2xl backdrop-blur-md">
        <div className="text-[0.85rem] font-bold text-white">{label || `${data.tokens} Tokens`}</div>
        <div className="mt-1.5 flex flex-col gap-1 text-[0.78rem]">
          <div className="flex items-center justify-between gap-4 text-admin-muted">
            <span>Tokens:</span>
            <span className="font-bold text-pink-400">{data.tokens?.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-admin-muted">
            <span>Price:</span>
            <span className="font-bold text-white">${data.price?.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-admin-muted">
            <span>Gender:</span>
            <span className="font-medium capitalize text-sky-300">{data.gender}</span>
          </div>
          {data.discount > 0 && (
            <div className="flex items-center justify-between gap-4 text-emerald-400 font-semibold">
              <span>Discount:</span>
              <span>{data.discount}% OFF</span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigateTab }) => {
  const { data, isLoading, isFetching, isError, refetch } = useDashboardQuery();
  const [tokenChartMetric, setTokenChartMetric] = useState<"tokens" | "price">("tokens");

  const handleNav = (tab: string) => {
    if (onNavigateTab) {
      onNavigateTab(tab);
    }
  };

  // 1. Prepare Verification Chart Data
  const totalUsersCount = data?.users.total || 0;
  const approvedCount = data?.users.approved || 0;
  const pendingApprovalCount = data?.users.pendingApproval || 0;
  const pendingScanCount = data?.users.pendingVerification || 0;
  const rejectedCount = data?.users.rejected || 0;

  const verificationChartData = [
    {
      name: "Approved",
      value: approvedCount,
      fill: "#10B981", // Emerald
      percentage: totalUsersCount ? Math.round((approvedCount / totalUsersCount) * 100) : 0,
    },
    {
      name: "Pending Approval",
      value: pendingApprovalCount,
      fill: "#F59E0B", // Amber
      percentage: totalUsersCount ? Math.round((pendingApprovalCount / totalUsersCount) * 100) : 0,
    },
    {
      name: "Pending Scan",
      value: pendingScanCount,
      fill: "#EC4899", // Pink
      percentage: totalUsersCount ? Math.round((pendingScanCount / totalUsersCount) * 100) : 0,
    },
    {
      name: "Rejected",
      value: rejectedCount,
      fill: "#EF4444", // Red
      percentage: totalUsersCount ? Math.round((rejectedCount / totalUsersCount) * 100) : 0,
    },
  ].filter((d) => d.value > 0);

  // Fallback if no data
  const hasVerificationData = verificationChartData.length > 0;
  const safeVerificationData = hasVerificationData
    ? verificationChartData
    : [{ name: "No Users Yet", value: 1, fill: "rgba(244,114,182,0.15)", percentage: 0 }];

  // 2. Prepare Token Packages Chart Data
  const packagesList: TokenPackage[] =
    data?.tokenPackages.packages || data?.tokenPackages.recent || [];

  const tokenChartData = packagesList.map((pkg) => ({
    name: `${pkg.tokens} T`,
    fullName: `${pkg.tokens.toLocaleString()} Tokens`,
    tokens: pkg.tokens,
    price: pkg.price,
    gender: pkg.gender,
    discount: pkg.discountPercentage || 0,
    isActive: pkg.isActive,
  }));

  const passRate = totalUsersCount
    ? Math.round((approvedCount / (approvedCount + rejectedCount || 1)) * 100)
    : 0;

  return (
    <div className="mx-auto flex flex-col gap-6">
      {/* ── Page Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-[14px]">
          <div
            className="flex h-[52px] w-[52px] items-center justify-center rounded-[14px] border border-[rgba(244,114,182,0.35)] text-admin-primary"
            style={{
              background: "linear-gradient(135deg, rgba(244,114,182,0.22), rgba(219,39,119,0.12))",
              boxShadow: "0 0 20px rgba(244, 114, 182, 0.2)",
            }}
          >
            <LayoutDashboard size={25} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[1.65rem] font-bold text-white">Dashboard Overview</h2>
              <span className="flex items-center gap-1 rounded-full border border-[rgba(244,114,182,0.3)] bg-[rgba(244,114,182,0.1)] px-2.5 py-0.5 text-[0.72rem] font-medium text-admin-primary">
                <Sparkles size={12} /> Live Analytics
              </span>
            </div>
            <p className="mt-[3px] text-[0.85rem] text-admin-muted">
              Visual performance metrics, verification distributions, and token tier analytics.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => refetch()}
            title="Refresh dashboard stats"
            className="flex items-center gap-2 rounded-admin border border-[rgba(244,114,182,0.3)] bg-admin-surface px-[14px] py-[9px] text-[0.88rem] font-medium text-admin-muted transition-all duration-200 hover:border-admin-primary hover:text-white"
          >
            <RefreshCw size={16} className={isFetching ? "animate-spin text-admin-primary" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Error State ── */}
      {isError && (
        <div className="flex flex-col items-center justify-center rounded-admin-md border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.06)] p-8 text-center">
          <AlertCircle size={40} className="mb-3 text-red-400" />
          <h3 className="text-[1.1rem] font-semibold text-white">Unable to load dashboard data</h3>
          <p className="mt-1 text-[0.85rem] text-admin-muted">
            There was a problem connecting to the server. Please check your backend connection.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 rounded-admin bg-admin-primary px-5 py-2 text-[0.88rem] font-medium text-white shadow-admin hover:bg-admin-primary-hover"
          >
            Retry Loading
          </button>
        </div>
      )}

      {/* ── Loading Skeleton ── */}
      {isLoading && (
        <div className="flex flex-col gap-6">
          {/* Top KPI Skeletons */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-[140px] animate-pulse rounded-admin-md border border-[rgba(244,114,182,0.2)] bg-admin-card p-5"
              />
            ))}
          </div>
          {/* Charts Skeletons */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="h-[380px] animate-pulse rounded-admin-md border border-[rgba(244,114,182,0.2)] bg-admin-card" />
            <div className="h-[380px] animate-pulse rounded-admin-md border border-[rgba(244,114,182,0.2)] bg-admin-card" />
          </div>
        </div>
      )}

      {/* ── Dashboard Content ── */}
      {!isLoading && !isError && data && (
        <div className="flex flex-col gap-6">
          {/* ── 1. Top Metric Cards (4 Cards) ── */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {/* Total Users */}
            <div
              onClick={() => handleNav("users")}
              className="group relative cursor-pointer overflow-hidden rounded-admin-md border border-[rgba(244,114,182,0.25)] bg-admin-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-admin-primary hover:shadow-[0_0_20px_rgba(244,114,182,0.15)]"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[0.78rem] font-medium uppercase tracking-[0.05em] text-admin-muted">
                    Total Users
                  </span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-[2rem] font-bold leading-none text-white">
                      {data.users.total.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-[12px] border border-[rgba(244,114,182,0.3)] bg-[rgba(244,114,182,0.12)] text-admin-primary group-hover:scale-105 group-hover:bg-[rgba(244,114,182,0.2)]">
                  <Users size={22} />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.76rem] text-admin-muted">
                <span className="flex items-center gap-1 text-emerald-400">
                  <UserCheck size={13} /> {data.users.approved} approved
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-pink-400">
                  <FemaleIcon size={13} /> {data.users.female}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-sky-400">
                  <MaleIcon size={13} /> {data.users.male}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-[rgba(244,114,182,0.15)] pt-2.5 text-[0.75rem] font-medium text-admin-primary">
                <span>Manage users</span>
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
              </div>
            </div>

            {/* Verification Queue */}
            <div
              onClick={() => handleNav("users")}
              className={`group relative cursor-pointer overflow-hidden rounded-admin-md border bg-admin-card p-5 transition-all duration-200 hover:-translate-y-0.5 ${
                data.users.pendingApproval > 0
                  ? "border-[rgba(245,158,11,0.5)] shadow-[0_0_20px_rgba(245,158,11,0.1)] hover:border-amber-400"
                  : "border-[rgba(244,114,182,0.25)] hover:border-admin-primary hover:shadow-[0_0_20px_rgba(244,114,182,0.15)]"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[0.78rem] font-medium uppercase tracking-[0.05em] text-admin-muted">
                    Verification Queue
                  </span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span
                      className={`text-[2rem] font-bold leading-none ${
                        data.users.pendingApproval > 0 ? "text-amber-400" : "text-white"
                      }`}
                    >
                      {data.users.pendingApproval}
                    </span>
                    {data.users.pendingApproval > 0 && (
                      <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[0.68rem] font-semibold text-amber-300">
                        Needs Action
                      </span>
                    )}
                  </div>
                </div>
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-[12px] border ${
                    data.users.pendingApproval > 0
                      ? "border-amber-500/40 bg-amber-500/15 text-amber-400"
                      : "border-[rgba(244,114,182,0.3)] bg-[rgba(244,114,182,0.12)] text-admin-primary"
                  } group-hover:scale-105`}
                >
                  {data.users.pendingApproval > 0 ? <ShieldAlert size={22} /> : <ShieldCheck size={22} />}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.76rem] text-admin-muted">
                <span className="flex items-center gap-1 text-admin-muted">
                  <Clock size={13} /> {data.users.pendingVerification} in progress
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-red-400">
                  <UserX size={13} /> {data.users.rejected} rejected
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-[rgba(244,114,182,0.15)] pt-2.5 text-[0.75rem] font-medium text-amber-400">
                <span>Review queue</span>
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
              </div>
            </div>

            {/* Home Carousel */}
            <div
              onClick={() => handleNav("home-carousel")}
              className="group relative cursor-pointer overflow-hidden rounded-admin-md border border-[rgba(244,114,182,0.25)] bg-admin-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-admin-primary hover:shadow-[0_0_20px_rgba(244,114,182,0.15)]"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[0.78rem] font-medium uppercase tracking-[0.05em] text-admin-muted">
                    Home Carousel
                  </span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-[2rem] font-bold leading-none text-white">
                      {data.carousel.total}
                    </span>
                    <span className="text-[0.8rem] text-emerald-400 font-medium">
                      ({data.carousel.active} active)
                    </span>
                  </div>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-[12px] border border-[rgba(244,114,182,0.3)] bg-[rgba(244,114,182,0.12)] text-admin-primary group-hover:scale-105 group-hover:bg-[rgba(244,114,182,0.2)]">
                  <Images size={22} />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.76rem] text-admin-muted">
                <span className="flex items-center gap-1 text-pink-400">
                  <FemaleIcon size={13} /> {data.carousel.femaleActive} female
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-sky-400">
                  <MaleIcon size={13} /> {data.carousel.maleActive} male
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-[rgba(244,114,182,0.15)] pt-2.5 text-[0.75rem] font-medium text-admin-primary">
                <span>Configure carousel</span>
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
              </div>
            </div>

            {/* Token Packages */}
            <div
              onClick={() => handleNav("token-packages")}
              className="group relative cursor-pointer overflow-hidden rounded-admin-md border border-[rgba(244,114,182,0.25)] bg-admin-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-admin-primary hover:shadow-[0_0_20px_rgba(244,114,182,0.15)]"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[0.78rem] font-medium uppercase tracking-[0.05em] text-admin-muted">
                    Token Packages
                  </span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-[2rem] font-bold leading-none text-white">
                      {data.tokenPackages.total}
                    </span>
                    <span className="text-[0.8rem] text-emerald-400 font-medium">
                      ({data.tokenPackages.active} live)
                    </span>
                  </div>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-[12px] border border-[rgba(244,114,182,0.3)] bg-[rgba(244,114,182,0.12)] text-admin-primary group-hover:scale-105 group-hover:bg-[rgba(244,114,182,0.2)]">
                  <Coins size={22} />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.76rem] text-admin-muted">
                <span className="flex items-center gap-1 text-pink-400">
                  <FemaleIcon size={13} /> {data.tokenPackages.female}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-sky-400">
                  <MaleIcon size={13} /> {data.tokenPackages.male}
                </span>
                <span>•</span>
                <span className="text-admin-muted">
                  {data.tokenPackages.inactive} inactive
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-[rgba(244,114,182,0.15)] pt-2.5 text-[0.75rem] font-medium text-admin-primary">
                <span>Manage packages</span>
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </div>

          {/* ── 2. NEW CHARTS SECTION (2 Interactive Charts) ── */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Chart 1: Face Verification & Account Status Analytics */}
            <div className="flex flex-col rounded-admin-md border border-[rgba(244,114,182,0.25)] bg-admin-card p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[rgba(244,114,182,0.3)] bg-[rgba(244,114,182,0.12)] text-admin-primary">
                    <PieChartIcon size={17} />
                  </div>
                  <div>
                    <h3 className="text-[1.05rem] font-bold text-white">Face Verification Status</h3>
                    <p className="text-[0.74rem] text-admin-muted">
                      Account verification breakdown & approval rate
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 rounded-full border border-[rgba(244,114,182,0.25)] bg-admin-surface px-3 py-1 text-[0.75rem]">
                  <span className="text-admin-muted">Pass Rate:</span>
                  <span className="font-bold text-emerald-400">{passRate}%</span>
                </div>
              </div>

              {/* Chart Body */}
              <div className="relative mt-2 flex h-[230px] w-full items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip
                      content={<VerificationTooltip />}
                      wrapperStyle={{ zIndex: 20, outline: "none" }}
                      allowEscapeViewBox={{ x: true, y: true }}
                    />
                    <Pie
                      data={safeVerificationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={hasVerificationData ? 4 : 0}
                      dataKey="value"
                      stroke="rgba(28, 21, 24, 0.9)"
                      strokeWidth={3}
                    >
                      {safeVerificationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                {/* Center Badge */}
                <div className="pointer-events-none absolute z-0 flex flex-col items-center justify-center text-center">
                  <span className="text-[1.5rem] font-black text-white leading-none">
                    {totalUsersCount}
                  </span>
                  <span className="text-[0.72rem] uppercase tracking-wider text-admin-muted font-medium mt-0.5">
                    Users
                  </span>
                </div>
              </div>

              {/* Custom Legend Badges */}
              <div className="mt-4 grid grid-cols-2 gap-2 border-t border-[rgba(244,114,182,0.15)] pt-4 sm:grid-cols-4">
                <div
                  onClick={() => handleNav("users")}
                  className="flex cursor-pointer flex-col rounded-lg border border-[rgba(16,185,129,0.25)] bg-[rgba(16,185,129,0.06)] p-2.5 transition-all hover:bg-[rgba(16,185,129,0.12)]"
                >
                  <div className="flex items-center gap-1.5 text-[0.72rem] font-semibold text-emerald-400">
                    <CheckCircle2 size={13} />
                    Approved
                  </div>
                  <div className="mt-1 text-[1.1rem] font-bold text-white">
                    {approvedCount}
                  </div>
                </div>

                <div
                  onClick={() => handleNav("users")}
                  className="flex cursor-pointer flex-col rounded-lg border border-[rgba(245,158,11,0.25)] bg-[rgba(245,158,11,0.06)] p-2.5 transition-all hover:bg-[rgba(245,158,11,0.12)]"
                >
                  <div className="flex items-center gap-1.5 text-[0.72rem] font-semibold text-amber-400">
                    <Clock size={13} />
                    Review
                  </div>
                  <div className="mt-1 text-[1.1rem] font-bold text-white">
                    {pendingApprovalCount}
                  </div>
                </div>

                <div
                  onClick={() => handleNav("users")}
                  className="flex cursor-pointer flex-col rounded-lg border border-[rgba(244,114,182,0.25)] bg-[rgba(244,114,182,0.06)] p-2.5 transition-all hover:bg-[rgba(244,114,182,0.12)]"
                >
                  <div className="flex items-center gap-1.5 text-[0.72rem] font-semibold text-pink-400">
                    <Layers size={13} />
                    Pending Scan
                  </div>
                  <div className="mt-1 text-[1.1rem] font-bold text-white">
                    {pendingScanCount}
                  </div>
                </div>

                <div
                  onClick={() => handleNav("users")}
                  className="flex cursor-pointer flex-col rounded-lg border border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.06)] p-2.5 transition-all hover:bg-[rgba(239,68,68,0.12)]"
                >
                  <div className="flex items-center gap-1.5 text-[0.72rem] font-semibold text-red-400">
                    <UserX size={13} />
                    Rejected
                  </div>
                  <div className="mt-1 text-[1.1rem] font-bold text-white">
                    {rejectedCount}
                  </div>
                </div>
              </div>
            </div>

            {/* Chart 2: Token Packages & Pricing Distribution */}
            <div className="flex flex-col rounded-admin-md border border-[rgba(244,114,182,0.25)] bg-admin-card p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[rgba(244,114,182,0.3)] bg-[rgba(244,114,182,0.12)] text-admin-primary">
                    <BarChart3 size={17} />
                  </div>
                  <div>
                    <h3 className="text-[1.05rem] font-bold text-white">Token Packages & Pricing</h3>
                    <p className="text-[0.74rem] text-admin-muted">
                      Configured token bundles, prices, and targets
                    </p>
                  </div>
                </div>

                {/* Metric Selector Toggle */}
                <div className="flex rounded-lg border border-[rgba(244,114,182,0.25)] bg-admin-surface p-0.5">
                  <button
                    type="button"
                    onClick={() => setTokenChartMetric("tokens")}
                    className={`rounded-md px-2.5 py-1 text-[0.72rem] font-semibold transition-all ${
                      tokenChartMetric === "tokens"
                        ? "bg-admin-primary text-white shadow-sm"
                        : "text-admin-muted hover:text-white"
                    }`}
                  >
                    Tokens
                  </button>
                  <button
                    type="button"
                    onClick={() => setTokenChartMetric("price")}
                    className={`rounded-md px-2.5 py-1 text-[0.72rem] font-semibold transition-all ${
                      tokenChartMetric === "price"
                        ? "bg-admin-primary text-white shadow-sm"
                        : "text-admin-muted hover:text-white"
                    }`}
                  >
                    Price ($)
                  </button>
                </div>
              </div>

              {/* Chart Body */}
              <div className="mt-2 h-[230px] w-full">
                {tokenChartData.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-admin-muted">
                    <Coins size={36} className="mb-2 opacity-50" />
                    <p className="text-[0.85rem]">No token packages available to display.</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={tokenChartData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="tokenBarGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#F472B6" stopOpacity={0.95} />
                          <stop offset="100%" stopColor="#DB2777" stopOpacity={0.65} />
                        </linearGradient>
                        <linearGradient id="priceBarGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#38BDF8" stopOpacity={0.95} />
                          <stop offset="100%" stopColor="#0284C7" stopOpacity={0.65} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(244, 114, 182, 0.1)"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="name"
                        stroke="#A1989E"
                        fontSize={11}
                        tickLine={false}
                        axisLine={{ stroke: "rgba(244, 114, 182, 0.2)" }}
                      />
                      <YAxis
                        stroke="#A1989E"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) =>
                          tokenChartMetric === "price" ? `$${val}` : val >= 1000 ? `${val / 1000}k` : val
                        }
                      />
                      <Tooltip content={<TokenTooltip />} />
                      <Bar
                        dataKey={tokenChartMetric}
                        fill={
                          tokenChartMetric === "tokens"
                            ? "url(#tokenBarGradient)"
                            : "url(#priceBarGradient)"
                        }
                        radius={[6, 6, 0, 0]}
                        maxBarSize={45}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Package Summary Footer */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[rgba(244,114,182,0.15)] pt-4 text-[0.76rem] text-admin-muted">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-pink-400" />
                    Female: <strong className="text-white">{data.tokenPackages.female}</strong>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-sky-400" />
                    Male: <strong className="text-white">{data.tokenPackages.male}</strong>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    Active: <strong className="text-white">{data.tokenPackages.active}</strong>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleNav("token-packages")}
                  className="flex items-center gap-1 font-semibold text-admin-primary hover:text-white"
                >
                  <span>Manage</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </div>

          {/* ── 3. Bottom Row: Recently Registered Users + Quick Actions ── */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            {/* Left: Recently Registered Users (7 cols) */}
            <div className="flex flex-col rounded-admin-md border border-[rgba(244,114,182,0.25)] bg-admin-card p-5 xl:col-span-7">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users size={18} className="text-admin-primary" />
                  <h3 className="text-[1.05rem] font-bold text-white">Recently Registered Users</h3>
                </div>
                <button
                  type="button"
                  onClick={() => handleNav("users")}
                  className="flex items-center gap-1 text-[0.78rem] font-medium text-admin-primary transition-colors hover:text-white"
                >
                  <span>View all users</span>
                  <ArrowRight size={13} />
                </button>
              </div>

              {data.recentUsers.length === 0 ? (
                <div className="py-8 text-center text-admin-muted">No users found.</div>
              ) : (
                <div className="flex flex-col divide-y divide-[rgba(244,114,182,0.12)]">
                  {data.recentUsers.map((user: AdminUser) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between py-3 transition-colors hover:bg-admin-surface/40"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[rgba(244,114,182,0.25)] bg-admin-surface text-[0.85rem] font-bold text-admin-primary">
                          {user.profileImage ? (
                            <img
                              src={user.profileImage}
                              alt={user.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            (user.name.charAt(0) || "U").toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-[0.88rem] font-semibold text-white">
                              {user.name}
                            </span>
                            {user.gender === "female" ? (
                              <span className="text-pink-400" title="Female">
                                <FemaleIcon size={13} />
                              </span>
                            ) : user.gender === "male" ? (
                              <span className="text-sky-400" title="Male">
                                <MaleIcon size={13} />
                              </span>
                            ) : null}
                            <span className="rounded bg-[rgba(244,114,182,0.12)] px-1.5 py-0.5 text-[0.68rem] font-medium uppercase text-admin-primary">
                              {user.role}
                            </span>
                          </div>
                          <span className="truncate text-[0.76rem] text-admin-muted">
                            {user.email}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <StatusBadge value={user.accountStatus} />
                        <span className="hidden text-[0.75rem] text-admin-muted sm:inline-block">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : ""}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Quick Module Actions & Active Bundles (5 cols) */}
            <div className="flex flex-col gap-6 xl:col-span-5">
              {/* Quick Actions */}
              <div className="rounded-admin-md border border-[rgba(244,114,182,0.25)] bg-admin-card p-5">
                <div className="mb-4 flex items-center gap-2">
                  <TrendingUp size={18} className="text-admin-primary" />
                  <h3 className="text-[1.05rem] font-bold text-white">Quick Module Actions</h3>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <button
                    type="button"
                    onClick={() => handleNav("users")}
                    className="flex items-center justify-between rounded-admin border border-[rgba(244,114,182,0.2)] bg-admin-surface p-3.5 text-left transition-all hover:border-admin-primary hover:bg-[rgba(244,114,182,0.08)]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[rgba(244,114,182,0.15)] text-admin-primary">
                        <Users size={18} />
                      </div>
                      <div>
                        <div className="text-[0.88rem] font-semibold text-white">User Management</div>
                        <div className="text-[0.74rem] text-admin-muted">
                          Search, verify, edit roles and balances
                        </div>
                      </div>
                    </div>
                    <ArrowRight size={15} className="text-admin-muted" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNav("home-carousel")}
                    className="flex items-center justify-between rounded-admin border border-[rgba(244,114,182,0.2)] bg-admin-surface p-3.5 text-left transition-all hover:border-admin-primary hover:bg-[rgba(244,114,182,0.08)]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[rgba(244,114,182,0.15)] text-admin-primary">
                        <Images size={18} />
                      </div>
                      <div>
                        <div className="text-[0.88rem] font-semibold text-white">Home Carousel</div>
                        <div className="text-[0.74rem] text-admin-muted">
                          Upload, reorder, and toggle banner slides
                        </div>
                      </div>
                    </div>
                    <ArrowRight size={15} className="text-admin-muted" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNav("token-packages")}
                    className="flex items-center justify-between rounded-admin border border-[rgba(244,114,182,0.2)] bg-admin-surface p-3.5 text-left transition-all hover:border-admin-primary hover:bg-[rgba(244,114,182,0.08)]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[rgba(244,114,182,0.15)] text-admin-primary">
                        <Coins size={18} />
                      </div>
                      <div>
                        <div className="text-[0.88rem] font-semibold text-white">Token Packages</div>
                        <div className="text-[0.74rem] text-admin-muted">
                          Create & manage pricing and token bundles
                        </div>
                      </div>
                    </div>
                    <ArrowRight size={15} className="text-admin-muted" />
                  </button>
                </div>
              </div>

              {/* Active Packages Preview */}
              <div className="rounded-admin-md border border-[rgba(244,114,182,0.25)] bg-admin-card p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coins size={18} className="text-admin-primary" />
                    <h3 className="text-[1.05rem] font-bold text-white">Live Token Tiers</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleNav("token-packages")}
                    className="flex items-center gap-1 text-[0.78rem] font-medium text-admin-primary transition-colors hover:text-white"
                  >
                    <span>View all</span>
                    <ArrowRight size={13} />
                  </button>
                </div>

                {data.tokenPackages.recent.length === 0 ? (
                  <div className="py-5 text-center text-admin-muted">No token packages found.</div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {data.tokenPackages.recent.slice(0, 3).map((pkg: TokenPackage) => (
                      <div
                        key={pkg.id}
                        className="flex items-center justify-between rounded-admin border border-[rgba(244,114,182,0.15)] bg-admin-surface px-3 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[0.9rem]">🪙</span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[0.84rem] font-bold text-white">
                                {pkg.tokens.toLocaleString()} Tokens
                              </span>
                              {pkg.label && (
                                <span className="rounded bg-pink-500/20 px-1 py-0.2 text-[0.62rem] font-semibold text-pink-300">
                                  {pkg.label}
                                </span>
                              )}
                            </div>
                            <span className="text-[0.7rem] text-admin-muted capitalize">
                              Target: {pkg.gender}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-[0.88rem] font-bold text-white">
                            ${pkg.price.toFixed(2)}
                          </div>
                          <span
                            className={`text-[0.68rem] font-medium ${
                              pkg.isActive ? "text-emerald-400" : "text-admin-muted"
                            }`}
                          >
                            {pkg.isActive ? "Active" : "Disabled"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
