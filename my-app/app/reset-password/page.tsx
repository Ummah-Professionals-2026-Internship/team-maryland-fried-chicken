"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import MainLayout from "@/layouts/MainLayout";
import { Lock, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";

export default function ResetPasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(5);

  // Handle the ticking countdown timer upon success
  useEffect(() => {
    if (!success) return;

    if (countdown === 0) {
      window.location.href = "/dashboard"; // Redirect to dashboard after countdown
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [success, countdown]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const resBody = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(resBody.error || "Failed to update password.");
        setLoading(false);
      } else {
        // Clear passwords from client state memory instantly
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        
        // Trigger success UI and the countdown effect
        setSuccess(true);
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <section className="w-full max-w-[600px] mx-auto space-y-6">
        

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h1 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <Lock size={20} className="text-[#007CA6]" /> Reset Account Password
            </h1>
            <p className="text-slate-600 text-xs mt-1">
              Changing your password will sign you out of all sessions.
            </p>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#007CA6] focus:ring-2 focus:ring-[#007CA6]/20"
                required
                disabled={loading || success}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#007CA6] focus:ring-2 focus:ring-[#007CA6]/20"
                required
                disabled={loading || success}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#007CA6] focus:ring-2 focus:ring-[#007CA6]/20"
                required
                disabled={loading || success}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700 font-medium">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-700 font-medium">
                <CheckCircle2 size={16} className="shrink-0" />
                <span>Password changed successfully! Redirecting you to dashboard in {countdown}...</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <Link
                href="/profile"
                className="rounded-full px-5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading || success}
                className="rounded-full bg-[#007CA6] px-6 py-2 text-xs font-medium text-white hover:bg-[#006486] transition-colors disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </MainLayout>
  );
}
