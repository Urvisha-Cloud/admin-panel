import React, { useState } from "react";
import { LogOut, User as UserIcon, Bell } from "lucide-react";
import { UserAuth } from "../types/homeCarousel.types";
import { ConfirmModal } from "./ConfirmModal";

interface HeaderProps {
  user: UserAuth | null;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);

  return (
    <header className="flex h-[68px] shrink-0 items-center justify-between border-b border-[rgba(244,114,182,0.2)] bg-admin-card px-5 backdrop-blur-xl sm:px-8">
      {/* Left Context / Status */}
      <div className="flex items-center gap-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(244,114,182,0.2)] bg-[rgba(244,114,182,0.08)] px-3 py-1 text-[0.78rem] font-semibold tracking-[0.02em] text-admin-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-admin-primary shadow-[0_0_6px_var(--primary)]" />
          <span>ADMIN DASHBOARD</span>
        </div>
      </div>

      {/* Right: User Pill, Notification Bell, Sign Out */}
      <div className="flex items-center gap-3 sm:gap-3.5">
        {/* User Account Pill */}
        <div className="flex items-center gap-2.5 rounded-full border border-[rgba(244,114,182,0.2)] bg-admin-surface py-[5px] pl-[6px] pr-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[rgba(244,114,182,0.2)] text-admin-primary">
            <UserIcon size={15} />
          </div>
          <span className="text-[0.82rem] font-medium text-white">
            {user?.email || "admin@reactapp.com"}
          </span>
          <span className="rounded-[10px] bg-[rgba(244,114,182,0.25)] px-[7px] py-[2px] text-[0.65rem] font-bold uppercase tracking-[0.04em] text-admin-primary">
            {user?.role || "ADMIN"}
          </span>
        </div>

        {/* Notification Bell */}
        <button
          type="button"
          title="Notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(244,114,182,0.2)] bg-admin-surface text-admin-muted transition-colors hover:border-[rgba(244,114,182,0.2)]-border-hover hover:text-white"
        >
          <Bell size={17} />
          <span className="absolute right-2 top-[7px] h-1.5 w-1.5 rounded-full bg-admin-primary shadow-[0_0_6px_var(--primary)]" />
        </button>

        {/* Sign Out Button */}
        <button
          type="button"
          onClick={() => setIsConfirmOpen(true)}
          title="Sign Out"
          className="flex items-center gap-1.5 rounded-admin border border-[rgba(244,114,182,0.2)] bg-transparent px-[14px] py-2 text-[0.85rem] font-medium text-admin-muted transition-all hover:border-red-500 hover:bg-[rgba(239,68,68,0.12)] hover:text-red-400"
        >
          <LogOut size={15} />
          <span>Sign Out</span>
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
