// my-app/components/ui/applicant_table.tsx
"use client";

import { ChevronDown, User, Clock, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

export type Applicant = {
  id: string;
  name: string;
  category?: string;
  desiredCareer?: string;
  yearsExp?: number;
  services?: string[];
  submitted?: string;
  status?: string;
  // new fields for the detail page:
  email?: string;
  phone?: string;
  careerGoal?: string;
  industryInterest?: string;
  education?: string;
  skills?: string[];
};
type ApplicantGroupProps = {
  category: string;
  applicants: Applicant[];
  defaultOpen?: boolean;
};

// "Yusuf Ibrahim" -> "YI"
function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function ApplicantGroup({
  category,
  applicants,
  defaultOpen = true,
}: ApplicantGroupProps) {
  const router = useRouter();
  const awaiting = applicants.filter((a) => a.status === "Awaiting").length;
  const matched = applicants.filter((a) => a.status === "Matched").length;

  return (
    <Card className="overflow-hidden border-zinc-200 py-0 gap-0">
      <CardContent className="p-0">
        <Collapsible defaultOpen={defaultOpen}>
          <CollapsibleTrigger className="flex w-full items-center justify-between px-5 py-4 bg-muted/100 hover:bg-muted">
            <div className="flex items-center gap-2 font-semibold text-zinc-800">
              <ChevronDown className="h-4 w-4 text-zinc-500 transition-transform" />
              {category}
              <span className="text-zinc-400">({applicants.length})</span>
            </div>
            <div className="flex items-center gap-4 text-sm font-medium">
              <span className="text-amber-600">{awaiting} awaiting</span>
              <span className="text-emerald-600">{matched} matched</span>
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="px-3 pb-3">
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-200 hover:bg-transparent">
                    <TableHead>Applicant</TableHead>
                    <TableHead>Desired Career</TableHead>
                    <TableHead>Services</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {applicants.map((a) => (
                    <TableRow
                      key={a.id}
                      onClick={() => router.push(`/applicants/${a.id}`)}
                      className="border-zinc-100 cursor-pointer hover:bg-muted/50"
                    >
                      {/* Applicant: avatar + name + subtitle */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted/100 text-sky-700 text-xs font-semibold">
                            {initials(a.name)}
                          </span>
                          <div className="leading-tight">
                            <div className="font-medium text-zinc-900">
                              {a.name}
                            </div>
                            {a.category && (
                              <div className="text-xs text-zinc-500">
                                {a.category}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Desired Career: title + years exp */}
                      <TableCell>
                        <div className="leading-tight">
                          <div className="text-zinc-900">
                            {a.desiredCareer ?? "—"}
                          </div>
                          {a.yearsExp != null && (
                            <div className="text-xs text-zinc-500">
                              {a.yearsExp} yr exp
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* Services: badges */}
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {(a.services ?? []).length > 0
                            ? a.services!.map((s) => (
                                <span
                                  key={s}
                                  className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700"
                                >
                                  {s}
                                </span>
                              ))
                            : "—"}
                        </div>
                      </TableCell>

                      {/* Submitted */}
                      <TableCell className="text-zinc-600">
                        {a.submitted ?? "—"}
                      </TableCell>

                      {/* Status pill */}
                      <TableCell>
                        <StatusPill status={a.status} />
                      </TableCell>

                      {/* Action icon */}
                      <TableCell>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // TODO: button's own action (doesn't navigate)
                          }}
                          className="text-zinc-400 hover:text-zinc-700"
                        >
                          <User className="h-4 w-4" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}

function StatusPill({ status }: { status?: string }) {
  if (status === "Matched") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Matched
      </span>
    );
  }
  // default: Awaiting
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
      <Clock className="h-3.5 w-3.5" />
      {status ?? "Awaiting"}
    </span>
  );
}