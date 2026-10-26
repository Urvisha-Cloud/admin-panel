import React, { useEffect, useState } from "react";
import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import { DashboardPage } from "../pages/Dashboard/DashboardPage";
import { HomeCarouselPage } from "../pages/HomeCarousel/HomeCarouselPage";
import { UserManagementPage } from "../pages/Users/UserManagementPage";
import { TokenPackagesPage } from "../pages/TokenPackages/TokenPackagesPage";
import { WeeklyBonusPage } from "../pages/Bonus/WeeklyBonusPage";
import { CustomerServicePage } from "../pages/CustomerService/CustomerServicePage";
import { RedeemCreditsPage } from "../pages/RedeemCredits/RedeemCreditsPage";
import { SettingsPage } from "../pages/Settings/SettingsPage";
import { AgencyPage } from "../pages/Agency/AgencyPage";
import { GlobalQueryProgress } from "../components/common/GlobalQueryProgress";
import { UserAuth } from "../types/homeCarousel.types";
import { getPathSegments, navigate, subscribeToLocation } from "../utils/navigation";

interface AdminLayoutProps {
  user: UserAuth | null;
  onLogout: () => void;
}

const DEFAULT_TAB = "dashboard";
const TABS = [
  "dashboard",
  "home-carousel",
  "users",
  "agency",
  "customer-service",
  "token-packages",
  "redeem-credits",
  "bonus",
  "settings",
];

// The active tab lives in the URL path (e.g. /agency) so it survives a page refresh.
// Anything after the first segment is a sub-route owned by that page (e.g. /agency/withdrawals/<id>)
const getTabFromPath = (): string => {
  const tab = getPathSegments()[0] ?? "";
  return TABS.includes(tab) ? tab : DEFAULT_TAB;
};

export const AdminLayout: React.FC<AdminLayoutProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTabState] = useState<string>(getTabFromPath);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  const setActiveTab = (tab: string) => {
    navigate(`/${tab}`);
    setActiveTabState(tab);
  };

  // Keep state in sync with browser back/forward and in-app navigation
  useEffect(() => subscribeToLocation(() => setActiveTabState(getTabFromPath())), []);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  const isSuperAdmin = user?.role === "superAdmin";

  return (
    <div className="flex h-screen w-full overflow-hidden bg-admin-main">
      {/* Global subtle network activity progress line */}
      <GlobalQueryProgress />

      {/* Sidebar on the left with its own top branding + toggle */}
      <Sidebar
        activeTab={activeTab}
        isCollapsed={isSidebarCollapsed}
        user={user}
        onToggleSidebar={toggleSidebar}
        onSelectTab={(tab) => setActiveTab(tab)}
      />

      {/* Main Content Area on the right */}
      <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
        <Header user={user} onLogout={onLogout} />
        <main className="flex-1 overflow-y-auto px-5 py-6 sm:px-8 sm:py-8">
          {activeTab === "dashboard" ? (
            <DashboardPage onNavigateTab={(tab) => setActiveTab(tab)} />
          ) : activeTab === "home-carousel" ? (
            <HomeCarouselPage />
          ) : activeTab === "users" ? (
            <UserManagementPage />
          ) : activeTab === "agency" && isSuperAdmin ? (
            <AgencyPage />
          ) : activeTab === "customer-service" ? (
            <CustomerServicePage />
          ) : activeTab === "token-packages" ? (
            <TokenPackagesPage />
          ) : activeTab === "redeem-credits" ? (
            <RedeemCreditsPage />
          ) : activeTab === "bonus" ? (
            <WeeklyBonusPage />
          ) : activeTab === "settings" ? (
            <SettingsPage />
          ) : (
            <div className="rounded-admin-md border border-[rgba(244,114,182,0.2)] bg-admin-card p-10 text-center text-admin-muted">
              <h3 className="mb-2 text-white">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Section
              </h3>
              <p>This module is currently in development.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
