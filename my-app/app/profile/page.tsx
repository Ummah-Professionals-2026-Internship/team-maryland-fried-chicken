"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MainLayout from "@/layouts/MainLayout";
import {
  Mail,
  Pencil,
  Check,
  X,
  KeyRound,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
} from "lucide-react";

type ProfileData = {
  userId: string;
  email: string;
  name: string;
  role: string;
  isVerified?: boolean;
};

function getInitials(name?: string) {
  if (!name || name === "No Name Set") return "U";
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Inline Name Editing State
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  async function fetchProfile() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/users/me");
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? `Server error: ${response.status}`);
      }

      const resBody = await response.json();
      const data = resBody.data;
      setProfile(data);
      setNameInput(data.name !== "No Name Set" ? data.name : "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSaveName = async () => {
    setNameError(null);

    if (!nameInput.trim()) {
      setNameError("Name cannot be left blank.");
      return;
    }

    setSavingName(true);

    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nameInput }),
      });

      if (res.ok) {
        setProfile((prev) => (prev ? { ...prev, name: nameInput } : null));
        setIsEditingName(false);
      } else {
        const errData = await res.json().catch(() => ({}));
        setNameError(errData.error || "Failed to update name.");
      }
    } catch {
      setNameError("Something went wrong. Please try again.");
    } finally {
      setSavingName(false);
    }
  };

  return (
    <MainLayout>
      <section className="w-full max-w-[1100px] mx-auto space-y-4">
        {/* Header Title Section */}
        <div>
          <h1
            className="text-zinc-900"
            style={{ fontSize: "1.375rem", fontWeight: 700 }}
          >
            Profile Settings
          </h1>
          <p className="text-slate-600 text-sm mt-0.5">
            Manage your personal details and account credentials
          </p>
        </div>

        {/* Global Page Loading State */}
        {loading && (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            Loading profile details...
          </div>
        )}

        {/* Global Page Error State */}
        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
            <p className="text-sm text-red-700 font-medium">{error}</p>
            <button
              onClick={fetchProfile}
              className="mt-4 rounded-full border border-red-300 bg-white px-5 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Profile Content */}
        {!loading && !error && (
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              {/* Profile Overview Header Card */}
              <div className="bg-slate-50 border-b border-slate-200 px-6 py-5 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                  {/* Circle Avatar */}
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-[#007CA6] text-sm font-semibold shrink-0">
                    {getInitials(profile?.name)}
                  </div>

                  <div>
                    {/* Inline Name Editing */}
                    {isEditingName ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={nameInput}
                          onChange={(e) => {
                            setNameInput(e.target.value);
                            if (nameError) setNameError(null);
                          }}
                          className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-sm font-medium text-slate-900 outline-none transition focus:border-[#007CA6] focus:ring-2 focus:ring-[#007CA6]/20"
                          autoFocus
                        />
                        <button
                          onClick={handleSaveName}
                          disabled={savingName}
                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <Check size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setIsEditingName(false);
                            setNameInput(profile?.name || "");
                            setNameError(null);
                          }}
                          className="p-1 text-slate-400 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <h2 className="text-zinc-900 text-base font-semibold">
                          {profile?.name}
                        </h2>
                        <button
                          onClick={() => {
                            setIsEditingName(true);
                            setNameError(null);
                          }}
                          className="p-1 text-slate-400 hover:text-[#007CA6] hover:bg-slate-200/50 rounded-lg transition-colors cursor-pointer"
                          title="Edit name"
                        >
                          <Pencil size={15} />
                        </button>
                      </div>
                    )}

                    {/* Role & Status Badges */}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-slate-100 text-[#007CA6] px-2 py-0.5 rounded font-medium uppercase tracking-wide">
                        {profile?.role}
                      </span>

                      {profile?.isVerified ? (
                        <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                          <CheckCircle2 size={12} /> Verified
                        </span>
                      ) : (
                        <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                          <Clock size={12} /> Pending
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* In-line Red Error Box for Name Editing */}
              {nameError && (
                <div className="px-6 py-3 bg-red-50 border-b border-red-200 flex items-center gap-2 text-xs text-red-700 font-medium">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{nameError}</span>
                </div>
              )}

              {/* Profile Details Rows */}
              <div className="divide-y divide-slate-200">
                {/* Email Row */}
                <div className="px-6 py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Mail className="text-slate-400 shrink-0" size={18} />
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                        Email Address
                      </p>
                      <p className="text-sm font-medium text-zinc-900 mt-0.5">
                        {profile?.email}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-600 italic">Read-only</span>
                </div>

                {/* Password Row - Direct Link to Reset Password Page */}
                <div className="px-6 py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <KeyRound className="text-slate-400 shrink-0" size={18} />
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                        Password
                      </p>
                      <p className="text-sm font-medium text-zinc-900 mt-0.5">
                        ••••••••••••
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/reset-password"
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-4 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 hover:text-zinc-900 cursor-pointer"
                  >
                    Change Password
                    <ChevronRight size={14} className="text-slate-400" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </MainLayout>
  );
}