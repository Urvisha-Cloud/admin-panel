import {
  LayoutDashboard,
  Images,
  Users,
  Building2,
  Coins,
  Gift,
  Headphones,
  Settings,
  CircleDollarSign,
  Share2,
  Award,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

/** Sidebar groups — the header reads the same list for the page title and section. Agency + Withdrawals are superAdmin-only. */
export const getNavSections = (isSuperAdmin: boolean): NavSection[] => [
  {
    title: "Overview",
    items: [{ id: "dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Users",
    items: [
      { id: "users", label: "Users", icon: Users },
      { id: "referrals", label: "Referrals", icon: Share2 },
      { id: "levels", label: "Levels", icon: Award },
      { id: "customer-service", label: "Customer Service", icon: Headphones },
    ],
  },
  {
    title: "Finance",
    items: [
      { id: "token-packages", label: "Token Packages", icon: Coins },
      ...(isSuperAdmin
        ? [
            { id: "withdrawals", label: "Withdrawals", icon: Wallet },
            { id: "agency", label: "Agency", icon: Building2 },
          ]
        : []),
      { id: "redeem-credits", label: "Gift Packages", icon: CircleDollarSign },
    ],
  },
  {
    title: "Content",
    items: [
      { id: "home-carousel", label: "Home Carousel", icon: Images },
      { id: "bonus", label: "Bonus", icon: Gift },
    ],
  },
  {
    title: "System",
    items: [{ id: "settings", label: "Settings", icon: Settings }],
  },
];

/** The nav item for a tab plus its section title, or null for an unknown tab */
export const findNavItem = (tab: string): { item: NavItem; section: string } | null => {
  for (const section of getNavSections(true)) {
    const item = section.items.find((navItem) => navItem.id === tab);
    if (item) return { item, section: section.title };
  }
  return null;
};
