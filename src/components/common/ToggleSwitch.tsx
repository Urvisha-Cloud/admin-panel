import React from "react";

interface ToggleSwitchProps {
  checked: boolean;
  onChange: () => void;
  title?: string;
  disabled?: boolean;
}

/** Compact pill switch in the admin pink — no glow, so no halo/box around it on dark rows */
export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange, title, disabled }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={onChange}
    title={title}
    disabled={disabled}
    className={`relative inline-flex h-[18px] w-8 shrink-0 items-center rounded-full p-[2px] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary/40 disabled:cursor-not-allowed disabled:opacity-60 ${
      checked ? "" : "bg-white/15 hover:bg-white/20"
    }`}
    // Same pink gradient as the logo / primary buttons
    style={checked ? { background: "linear-gradient(135deg, #F472B6 0%, #DB2777 100%)" } : undefined}
  >
    <span
      aria-hidden="true"
      className={`pointer-events-none inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform duration-200 ease-in-out ${
        checked ? "translate-x-3.5" : "translate-x-0"
      }`}
    />
  </button>
);

export default ToggleSwitch;
