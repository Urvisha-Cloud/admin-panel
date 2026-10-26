import React from "react";
import { MessageCircleHeart } from "lucide-react";

export type LoaderSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface LoaderProps {
  /** Size of the spinner ring */
  size?: LoaderSize;
  /** Optional status or subtitle text */
  text?: string;
  /** Whether to render as full-screen overlay */
  fullscreen?: boolean;
  /** Whether to render with a semi-transparent glass backdrop */
  overlay?: boolean;
  /** Show the brand flame logo in the center */
  showLogo?: boolean;
  /** Custom extra class names */
  className?: string;
  /** Minimum height for container mode */
  minHeight?: string | number;
}

const sizeMap: Record<LoaderSize, { ring: string; border: string; logo: number; text: string }> = {
  xs: { ring: "h-4 w-4", border: "border-2", logo: 8, text: "text-xs" },
  sm: { ring: "h-6 w-6", border: "border-2", logo: 12, text: "text-xs" },
  md: { ring: "h-10 w-10", border: "border-[2.5px]", logo: 18, text: "text-sm" },
  lg: { ring: "h-14 w-14", border: "border-[3px]", logo: 24, text: "text-base" },
  xl: { ring: "h-20 w-20", border: "border-[3.5px]", logo: 32, text: "text-base" },
};

export const Loader: React.FC<LoaderProps> = ({
  size = "md",
  text,
  fullscreen = false,
  overlay = false,
  showLogo = false,
  className = "",
  minHeight,
}) => {
  const config = sizeMap[size] || sizeMap.md;

  const spinnerContent = (
    <div className="flex flex-col items-center justify-center gap-3.5 transition-all duration-300">
      {/* ── Ring Spinner / Logo Container ── */}
      <div className="relative flex items-center justify-center">
        {/* Background track ring */}
        <div
          className={`${config.ring} ${config.border} rounded-full border-[rgba(244,114,182,0.15)]`}
        />

        {/* Active spinning arc */}
        <div
          className={`absolute ${config.ring} ${config.border} animate-spin rounded-full border-transparent border-t-admin-primary border-r-admin-primary`}
          style={{ animationDuration: "0.85s", animationTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)" }}
        />

        {/* Center Logo or Accent Dot */}
        {showLogo ? (
          <div
            className="absolute flex items-center justify-center rounded-lg text-white transition-transform duration-300"
            style={{
              background: "linear-gradient(135deg, #F472B6 0%, #DB2777 100%)",
              boxShadow: "0 0 14px rgba(244, 114, 182, 0.35)",
              padding: size === "xl" ? "8px" : size === "lg" ? "6px" : "4px",
            }}
          >
            <MessageCircleHeart size={config.logo} strokeWidth={2.2} />
          </div>
        ) : size === "lg" || size === "xl" ? (
          <div className="absolute h-2 w-2 rounded-full bg-admin-primary/70 shadow-[0_0_8px_var(--primary)]" />
        ) : null}
      </div>

      {/* ── Status Text ── */}
      {text && (
        <p
          className={`font-medium tracking-wide text-admin-muted animate-pulse ${config.text}`}
        >
          {text}
        </p>
      )}
    </div>
  );

  if (fullscreen) {
    return (
      <div
        className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-admin-main transition-opacity duration-300 ${
          overlay ? "bg-admin-main/90 backdrop-blur-md" : "bg-admin-main"
        } ${className}`}
      >
        {/* Ambient Top Glow */}
        <div
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[260px] w-[500px] rounded-full opacity-20 blur-[100px]"
          style={{ background: "radial-gradient(circle, var(--primary) 0%, transparent 70%)" }}
        />

        <div className="relative flex flex-col items-center gap-4">
          {/* Brand Box above spinner if xl / fullscreen */}
          <div className="flex items-center gap-2.5 mb-1">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-[11px] text-white"
              style={{
                background: "linear-gradient(135deg, #F472B6 0%, #DB2777 100%)",
                boxShadow: "0 0 18px rgba(244, 114, 182, 0.4)",
              }}
            >
              <MessageCircleHeart size={22} strokeWidth={2.3} />
            </div>
            <span className="text-xl font-bold tracking-tight text-white font-display">
              Nexa Admin
            </span>
          </div>

          <div className="mt-2">
            <Loader size={size === "md" ? "lg" : size} text={text} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center p-6 ${className}`}
      style={minHeight ? { minHeight: typeof minHeight === "number" ? `${minHeight}px` : minHeight } : undefined}
    >
      {spinnerContent}
    </div>
  );
};

export default Loader;
