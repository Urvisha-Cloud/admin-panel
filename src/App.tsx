import React, { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  getCurrentAdmin,
  logoutAdmin,
  refreshCurrentAdmin,
} from "./services/auth.service";
import { ADMIN_AUTH_CHANGED_EVENT } from "./constants";
import { AdminLayout } from "./layouts/AdminLayout";
import { LoginPage } from "./pages/LoginPage";
import { UserAuth } from "./types/homeCarousel.types";
import { Loader } from "./components/common/Loader";
import "./theme/theme.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  const [user, setUser] = useState<UserAuth | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  useEffect(() => {
    const savedUser = getCurrentAdmin();
    if (savedUser && (savedUser.role === "admin" || savedUser.role === "superAdmin")) {
      setUser(savedUser);
    }
    setIsInitializing(false);
  }, []);
  const isSignedIn = Boolean(user);

  useEffect(() => {
    if (!isSignedIn) return;

    const syncRole = async () => {
      const latest = await refreshCurrentAdmin();
      setUser((current) => {
        if (!latest) return null;
        if (current && current._id === latest._id && current.role === latest.role && current.name === latest.name) {
          return current;
        }
        return latest;
      });
    };

    syncRole();
    window.addEventListener("focus", syncRole);
    window.addEventListener(ADMIN_AUTH_CHANGED_EVENT, syncRole);
    return () => {
      window.removeEventListener("focus", syncRole);
      window.removeEventListener(ADMIN_AUTH_CHANGED_EVENT, syncRole);
    };
    // Keyed on sign-in, not the id: older saved sessions have no _id, which kept this from ever running
  }, [isSignedIn]);

  const handleLogout = () => {
    logoutAdmin();
    setUser(null);
  };

  const handleLoginSuccess = (authenticatedUser: UserAuth) => {
    setUser(authenticatedUser);
  };

  if (isInitializing) {
    return <Loader fullscreen text="Initializing Nexa Admin..." showLogo />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      {user ? (
        <AdminLayout user={user} onLogout={handleLogout} />
      ) : (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      )}
    </QueryClientProvider>
  );
};

export default App;
