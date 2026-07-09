"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { verifyAccess } from "@/utils/auth/authCheck";

import MainLayout from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Shield, Mail, Calendar, KeyRound, ArrowLeft, Trash2, CheckCircle2, XCircle } from "lucide-react";

export default function UserDetailPage({ params: paramsPromise }) {
  const router = useRouter();
  // Unwrap the dynamic route params Promise natively
  const params = use(paramsPromise);
  const userId = params.id;

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchExpandedUserDetails() {
      // 1. Run the administrative firewall checkpoint
      await verifyAccess(`/admin/users/${userId}`, true, router.replace);

      try {
        const res = await fetch(`/api/users/${userId}`, { cache: "no-store" });
        const result = await res.json();
        
        if (res.ok) {
          setUser(result.data);
        } else {
          setError(result.error || "Failed to load profile record.");
        }
      } catch (err) {
        console.error(err);
        setError("A network exception occurred reading records.");
      } finally {
        setLoading(false);
      }
    }

    fetchExpandedUserDetails();
  }, [userId, router]);

  async function handleRoleToggle(newRole) {
    setUpdating(true);
    setError(null);

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleName: newRole }),
      });

      const result = await res.json();

      if (res.ok) {
        setUser((prev) => ({ ...prev, role: newRole }));
      } else {
        setError(result.error || "Failed to alter role rank assignment.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to execute network update statement.");
    } finally {
      setUpdating(false);
    }
  }

  async function handlePurgeAccount() {
    if (!confirm("Are you absolutely sure you want to permanently delete this user account? This cannot be undone.")) return;
    setUpdating(true);

    try {
      const res = await fetch(`/api/users/${userId}`, { method: "DELETE" });
      const result = await res.json();

      if (res.ok) {
        // Successfully nuked, head back to user index directory layout
        router.push("/admin/users");
      } else {
        setError(result.error || "Server rejected profile deletion constraint.");
        setUpdating(false);
      }
    } catch (err) {
      console.error(err);
      setError("Network fault tripped during deletion routine.");
      setUpdating(false);
    }
  }

  // Quick helper to safely format datetime stamps cleanly matching your style
  function formatDate(isoString) {
    if (!isoString) return "Never logged in";
    return new Date(isoString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="w-full text-center text-muted-foreground text-sm font-medium py-12">
          De-serializing user identities & maps...
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 max-w-xl mx-auto mt-6">
        
        {/* TOP COMPONENT TITLE ROW */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-foreground" style={{ fontSize: "1.375rem", fontWeight: 700 }}>
              Profile Parameters
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Reviewing operational backend parameters for individual operator.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin/users")}
            className="cursor-pointer gap-1.5 rounded-xl text-xs h-9 border border-border"
          >
            <ArrowLeft size={14} />
            Directory
          </Button>
        </div>

        {error && (
          <div className="bg-amber-50 text-amber-800 p-4 border border-amber-200 rounded-xl text-xs font-medium">
            {error}
          </div>
        )}

        {user && (
          <Card className="w-full shadow-sm border-border overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-border/60 px-6 py-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle className="text-zinc-900" style={{ fontSize: "1.125rem", fontWeight: 700 }}>
                    {user.name}
                  </CardTitle>
                  <CardDescription className="text-xs font-mono mt-1 text-slate-500">
                    ID: {user.userId}
                  </CardDescription>
                </div>
                
                <Badge
                  className={
                    user.role === "admin"
                      ? "bg-amber-100 text-amber-800 self-start sm:self-auto font-bold uppercase tracking-wide text-[10px]"
                      : "bg-slate-100 text-slate-800 self-start sm:self-auto font-bold uppercase tracking-wide text-[10px]"
                  }
                >
                  {user.role}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-4">
              
              {/* Profile Details Block Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                
                {/* Email Address */}
                <div className="flex items-center gap-3 p-3 border border-border/50 rounded-xl bg-card">
                  <Mail size={16} className="text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="text-muted-foreground text-[11px] font-medium leading-none">Email Address</p>
                    <p className="text-foreground font-medium text-xs mt-1 truncate">{user.email}</p>
                  </div>
                </div>

                {/* Account Status / Confirmed */}
                <div className="flex items-center gap-3 p-3 border border-border/50 rounded-xl bg-card">
                  {user.confirmed ? (
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle size={16} className="text-amber-500 shrink-0" />
                  )}
                  <div>
                    <p className="text-muted-foreground text-[11px] font-medium leading-none">Registry Status</p>
                    <p className="text-foreground font-medium text-xs mt-1">
                      {user.confirmed ? "Email Verified" : "Verification Pending"}
                    </p>
                  </div>
                </div>

                {/* Date Created */}
                <div className="flex items-center gap-3 p-3 border border-border/50 rounded-xl bg-card">
                  <Calendar size={16} className="text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-muted-foreground text-[11px] font-medium leading-none">Onboarding Date</p>
                    <p className="text-foreground font-medium text-xs mt-1">{formatDate(user.createdAt)}</p>
                  </div>
                </div>

                {/* Last Active Sign In */}
                <div className="flex items-center gap-3 p-3 border border-border/50 rounded-xl bg-card">
                  <KeyRound size={16} className="text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-muted-foreground text-[11px] font-medium leading-none">Last Active Session</p>
                    <p className="text-foreground font-medium text-xs mt-1">{formatDate(user.lastSignIn)}</p>
                  </div>
                </div>

              </div>

              {/* Administrative Access Rank Controls */}
              <div className="pt-2 border-t border-border/60 space-y-2">
                <label className="text-muted-foreground text-xs font-semibold block">
                  Override Platform Rank Assignment
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    disabled={updating}
                    onClick={() => handleRoleToggle("staff")}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all cursor-pointer disabled:opacity-50 ${
                      user.role === "staff"
                        ? "bg-slate-100 text-slate-800 border-slate-300 shadow-sm"
                        : "bg-card text-muted-foreground border-border hover:bg-muted/30"
                    }`}
                  >
                    DEMOTE TO STAFF
                  </button>
                  <button
                    type="button"
                    disabled={updating}
                    onClick={() => handleRoleToggle("admin")}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all cursor-pointer disabled:opacity-50 ${
                      user.role === "admin"
                        ? "bg-amber-50 text-amber-800 border-amber-300 shadow-sm"
                        : "bg-card text-muted-foreground border-border hover:bg-muted/30"
                    }`}
                  >
                    ELEVATE TO ADMIN
                  </button>
                </div>
              </div>

            </CardContent>

            {/* DANGER CONTROL ACTIONS ZONE */}
            <CardFooter className="bg-slate-50/50 border-t border-border/60 px-6 py-4 flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground font-medium">
                Administrative System Control Block
              </span>
              <Button
                type="button"
                variant="ghost"
                disabled={updating}
                onClick={handlePurgeAccount}
                className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50 font-semibold px-3 rounded-xl text-xs gap-1 cursor-pointer disabled:opacity-50"
              >
                <Trash2 size={13} />
                Delete Account
              </Button>
            </CardFooter>
          </Card>
        )}

      </div>
    </MainLayout>
  );
}