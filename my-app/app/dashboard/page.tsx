"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/layouts/MainLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Users, Clock, CheckCircle, BookOpen, ArrowRight } from "lucide-react";

// Matches DB shape from Supabase
interface Applicant {
  id: string;
  name: string;
  occupation_field: string;
  status: string;
  created_at: string;
}

// Matches response structure from /api/dashboard/route.ts
interface DashboardMetrics {
  totalCount: number;
  matchedCount: number;
  awaitingCount: number;
  availableAdvisors: number;
  recentUnmatchedApplicants: Applicant[];
}

export default function Dashboard() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>("User"); // Fallback default name
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalCount: 0,
    matchedCount: 0,
    awaitingCount: 0,
    availableAdvisors: 0,
    recentUnmatchedApplicants: [],
  });

  useEffect(() => {
    async function loadDashboardData() {
      try {
        // Fetch user data and metrics concurrently
        const [userRes, dashboardRes] = await Promise.all([
          fetch("/api/users/me"),
          fetch("/api/dashboard"),
        ]);

        // Process User Info
        if (userRes.ok) {
          const userData = await userRes.json();
          // Extract first_name, name, or full name depending on API return shape
          const name = userData.first_name || userData.name || userData.user?.first_name || userData.user?.name;
          if (name) {
            setUserName(name);
          }
        }

        // Process Dashboard Metrics
        if (!dashboardRes.ok) throw new Error("Failed to load dashboard data");
        const dashboardData = await dashboardRes.json();
        setMetrics(dashboardData);
      } catch (error) {
        console.error("Dashboard Loading Error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const { totalCount, matchedCount, awaitingCount, availableAdvisors, recentUnmatchedApplicants } = metrics;

  // Filter table dynamically using input search query
  const filtered = recentUnmatchedApplicants.filter((a) =>
    a.name.toLowerCase().includes(query.toLowerCase())
  );

  // Match rate calculation safely handling divide-by-zero
  const matchRate = totalCount > 0 ? Math.round((matchedCount / totalCount) * 100) : 0;

  const stats = [
    { label: "Total Applicants", value: totalCount, icon: Users, iconBg: "bg-blue-100", iconColor: "text-blue-600" },
    { label: "Awaiting Match", value: awaitingCount, icon: Clock, iconBg: "bg-amber-100", iconColor: "text-amber-600" },
    { label: "Matched", value: matchedCount, icon: CheckCircle, iconBg: "bg-emerald-100", iconColor: "text-emerald-600" },
    { label: "Active Advisors", value: availableAdvisors, icon: BookOpen, iconBg: "bg-purple-100", iconColor: "text-purple-600" },
  ];

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[300px] text-muted-foreground text-sm">
          Loading metrics...
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-foreground" style={{ fontSize: "1.375rem", fontWeight: 700 }}>
            Welcome back, {userName}
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Here is an overview of the matching program.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <CardContent>
                  <div className={`w-8 h-8 md:w-9 md:h-9 rounded-lg ${stat.iconBg} flex items-center justify-center mb-3`}>
                    <Icon size={17} className={stat.iconColor} />
                  </div>
                  <p className="text-muted-foreground text-xs">{stat.label}</p>
                  <p className="text-foreground mt-0.5" style={{ fontSize: "1.625rem", fontWeight: 700, lineHeight: 1 }}>
                    {stat.value}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions + Recent Submissions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          {/* Quick links & Match Rate */}
          <div className="md:col-span-1 space-y-4">
            <h2 className="text-foreground text-sm" style={{ fontWeight: 600 }}>Quick Navigation</h2>

            <button
              onClick={() => router.push("/applicants")}
              className="w-full bg-card border border-border rounded-xl p-4 text-left hover:border-primary/30 hover:shadow-sm transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                    <Users size={17} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-foreground text-sm" style={{ fontWeight: 500 }}>Applicant Submissions</p>
                    <p className="text-muted-foreground text-xs">{awaitingCount} awaiting match</p>
                  </div>
                </div>
                <ArrowRight size={15} className="text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </div>
            </button>

            <button
              onClick={() => router.push("/advisors")}
              className="w-full bg-card border border-border rounded-xl p-4 text-left hover:border-primary/30 hover:shadow-sm transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                    <BookOpen size={17} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-foreground text-sm" style={{ fontWeight: 500 }}>Advisor Directory</p>
                    <p className="text-muted-foreground text-xs">{availableAdvisors} advisors available</p>
                  </div>
                </div>
                <ArrowRight size={15} className="text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </div>
            </button>

            {/* Match Rate Card */}
            <Card>
              <CardContent>
                <p className="text-muted-foreground text-xs mb-2">Match Rate</p>
                <p className="text-foreground text-2xl" style={{ fontWeight: 700 }}>
                  {matchRate}%
                </p>
                <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${matchRate}%` }} />
                </div>
                <p className="text-muted-foreground text-xs mt-1.5">{matchedCount} of {totalCount} applicants matched</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Submissions Table */}
          <Card className="md:col-span-2">
            <CardHeader>
              <h2>Recent Submissions</h2>
              <CardAction>
                <button
                  onClick={() => router.push("/applicants")}
                  className="text-xs hover:text-primary transition-colors cursor-pointer"
                  style={{ color: "#007CA6" }}
                >
                  View all →
                </button>
              </CardAction>
            </CardHeader>

            <div className="px-6">
              <Input
                placeholder="Search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full mt-2 mb-2"
              />
            </div>

            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                        No submissions found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((a) => (
                      <TableRow
                        key={a.id}
                        onClick={() => router.push(`/applicants/${a.id}`)}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                      >
                        <TableCell className="font-medium">{a.name}</TableCell>
                        <TableCell>{a.occupation_field}</TableCell>
                        <TableCell>
                          <Badge className={a.status?.toLowerCase() === "matched" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}>
                            {a.status?.toLowerCase() === "matched" ? "Matched" : "Awaiting"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {a.created_at ? new Date(a.created_at).toLocaleDateString() : "N/A"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}