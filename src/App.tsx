import React, { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getCurrentAdmin, logoutAdmin } from "./services/auth.service";
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
