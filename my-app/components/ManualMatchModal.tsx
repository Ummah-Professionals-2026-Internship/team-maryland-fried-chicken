"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type AdvisorSummary = {
  advisorId: string;
  advisorName: string;
  jobTitle: string;
  company: string;
  industry: string;
  experienceLevel: string;
  gender: string;
  availabilityStatus: string;
  reliabilityLevel: string;
  currentMonthlyAssignments: number;
  maxMonthlyAssignments: number;
  remainingCapacity: number;
};

type ManualMatchResult = {
  advisorId: string;
  advisorName: string;
  jobTitle: string;
  company: string;
  currentAssignments: number;
};

const INDUSTRY_OPTIONS = [
  "Business",
  "Education",
  "Engineering",
  "Finance",
  "Healthcare",
  "Information Technology",
  "Law",
  "Social Services",
  "Other",
];

const AVAILABILITY_OPTIONS = ["Available", "Unavailable"];
const RELIABILITY_OPTIONS = ["High", "Medium", "Low"];

function getReliabilityStyles(level: string) {
  if (level === "High") return "bg-emerald-50 text-emerald-700";
  if (level === "Medium") return "bg-amber-50 text-amber-700";
  return "bg-red-50 text-red-700";
}

function buildSearchUrl(params: Record<string, string>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) query.set(key, value);
  }
  const qs = query.toString();
  return `/api/advisors/search${qs ? `?${qs}` : ""}`;
}

