"use client";
//my file
import MainLayout from "@/layouts/MainLayout";
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
} from "@/components/ui/card"

import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useState } from "react";

import { Users, Clock, CheckCircle, BookOpen, ArrowRight } from "lucide-react";
import { applicants, advisors } from "../../data/mockData";
import { useRouter } from "next/navigation";


// export default function DashboardPage() {
//   return (
//     <MainLayout>
//       <div className="space-y-4">
//         <h1 className="text-3xl font-bold text-zinc-900">Dashboard</h1>
//       <p className="mt-2 text-zinc-600">Placeholder dashboard page.</p>
//       <Card size="sm" className="mx-auto w-full max-w-sm">
//       <CardHeader>
//         <CardTitle>Example Card component with Button component </CardTitle>
//         <CardDescription>
//           This card uses the small size variant.
//         </CardDescription>
//       </CardHeader>
//       <CardContent>
//         <p>
//           The card component supports a size prop that can be set to
//           &quot;sm&quot; for a more compact appearance.
//         </p>
//       </CardContent>
//       <CardFooter>
//         <Button variant="outline" size="sm" className="w-full">
//           Button
//         </Button>
//       </CardFooter>
//     </Card>

//     <Card size="sm" className="mx-auto w-full max-w-sm">
//       <CardHeader>
//         <CardTitle>Example Card component with Button component </CardTitle>
//         <CardDescription>
//           This card uses the small size variant.
//         </CardDescription>
//       </CardHeader>
//       <CardContent>
//         <p>
//           The card component supports a size prop that can be set to
//           &quot;sm&quot; for a more compact appearance.
//         </p>
//       </CardContent>
//     </Card>
//       </div>
//     </MainLayout>
//   );
// }

export default function Dashboard() {
  const router = useRouter();
  const total = applicants.length;
  const awaiting = applicants.filter(a => a.status === "awaiting").length;
  const matched = applicants.filter(a => a.status === "matched").length;
  const [query, setQuery] = useState("")
  const filtered = applicants.filter((a) => 
    a.name.toLowerCase().includes(query.toLowerCase())
  )

  const stats = [
    { label: "Total Applicants", value: total, icon: Users, iconBg: "bg-blue-100", iconColor: "text-blue-600" },
    { label: "Awaiting Match", value: awaiting, icon: Clock, iconBg: "bg-amber-100", iconColor: "text-amber-600" },
    { label: "Matched", value: matched, icon: CheckCircle, iconBg: "bg-emerald-100", iconColor: "text-emerald-600" },
    { label: "Active Advisors", value: advisors.length, icon: BookOpen, iconBg: "bg-purple-100", iconColor: "text-purple-600" },
  ];
return (
    <MainLayout>
      <div className="space-y-6">
            <div>
              <h1 className="text-foreground" style={{ fontSize: "1.375rem", fontWeight: 700 }}>
                Welcome back, Sarah
              </h1>
              <p className="text-muted-foreground text-sm mt-0.5">
                Here is an overview of the matching program.
              </p> 
            </div>

            {/* Stats â€” 2 cols on mobile, 4 on desktop */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {stats.map(stat => {
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

            {/* Quick Actions + Recent â€” stacked on mobile, side-by-side on desktop */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              {/* Quick links */}
              <div className="md:col-span-1 space-y-7.5">
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
                        <p className="text-muted-foreground text-xs">{awaiting} awaiting match</p>
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
                        <p className="text-muted-foreground text-xs">{advisors.length} advisors available</p>
                      </div>
                    </div>
                    <ArrowRight size={15} className="text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  </div>
                </button>

                {/* Match rate */}
                <Card>
                  <CardContent>
                      <p className="text-muted-foreground text-xs mb-2">Match Rate</p>
                      <p className="text-foreground text-2xl" style={{ fontWeight: 700 }}>
                        {Math.round((matched / total) * 100)}%
                      </p>
                      <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(matched / total) * 100}%` }} />
                      </div>
                      <p className="text-muted-foreground text-xs mt-1.5">{matched} of {total} applicants matched</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent submissions */}
              <Card className="md:col-span-2">
                  <CardHeader><h2>Recent Submissions</h2>
                  
                  <CardAction>
                    <button onClick={() => router.push("/applicants")} className="text-xs hover:text-primary transition-colors cursor-pointer" style={{ color: "#007CA6" }}>
                      View all â†’
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
                        <TableHead>Field</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submitted</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((a) => (
                        <TableRow key={a.applicantId}>
                          <TableCell>{a.name}</TableCell>
                          <TableCell>{a.occupationField}</TableCell>
                          <TableCell>
                            <Badge className={a.status === "matched" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}>
                              {a.status === "matched" ? "Matched" : "Awaiting"}
                            </Badge>
                          </TableCell>
                          <TableCell>{a.submittedAt}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
    </MainLayout>
  );
}
