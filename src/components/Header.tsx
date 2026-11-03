import React, { useState } from "react";
import { LogOut, Bell, LayoutDashboard } from "lucide-react";
import { UserAuth } from "../types/homeCarousel.types";
import { ConfirmModal } from "./ConfirmModal";
import { findNavItem } from "./navSections";

interface HeaderProps {
  user: UserAuth | null;
  activeTab: string;
  onLogout: () => void;
}

const ROLE_LABELS: Record<string, string> = {
  superAdmin: "Super admin",
  admin: "Admin",
};

export const Header: React.FC<HeaderProps> = ({ user, activeTab, onLogout }) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);

  // Page icon, title and section follow the sidebar groups
  const nav = findNavItem(activeTab);
  const PageIcon = nav?.item.icon ?? LayoutDashboard;
  const pageTitle = nav?.item.label ?? "Dashboard";
  const sectionTitle = nav?.section ?? "Overview";

  const email = user?.email || "admin";
  const initial = email.charAt(0).toUpperCase();
  const roleLabel = ROLE_LABELS[user?.role ?? ""] ?? "Admin";

  return (
    <header className="flex h-[68px] shrink-0 items-center justify-between gap-4 border-b border-[rgba(244,114,182,0.2)] bg-admin-card px-5 backdrop-blur-xl sm:px-8">
      {/* Left: current page icon, title and its sidebar section */}
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[rgba(244,114,182,0.15)] text-admin-primary">
          <PageIcon size={18} strokeWidth={2.2} />
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-[1rem] font-bold leading-tight tracking-[-0.01em] text-white">
            {pageTitle}
          </h2>
          <p className="truncate text-[0.72rem] text-admin-subtle">{sectionTitle}</p>
        </div>
      </div>

      {/* Right: bell | user details | sign out — all visible, no dropdown */}
      <div className="flex shrink-0 items-center gap-3">
        <button
          type="button"
          title="Notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-admin-muted transition-colors hover:text-white"
        >
          <Bell size={17} />
          <span className="absolute right-[9px] top-[8px] h-[7px] w-[7px] rounded-full border-[1.5px] border-admin-card bg-admin-primary" />
        </button>

        <div className="hidden h-7 w-px bg-white/10 sm:block" />

        <div className="flex min-w-0 items-center gap-2.5">
          {/* Same gradient + glow as the sidebar logo */}
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[0.85rem] font-semibold text-white"
            style={{
              background: "linear-gradient(135deg, #F472B6 0%, #DB2777 100%)",
              boxShadow: "0 0 16px rgba(244, 114, 182, 0.35)",
            }}
          >
            {initial}
          </div>
          <div className="hidden min-w-0 sm:block">
            <p className="max-w-[220px] truncate text-[0.82rem] font-medium leading-tight text-white">{email}</p>
            <p className="text-[0.7rem] font-semibold text-admin-primary">{roleLabel}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsConfirmOpen(true)}
          title="Sign out"
          aria-label="Sign out"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(251,113,133,0.35)] bg-[rgba(251,113,133,0.08)] text-[#FB7185] transition-colors hover:bg-[rgba(251,113,133,0.18)]"
        >
          <LogOut size={16} />
        </button>
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Sign Out"
        message="Are you sure you want to sign out of the admin panel?"
        confirmText="Sign Out"
        cancelText="Cancel"
        variant="danger"
        icon={<LogOut size={21} />}
        onConfirm={() => {
          setIsConfirmOpen(false);
          onLogout();
        }}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </header>
  );
};