export default function ManualMatchModal({
  applicantId,
  applicantName,
  open,
  onOpenChange,
  onMatched,
}: {
  applicantId: string;
  applicantName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMatched: (result: ManualMatchResult) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("");
  const [reliabilityFilter, setReliabilityFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [genderOptions, setGenderOptions] = useState<string[]>([]);

  const [advisors, setAdvisors] = useState<AdvisorSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedAdvisor, setSelectedAdvisor] = useState<AdvisorSummary | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  // Reset everything when the modal closes, so reopening starts fresh.
  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setSearchQuery("");
      setIndustryFilter("");
      setAvailabilityFilter("");
      setReliabilityFilter("");
      setGenderFilter("");
      setAdvisors([]);
      setError(null);
      setSelectedAdvisor(null);
      setConfirmError(null);
    }
    onOpenChange(nextOpen);
  }

  // Seed the gender filter's options once per open, from the unfiltered eligible list.
  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function loadGenderOptions() {
      try {
        const response = await fetch(buildSearchUrl({}));
        if (!response.ok || cancelled) return;
        const data: AdvisorSummary[] = await response.json();
        const unique = Array.from(
          new Set(data.map((a) => a.gender).filter(Boolean)),
        ).sort();
        if (!cancelled) setGenderOptions(unique);
      } catch {
        // Non-critical — filter just won't have options if this fails.
      }
    }

    loadGenderOptions();

    return () => {
      cancelled = true;
    };
  }, [open]);

  // Fetch the filtered advisor list. Search text is debounced; filters apply immediately.
  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    const timeout = setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          buildSearchUrl({
            q: searchQuery.trim(),
            industry: industryFilter,
            availability: availabilityFilter,
            reliability: reliabilityFilter,
            gender: genderFilter,
          }),
        );

        const body = await response.json().catch(() => ([]));

        if (cancelled) return;

        if (!response.ok) {
          throw new Error(
            (body as { error?: string }).error ?? `Server error: ${response.status}`,
          );
        }

        setAdvisors(body as AdvisorSummary[]);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Something went wrong.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [open, searchQuery, industryFilter, availabilityFilter, reliabilityFilter, genderFilter]);

  async function handleConfirm() {
    if (!selectedAdvisor) return;

    setConfirming(true);
    setConfirmError(null);

    try {
      const response = await fetch(`/api/applicants/${applicantId}/manual-match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ advisorId: selectedAdvisor.advisorId }),
      });

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(body.error ?? `Server error: ${response.status}`);
      }

      onMatched({
        advisorId: selectedAdvisor.advisorId,
        advisorName: selectedAdvisor.advisorName,
        jobTitle: selectedAdvisor.jobTitle,
        company: selectedAdvisor.company,
        currentAssignments: Number(
          body.currentAssignments ?? selectedAdvisor.currentMonthlyAssignments + 1,
        ),
      });
      onOpenChange(false);
    } catch (err) {
      setConfirmError(err instanceof Error ? err.message : "Failed to create match.");
    } finally {
      setConfirming(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        {selectedAdvisor ? (
          <>
            <DialogHeader>
              <DialogTitle>Confirm Match</DialogTitle>
              <DialogDescription>
                Review the details below before creating this match.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 rounded-lg border border-zinc-200 p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-500">Applicant</span>
                <span className="font-medium text-zinc-900">{applicantName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Advisor</span>
                <span className="font-medium text-zinc-900">
                  {selectedAdvisor.advisorName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Job Title</span>
                <span className="text-zinc-900">
                  {selectedAdvisor.jobTitle} · {selectedAdvisor.company}
                </span>
              </div>
            </div>

            {confirmError && (
              <p className="text-sm font-medium text-red-600">{confirmError}</p>
            )}

            <DialogFooter>
              <button
                onClick={() => {
                  setSelectedAdvisor(null);
                  setConfirmError(null);
                }}
                disabled={confirming}
                className="inline-flex items-center justify-center rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={confirming}
                className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {confirming ? "Matching..." : "Confirm Match"}
              </button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Manual Match</DialogTitle>
              <DialogDescription>
                Search and filter eligible advisors, then select one to match with{" "}
                {applicantName}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, job title, or company"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#007CA6] focus:ring-2 focus:ring-[#007CA6]/20"
              />

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <select
                  value={industryFilter}
                  onChange={(e) => setIndustryFilter(e.target.value)}
                  className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs text-zinc-900"
                >
                  <option value="">All Industries</option>
                  {INDUSTRY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>

                <select
                  value={availabilityFilter}
                  onChange={(e) => setAvailabilityFilter(e.target.value)}
                  className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs text-zinc-900"
                >
                  <option value="">All Availability</option>
                  {AVAILABILITY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>

                <select
                  value={reliabilityFilter}
                  onChange={(e) => setReliabilityFilter(e.target.value)}
                  className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs text-zinc-900"
                >
                  <option value="">All Reliability</option>
                  {RELIABILITY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>

                <select
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value)}
                  className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs text-zinc-900"
                >
                  <option value="">All Genders</option>
                  {genderOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="max-h-[45vh] space-y-2 overflow-y-auto">
              {loading && (
                <p className="py-8 text-center text-sm text-zinc-500">
                  Loading advisors...
                </p>
              )}

              {!loading && error && (
                <p className="py-8 text-center text-sm text-red-600">{error}</p>
              )}

              {!loading && !error && advisors.length === 0 && (
                <p className="py-8 text-center text-sm text-zinc-500">
                  No eligible advisors match your search.
                </p>
              )}

              {!loading &&
                !error &&
                advisors.map((advisor) => (
                  <div
                    key={advisor.advisorId}
                    className="rounded-lg border border-zinc-200 p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-zinc-900">
                          {advisor.advisorName}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {advisor.jobTitle} · {advisor.company}
                        </p>
                      </div>
                      <span
                        className={`inline-flex shrink-0 items-center rounded px-2 py-0.5 text-xs font-medium ${getReliabilityStyles(
                          advisor.reliabilityLevel,
                        )}`}
                      >
                        {advisor.reliabilityLevel}
                      </span>
                    </div>

                    <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-zinc-500 sm:grid-cols-3">
                      <span>Industry: {advisor.industry || "—"}</span>
                      <span>Experience: {advisor.experienceLevel || "—"}</span>
                      <span>Gender: {advisor.gender || "—"}</span>
                      <span>Availability: {advisor.availabilityStatus || "—"}</span>
                      <span>
                        Assignments: {advisor.currentMonthlyAssignments} /{" "}
                        {advisor.maxMonthlyAssignments}
                      </span>
                    </div>

                    <div className="mt-3 flex gap-2">
                      <a
                        href={`/advisors/${advisor.advisorId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                      >
                        View Profile
                      </a>
                      <button
                        onClick={() => setSelectedAdvisor(advisor)}
                        className="inline-flex items-center justify-center rounded-lg bg-[#2F7FA8] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#286E92]"
                      >
                        Select Advisor
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
