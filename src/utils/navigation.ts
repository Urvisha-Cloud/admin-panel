import { LOCATION_CHANGE_EVENT } from "../constants";

if (window.location.hash.startsWith("#")) {
  const legacyPath = window.location.hash.replace(/^#\/?/, "");
  if (legacyPath) {
    window.history.replaceState(null, "", `/${legacyPath}`);
  }
}

export const getPathSegments = (): string[] =>
  window.location.pathname.split("/").filter(Boolean).map(decodeURIComponent);

export const navigate = (path: string, options: { replace?: boolean } = {}) => {
  const target = path.startsWith("/") ? path : `/${path}`;
  if (window.location.pathname === target) return;
  if (options.replace) {
    window.history.replaceState(null, "", target);
  } else {
    window.history.pushState(null, "", target);
  }
  window.dispatchEvent(new Event(LOCATION_CHANGE_EVENT));
};

export const subscribeToLocation = (callback: () => void) => {
  window.addEventListener("popstate", callback);
  window.addEventListener(LOCATION_CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("popstate", callback);
    window.removeEventListener(LOCATION_CHANGE_EVENT, callback);
  };
};
