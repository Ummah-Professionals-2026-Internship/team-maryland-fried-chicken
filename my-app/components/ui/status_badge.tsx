import { Clock, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { MatchStatus } from "@/data/mockData";

// Reusable status indicator (extracted from the dashboard table).
export function StatusBadge({ status }: { status: MatchStatus }) {
  const matched = status === "matched";
  return (
    <Badge
      className={
        matched
          ? "bg-emerald-100 text-emerald-800"
          : "bg-amber-100 text-amber-800"
      }
    >
      {matched ? <CheckCircle /> : <Clock />}
      {matched ? "Matched" : "Awaiting"}
    </Badge>
  );
}
