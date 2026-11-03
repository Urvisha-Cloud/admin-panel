import { MessageCircleHeart, ChevronLeft, ChevronRight } from "lucide-react";
import { UserAuth } from "../types/homeCarousel.types";
import { getNavSections } from "./navSections";

interface SidebarProps {
  activeTab: string;
  isCollapsed: boolean;
  user?: UserAuth | null;
  onToggleSidebar: () => void;
  onSelectTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  isCollapsed,
  user,
  onToggleSidebar,
  onSelectTab,
}) => {
  const isSuperAdmin = user?.role === "superAdmin";

  const navSections = getNavSections(isSuperAdmin);

  return (
    <aside
      className={`sticky top-0 z-50 flex h-screen shrink-0 flex-col overflow-hidden border-r border-[rgba(244,114,182,0.2)] bg-admin-card transition-[width] duration-300 ${
        isCollapsed ? "w-[72px]" : "w-[250px]"
      }`}
    >
      {/* ── Top Brand Header Section inside Sidebar ── */}
      <div
        className={`flex h-[68px] shrink-0 items-center border-b border-[rgba(244,114,182,0.2)] bg-admin-card px-4 ${
          isCollapsed ? "justify-center" : "justify-between"
        }`}
      >
        {!isCollapsed ? (
          <div className="flex min-w-0 items-center gap-2.5">
            {/* Nexa App Icon Box */}
            <div
              className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[11px] text-white"
              style={{
                background: "linear-gradient(135deg, #F472B6 0%, #DB2777 100%)",
                boxShadow: "0 0 16px rgba(244, 114, 182, 0.35)",
              }}
            >
              <MessageCircleHeart size={20} strokeWidth={2.3} />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-[1.05rem] font-bold leading-[1.2] tracking-[-0.01em] text-white">
                Nexa Admin
              </h1>
              <p className="truncate text-[0.7rem] text-admin-muted">
                Social Chat &amp; Calling
              </p>
            </div>
          </div>
        ) : (
          <div
            onClick={onToggleSidebar}
            title="Expand Sidebar"
            className="flex h-[38px] w-[38px] shrink-0 cursor-pointer items-center justify-center rounded-[11px] text-white"
            style={{
              background: "linear-gradient(135deg, #F472B6 0%, #DB2777 100%)",
              boxShadow: "0 0 16px rgba(244, 114, 182, 0.35)",
            }}
          >
            <MessageCircleHeart size={20} strokeWidth={2.3} />
          </div>
        )}

        {/* Circular Collapse Toggle Button */}
        {!isCollapsed && (
          <button
            type="button"
            onClick={onToggleSidebar}
            title="Collapse sidebar"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[rgba(244,114,182,0.3)] bg-[rgba(244,114,182,0.16)] text-admin-primary transition-all duration-200 hover:scale-[1.06] hover:bg-[rgba(244,114,182,0.3)]"
          >
            <ChevronLeft size={15} />
          </button>
        )}
      </div>

      {/* ── Navigation Menu Items ── */}
      <nav className="flex flex-1 flex-col overflow-y-auto px-3 py-4">
        {navSections.map((section, sectionIndex) => (
          <div key={section.title} className="flex flex-col gap-1">
            {/* Section label when open; a thin divider between groups when collapsed */}
            {isCollapsed ? (
              sectionIndex > 0 && <div className="mx-auto my-2 h-px w-8 bg-[rgba(244,114,182,0.18)]" />
            ) : (
              <div
                className={`whitespace-nowrap px-[10px] pb-1.5 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-admin-subtle ${
                  sectionIndex > 0 ? "pt-4" : ""
                }`}
              >
                {section.title}
              </div>
            )}

            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`flex w-full items-center whitespace-nowrap rounded-admin text-left text-[0.88rem] transition-all duration-[180ms] ${
                    isCollapsed ? "justify-center px-0 py-[10px]" : "gap-[14px] px-[14px] py-[10px]"
                  } ${
                    isActive
                      ? "border border-[rgba(244,114,182,0.45)] bg-[rgba(244,114,182,0.16)] font-semibold text-white shadow-[0_0_15px_rgba(244,114,182,0.16)]"
                      : "border border-transparent font-normal text-admin-muted hover:bg-admin-surface hover:text-white"
                  }`}
                >
                  <Icon
                    size={18}
                    color={isActive ? "var(--primary)" : "currentColor"}
                    className="shrink-0"
                  />
                  {!isCollapsed && (
                    <span
                      className={`tracking-[-0.01em] ${isActive ? "text-white" : "inherit"}`}
                    >
                      {item.label}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Expand Button for Collapsed Mode at Bottom */}
      {isCollapsed && (
        <div className="flex shrink-0 justify-center border-t border-[rgba(244,114,182,0.2)] px-2 py-4">
          <button
            type="button"
            onClick={onToggleSidebar}
            title="Expand sidebar"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[rgba(244,114,182,0.3)] bg-[rgba(244,114,182,0.16)] text-admin-primary"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </aside>
  );
};
