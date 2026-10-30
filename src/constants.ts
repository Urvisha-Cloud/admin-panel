export const DEFAULT_ADMIN_TAB = "dashboard";
export const ADMIN_TABS = [
  "dashboard",
  "home-carousel",
  "users",
  "referrals",
  "levels",
  "agency",
  "customer-service",
  "token-packages",
  "redeem-credits",
  "bonus",
  "settings",
];

export const ADMIN_AUTH_CHANGED_EVENT = "admin-auth-changed";
export const LOCATION_CHANGE_EVENT = "app:locationchange";

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PAGE_SIZE = 20;

export const DASHBOARD_QUERY_KEY = ["admin-dashboard"];
export const USERS_QUERY_KEY = ["admin-users"];
export const CAROUSEL_QUERY_KEY = ["home-carousel"];
export const TOKEN_PACKAGES_QUERY_KEY = ["admin-token-packages"];
export const REDEEM_PACKAGES_QUERY_KEY = ["admin-redeem-packages"];
export const WEEKLY_BONUS_QUERY_KEY = ["admin-weekly-bonuses"];
export const AGENCIES_QUERY_KEY = ["admin-agencies"];
export const AGENCY_DETAIL_QUERY_KEY = ["admin-agency-detail"];
export const AGENCY_WITHDRAWALS_QUERY_KEY = ["admin-agency-withdrawals"];
export const REFERRALS_QUERY_KEY = ["admin-referrals"];
export const TOP_REFERRERS_QUERY_KEY = ["admin-top-referrers"];
export const INVITER_REFERRALS_QUERY_KEY = ["admin-inviter-referrals"];
export const LEVEL_CONFIG_QUERY_KEY = ["admin-level-config"];
export const LEVEL_USERS_QUERY_KEY = ["admin-level-users"];
export const LEVEL_SUMMARY_QUERY_KEY = ["admin-level-summary"];

export const TOP_REFERRERS_LIMIT = 10;

// Levels — keep in line with BE/src/constants.js
export const MAX_LEVEL_TIERS = 50;
export const MAX_INACTIVITY_DAYS = 365;
export const TOKEN_PREVIEW_AMOUNTS = [1000, 2000, 5000, 10000];
