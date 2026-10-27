import React, { useState } from "react";
import { MessageCircleHeart, Lock, Mail, AlertCircle, ArrowRight } from "lucide-react";
import { loginAdmin } from "../services/auth.service";
import { UserAuth } from "../types/homeCarousel.types";
import { EMAIL_REGEX } from "../constants";

const getLoginErrorMessage = (err: any): string => {
  // No response at all: server down, wrong URL, CORS, or timeout
  if (err?.response === undefined && (err?.code === "ERR_NETWORK" || err?.code === "ECONNABORTED" || err?.request)) {
    return err?.code === "ECONNABORTED"
      ? "The server took too long to respond. Please try again."
      : "Unable to reach the server. Please check your connection or try again later.";
  }

  const status = err?.response?.status;
  const serverMessage = err?.response?.data?.message;

  if (status === 401) return "Invalid email or password.";
  if (status === 403) return serverMessage || "Your account does not have access.";
  if (status === 400 || status === 422) return serverMessage || "Please check the details you entered.";
  if (status === 429) return "Too many attempts. Please wait a moment and try again.";
  if (status >= 500) return "Something went wrong on the server. Please try again later.";

  return serverMessage || err?.message || "Failed to sign in. Please verify your credentials.";
};

interface LoginPageProps {
  onLoginSuccess: (user: UserAuth) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    // Manual client-side validation
    if (!email.trim()) {
      setErrorMessage("Please enter your admin email address.");
      return;
    }

    if (!EMAIL_REGEX.test(email.trim())) {
      setErrorMessage("Please enter a valid email address (e.g. admin@example.com).");
      return;
    }

    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    try {
      setIsLoading(true);
      const user = await loginAdmin(email.trim(), password);
      onLoginSuccess(user);
    } catch (err: any) {
      setErrorMessage(getLoginErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex h-screen w-full items-center justify-center overflow-y-auto bg-admin-main p-5">
      {/* Background glow effects */}
      <div
        className="pointer-events-none absolute left-[20%] top-[10%] h-[500px] w-[500px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(244, 114, 182, 0.12) 0%, rgba(0,0,0,0) 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute bottom-[10%] right-[20%] h-[400px] w-[400px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(219, 39, 119, 0.08) 0%, rgba(0,0,0,0) 70%)",
        }}
      />

      <div className="relative z-10 w-full max-w-[420px] rounded-admin-lg border border-[rgba(244,114,182,0.2)] bg-admin-card px-8 py-9 shadow-admin backdrop-blur-2xl">
        {/* Brand Header */}
        <div className="mb-7 text-center">
          <div
            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[16px] text-white shadow-glow"
            style={{
              background: "linear-gradient(135deg, #F472B6 0%, #DB2777 100%)",
            }}
          >
            <MessageCircleHeart size={30} strokeWidth={2.3} />
          </div>
          <h2 className="text-[1.6rem] font-bold text-white">
            Nexa Admin
          </h2>
          <p className="mt-1 text-[0.85rem] text-admin-muted">
            Sign in to manage Home Carousel &amp; App Assets
          </p>
        </div>

        {errorMessage && (
          <div className="mb-5 flex items-center gap-2 rounded-admin border border-[rgba(244,114,182,0.2)]-danger bg-admin-danger-bg px-3.5 py-2.5 text-[0.85rem] text-red-400">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-[18px]">
          <div>
            <label className="mb-1.5 block text-[0.85rem] font-semibold text-admin-muted">
              Email Address
            </label>
            <div className="flex items-center gap-2.5 rounded-admin border border-[rgba(244,114,182,0.2)] bg-admin-surface px-3.5 py-3">
              <Mail size={18} color="var(--text-subtle)" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@reactapp.com"
                required
                className="w-full border-0 bg-transparent text-[0.9rem] text-white outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[0.85rem] font-semibold text-admin-muted">
              Password
            </label>
            <div className="flex items-center gap-2.5 rounded-admin border border-[rgba(244,114,182,0.2)] bg-admin-surface px-3.5 py-3">
              <Lock size={18} color="var(--text-subtle)" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full border-0 bg-transparent text-[0.9rem] text-white outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 flex items-center justify-center gap-2 rounded-admin bg-admin-primary p-3 text-[0.95rem] font-bold text-[#120E10] shadow-glow disabled:cursor-not-allowed disabled:opacity-70"
          >
            <span>{isLoading ? "Signing in..." : "Sign In to Admin"}</span>
            <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};
