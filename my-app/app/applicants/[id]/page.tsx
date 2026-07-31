"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import { CheckCircle2, ClipboardList, FileText, Clock, RotateCcw, Sparkles, Trash2, Users } from "lucide-react";
import MainLayout from "@/layouts/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { type Applicant } from "@/components/ui/applicant_table";
import ManualMatchModal from "@/components/ManualMatchModal";
import {
  ApplicantCaseManagement,
  MeetingActivity,
} from "@/components/applicants/ApplicantCaseManagement";

type ManualMatchInfo = {
  advisorId: string;
  advisorName: string;
  jobTitle: string;
  company: string;
  industry: string;
  experienceLevel: string;
  reliabilityLevel: string;
  currentMonthlyAssignments: number;
  maxMonthlyAssignments: number;
};

// Shape returned by GET /api/applicants/:id/recommendations
type Recommendation = {
  recommendationId: string;
  advisorId: string;
  advisorName: string;
  jobTitle: string;
  company: string;
  industry: string;
  experienceLevel: string;
  reliabilityLevel: string;
  matchScore: number;
  totalScore: number;
  careerScore: number;
  industryScore: number;
  experienceScore: number;
  genderBonus: number;
  capacityAdjustment: number;
  careerSimilarity: string;
  currentMonthlyAssignments: number;
  maxMonthlyAssignments: number;
  explanation: string[];
  recommendationStatus: "Pending" | "Accepted" | "Rejected";
};

function getReliabilityStyles(level: string) {
  if (level === "High") return "bg-emerald-50 text-emerald-700";
  if (level === "Medium") return "bg-amber-50 text-amber-700";
  return "bg-red-50 text-red-700";
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function getApplicantServices(
  raw: Record<string, unknown>,
): string[] | undefined {
  const junctionRows = raw.applicant_services as
    | Array<{ service_types?: { name?: string } | null }>
    | null
    | undefined;

  const services = (junctionRows ?? [])
    .map((row) => row.service_types?.name)
    .filter((name): name is string => Boolean(name));

  if (services.length > 0) {
    return services;
  }

  const legacyService = (
    raw.service_types as { name?: string } | null
  )?.name;

  return legacyService ? [legacyService] : undefined;
}
// Maps a raw Supabase applicant row to the Applicant UI type
function mapApplicant(raw: Record<string, unknown>): Applicant {
  const county = String(raw.location_county ?? raw.county ?? "");
  const state = String(raw.location_state ?? raw.state ?? "");
  const location = [county, state].filter(Boolean).join(", ") || undefined;

  return {
    id: String(raw.id ?? ""),
    name: [raw.first_name, raw.last_name].filter(Boolean).join(" ") || String(raw.name ?? ""),
    category: String(raw.industry ?? raw.category ?? ""),
    desiredCareer: String(raw.desired_future_career ?? raw.desiredCareer ?? ""),
    yearsExp: typeof raw.yearsExp === "number" ? raw.yearsExp : undefined,
    services: getApplicantServices(raw),
    submitted: raw.submission_date
      ? String(raw.submission_date).split("T")[0]
      : String(raw.submitted ?? ""),
    status: String(raw.status ?? ""),
    email: String(raw.email ?? ""),
    phone: String(raw.phone_number ?? raw.phone ?? ""),
    careerGoal: String(raw.desired_future_career ?? raw.careerGoal ?? ""),
    industryInterest: String(raw.industry ?? raw.industryInterest ?? ""),
    education: String(raw.academic_standing ?? raw.education ?? ""),
    referralSource: raw.source ? String(raw.source) : undefined,
    resumeUrl: raw.resume_url ? String(raw.resume_url) : undefined,
    skills: Array.isArray(raw.skills) ? raw.skills : [],
    gender: raw.gender ? String(raw.gender) : undefined,
    university: raw.university ? String(raw.university) : undefined,
    major: raw.major ? String(raw.major) : undefined,
    location,
    additionalNotes: raw.additional_notes ? String(raw.additional_notes) : undefined,
  };
}

// Matches the industry CHECK constraint on the applicants table (migrations/init.sql)
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
] as const;

export default function ApplicantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [recLoading, setRecLoading] = useState(false);
  const [recError, setRecError] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);
  // Only one advisor can be accepted per applicant at a time.
  const [acceptedAdvisorId, setAcceptedAdvisorId] = useState<string | null>(null);
  const [acceptingAdvisorId, setAcceptingAdvisorId] = useState<string | null>(null);
  const [acceptError, setAcceptError] = useState<string | null>(null);
  const [isUndoing, setIsUndoing] = useState(false);
  const [deletingRecommendationId, setDeletingRecommendationId] =
    useState<string | null>(null);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [manualMatchOpen, setManualMatchOpen] = useState(false);
  const [manualMatch, setManualMatch] = useState<ManualMatchInfo | null>(null);
  const [caseManagementOpen, setCaseManagementOpen] = useState(false);
  const [additionalSessionRequested, setAdditionalSessionRequested] =
    useState(false);

  function handleManualMatched(result: {
    advisorId: string;
    advisorName: string;
    jobTitle: string;
    company: string;
    industry: string;
    experienceLevel: string;
    reliabilityLevel: string;
    currentAssignments: number;
    maxMonthlyAssignments: number;
  }) {
    setManualMatch({
      advisorId: result.advisorId,
      advisorName: result.advisorName,
      jobTitle: result.jobTitle,
      company: result.company,
      industry: result.industry,
      experienceLevel: result.experienceLevel,
      reliabilityLevel: result.reliabilityLevel,
      currentMonthlyAssignments: result.currentAssignments,
      maxMonthlyAssignments: result.maxMonthlyAssignments,
    });
    setAcceptedAdvisorId(result.advisorId);
    setRecommendations((current) =>
      current.map((item) =>
        item.recommendationStatus === "Accepted"
          ? {
              ...item,
              recommendationStatus: "Rejected",
            }
          : item,
      ),
    );
    setApplicant((current) =>
      current ? { ...current, status: "Matched" } : current,
    );
    setAdditionalSessionRequested(false);
    setAcceptError(null);
  }

  // Industry is editable — advisors report it is frequently mis-filed and use
  // it mainly as a grouping tool.
  const [editingIndustry, setEditingIndustry] = useState(false);
  const [draftIndustry, setDraftIndustry] = useState("");
  const [savingIndustry, setSavingIndustry] = useState(false);
  const [industryError, setIndustryError] = useState<string | null>(null);

  async function handleSaveIndustry() {
    setSavingIndustry(true);
    setIndustryError(null);

    try {
      const response = await fetch(`/api/applicants/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ industry: draftIndustry }),
      });

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(body.error ?? `Server error: ${response.status}`);
      }

      setApplicant((current) =>
        current
          ? {
              ...current,
              industryInterest: body.industry ?? draftIndustry,
              category: body.industry ?? draftIndustry,
            }
          : current,
      );
      setEditingIndustry(false);
    } catch (err) {
      setIndustryError(
        err instanceof Error ? err.message : "Failed to update industry.",
      );
    } finally {
      setSavingIndustry(false);
    }
  }

  async function handleAccept(rec: Recommendation, rankPosition: number) {
    setAcceptingAdvisorId(rec.advisorId);
    setAcceptError(null);

    try {
      const response = await fetch(
        `/api/applicants/${id}/recommendations/accept`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            advisorId: rec.advisorId,
            matchScore: rec.matchScore,
            rankPosition,
            explanation: rec.explanation,
          }),
        },
      );

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(body.error ?? `Server error: ${response.status}`);
      }

      setAcceptedAdvisorId(rec.advisorId);
      setManualMatch(null);
      setRecommendations((current) =>
        current.map((item) => {
          if (item.advisorId === rec.advisorId) {
            return {
              ...item,
              recommendationStatus: "Accepted",
              currentMonthlyAssignments: Number(
                body.currentAssignments ??
                  item.currentMonthlyAssignments + 1,
              ),
            };
          }

          if (item.recommendationStatus === "Accepted") {
            return {
              ...item,
              recommendationStatus: "Rejected",
            };
          }

          return item;
        }),
      );
      setApplicant((current) =>
        current ? { ...current, status: "Matched" } : current,
      );
      setAdditionalSessionRequested(false);
    } catch (err) {
      setAcceptError(
        err instanceof Error
          ? err.message
          : "Failed to accept recommendation.",
      );
    } finally {
      setAcceptingAdvisorId(null);
    }
  }

  async function handleUndo() {
    setIsUndoing(true);
    setAcceptError(null);

    try {
      const response = await fetch(
        `/api/applicants/${id}/recommendations/undo`,
        {
          method: "POST",
        },
      );

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(body.error ?? `Server error: ${response.status}`);
      }

      setAcceptedAdvisorId(null);
      setManualMatch(null);
      setApplicant((current) =>
        current
          ? {
              ...current,
              status: "Recommendations Generated",
            }
          : current,
      );
      setRecommendations((current) =>
        current.map((item) =>
          item.advisorId === body.advisorId
            ? {
                ...item,
                recommendationStatus: "Pending",
                currentMonthlyAssignments: Number(
                  body.currentAssignments ??
                    Math.max(0, item.currentMonthlyAssignments - 1),
                ),
              }
            : item,
        ),
      );
      setHasGenerated(true);
      setRecError(null);
    } catch (err) {
      setAcceptError(
        err instanceof Error
          ? err.message
          : "Failed to undo accepted recommendation.",
      );
    } finally {
      setIsUndoing(false);
    }
  }

  async function handleDeleteRecommendation(rec: Recommendation) {
    if (
      !window.confirm(
        `Remove ${rec.advisorName} from this applicant's recommendations?`,
      )
    ) {
      return;
    }

    setDeletingRecommendationId(rec.recommendationId);
    setDeleteError(null);

    try {
      const response = await fetch(
        `/api/applicants/${id}/recommendations?recommendationId=${rec.recommendationId}`,
        { method: "DELETE" },
      );

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(body.error ?? `Server error: ${response.status}`);
      }

      setRecommendations((current) =>
        current.filter(
          (item) => item.recommendationId !== rec.recommendationId,
        ),
      );
    } catch (err) {
      setDeleteError(
        err instanceof Error
          ? err.message
          : "Failed to delete recommendation.",
      );
    } finally {
      setDeletingRecommendationId(null);
    }
  }

  async function handleDeleteAllRecommendations() {
    if (
      !window.confirm(
        "Delete all recommendations for this applicant? This cannot be undone.",
      )
    ) {
      return;
    }

    setIsDeletingAll(true);
    setDeleteError(null);

    try {
      const response = await fetch(
        `/api/applicants/${id}/recommendations`,
        { method: "DELETE" },
      );

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(body.error ?? `Server error: ${response.status}`);
      }

      const deletedIds: string[] = body.deletedIds ?? [];

      setRecommendations((current) =>
        current.filter(
          (item) => !deletedIds.includes(item.recommendationId),
        ),
      );
    } catch (err) {
      setDeleteError(
        err instanceof Error
          ? err.message
          : "Failed to delete recommendations.",
      );
    } finally {
      setIsDeletingAll(false);
    }
  }

  useEffect(() => {
    async function fetchApplicant() {
      setLoading(true);
      setError(null);
      setNotFound(false);

      try {
        const response = await fetch(`/api/applicants/${id}`);

        if (response.status === 404) {
          setNotFound(true);
          return;
        }

        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body.error ?? `Server error: ${response.status}`);
        }

        const data = await response.json();
        setApplicant(mapApplicant(data));
        setAdditionalSessionRequested(
          data.follow_up_outcome === "Additional Session Requested",
        );

        const recommendationsResponse = await fetch(
          `/api/applicants/${id}/recommendations?persistedOnly=true`,
        );

        if (recommendationsResponse.ok) {
          const savedRecommendations: Recommendation[] =
            await recommendationsResponse.json();

          setRecommendations(savedRecommendations);
          setHasGenerated(savedRecommendations.length > 0);

          const acceptedRecommendation = savedRecommendations.find(
            (recommendation) =>
              recommendation.recommendationStatus === "Accepted",
          );

          setAcceptedAdvisorId(
            acceptedRecommendation?.advisorId ?? null,
          );

          // A "Matched" applicant with no accepted recommendation was
          // matched manually — fetch that match's advisor for display.
          if (!acceptedRecommendation && data.status === "Matched") {
            const manualMatchResponse = await fetch(
              `/api/applicants/${id}/manual-match`,
            );

            if (manualMatchResponse.ok) {
              const manualMatchData = await manualMatchResponse.json();

              if (manualMatchData) {
                setManualMatch(manualMatchData);
                setAcceptedAdvisorId(manualMatchData.advisorId);
              }
            }
          }
        } else {
          const recommendationsBody = await recommendationsResponse
            .json()
            .catch(() => ({}));

          setRecError(
            recommendationsBody.error ??
              `Server error: ${recommendationsResponse.status}`,
          );
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }

    fetchApplicant();
  }, [id]);

  async function handleGenerateRecommendations() {
    setRecLoading(true);
    setRecError(null);
    setAcceptError(null);

    try {
      const response = await fetch(
        `/api/applicants/${id}/recommendations?regenerate=true`,
      );

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? `Server error: ${response.status}`);
      }

      const data = await response.json();
      setRecommendations(data);
    } catch (err) {
      setRecError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setRecLoading(false);
      setHasGenerated(true);
    }
  }

  const matchActionsDisabled =
    applicant?.status === "Matched" &&
    !additionalSessionRequested;

  const deletableRecommendationCount = recommendations.filter(
    (rec) => rec.recommendationStatus !== "Accepted",
  ).length;

  return (
    <MainLayout>
      <Link
        href="/applicants"
        className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-50"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="relative -top-px shrink-0"
          aria-hidden="true"
        >
          <path d="M19 12H5" />
          <path d="m12 19-7-7 7-7" />
        </svg>
        Back to Submissions
      </Link>

      {/* Loading state */}
      {loading && (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500">
          Loading applicant...
        </div>
      )}

      {/* 404 state */}
      {!loading && notFound && (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
          <p className="text-zinc-900 font-semibold text-lg">Applicant not found</p>
          <p className="text-slate-500 text-sm mt-1">
            No applicant exists with this ID.
          </p>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-12 text-center">
          <p className="text-red-700 font-medium text-sm">{error}</p>
        </div>
      )}

      {/* Applicant profile */}
      {!loading && !notFound && !error && applicant && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* LEFT COLUMN */}
          <div className="space-y-6 lg:col-span-1">
            {/* Profile card */}
            <Card className="border-zinc-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-sky-100 text-sky-700 text-lg font-semibold">
                    {initials(applicant.name)}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                      applicant.status === "Matched"
                        ? "bg-emerald-50 text-emerald-700"
                        : applicant.status === "Closed"
                          ? "bg-zinc-100 text-zinc-700"
                          : applicant.status === "Recommendations Generated"
                            ? "bg-sky-50 text-sky-700"
                            : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {applicant.status === "Matched" || applicant.status === "Closed" ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : (
                      <Clock className="h-3.5 w-3.5" />
                    )}
                    {applicant.status}
                  </span>
                </div>

                <h1 className="mt-4 text-xl font-bold text-zinc-900">
                  {applicant.name}
                </h1>
                <p className="text-zinc-600">{applicant.desiredCareer}</p>

                <div className="mt-3 space-y-1">
                  {applicant.email && (
                    <p className="text-sm text-zinc-500">{applicant.email}</p>
                  )}
                  {applicant.phone && (
                    <p className="text-sm text-zinc-500">{applicant.phone}</p>
                  )}
                  {applicant.location && (
                    <p className="text-sm text-zinc-500">{applicant.location}</p>
                  )}
                </div>

                <div className="mt-4 space-y-2 border-t border-zinc-100 pt-4">
                  {applicant.gender && (
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Gender</span>
                      <span className="text-zinc-900 font-medium">{applicant.gender}</span>
                    </div>
                  )}
                  {applicant.university && (
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">University</span>
                      <span className="text-zinc-900 font-medium text-right max-w-[60%]">{applicant.university}</span>
                    </div>
                  )}
                  {applicant.major && (
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Major</span>
                      <span className="text-zinc-900 font-medium text-right max-w-[60%]">{applicant.major}</span>
                    </div>
                  )}
                  {applicant.education && (
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Academic Standing</span>
                      <span className="text-zinc-900 font-medium text-right max-w-[60%]">{applicant.education}</span>
                    </div>
                  )}

                </div>

                <Dialog
                  open={caseManagementOpen}
                  onOpenChange={setCaseManagementOpen}
                >
                  <button
                    type="button"
                    onClick={() => setCaseManagementOpen(true)}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#2F7FA8] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#286E92]"
                  >
                    <ClipboardList className="h-4 w-4" />
                    Manage Case
                  </button>

                  <DialogContent className="max-w-3xl p-0">
                    <DialogHeader className="sr-only">
                      <DialogTitle>
                        Applicant Case Management
                      </DialogTitle>
                      <DialogDescription>
                        Track meetings, follow-ups, outcomes, and
                        internal notes.
                      </DialogDescription>
                    </DialogHeader>

                    <ApplicantCaseManagement
                      applicantId={id}
                      applicantStatus={
                        applicant.status ?? "Pending Review"
                      }
                      onStatusChange={(status) =>
                        setApplicant((current) =>
                          current
                            ? {
                                ...current,
                                status:
                                  status as Applicant["status"],
                              }
                            : current,
                        )
                      }
                      onRematchPermissionChange={
                        setAdditionalSessionRequested
                      }
                    />
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            {/* Career Details card */}
            <Card className="border-zinc-200">
              <CardContent className="p-6">
                <h2 className="font-semibold text-zinc-900">Career Details</h2>
                <div className="mt-4 space-y-4 text-sm">
                  <Detail label="Career Goal" value={applicant.careerGoal} />

                  {/* Industry is editable — used mainly as a grouping tool */}
                  <div>
                    <div className="flex items-center justify-between">
                      <p className="text-zinc-500">Industry Interest</p>
                      {!editingIndustry && (
                        <button
                          onClick={() => {
                            setDraftIndustry(applicant.industryInterest ?? "");
                            setIndustryError(null);
                            setEditingIndustry(true);
                          }}
                          className="text-xs font-medium text-[#2F7FA8] hover:underline"
                        >
                          Edit
                        </button>
                      )}
                    </div>

                    {editingIndustry ? (
                      <div className="mt-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <select
                            value={draftIndustry}
                            onChange={(e) => setDraftIndustry(e.target.value)}
                            disabled={savingIndustry}
                            className="rounded-lg border border-slate-300 px-2 py-1 text-sm text-zinc-900"
                          >
                            {INDUSTRY_OPTIONS.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={handleSaveIndustry}
                            disabled={savingIndustry || !draftIndustry}
                            className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                          >
                            {savingIndustry ? "Saving..." : "Save"}
                          </button>
                          <button
                            onClick={() => setEditingIndustry(false)}
                            disabled={savingIndustry}
                            className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                          >
                            Cancel
                          </button>
                        </div>
                        {industryError && (
                          <p className="text-xs font-medium text-red-600">{industryError}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-zinc-900">{applicant.industryInterest ?? "—"}</p>
                    )}
                  </div>

                  <Detail label="Referral Source" value={applicant.referralSource} />
                </div>
              </CardContent>
            </Card>

            {/* Services & Skills card */}
            <Card className="border-zinc-200">
              <CardContent className="p-6 space-y-4">
                <div>
                  <p className="text-xs text-zinc-500">Requested Services</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {(applicant.services ?? []).map((s) => (
                      <span
                        key={s}
                        className="rounded-md bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {applicant.submitted && (
                  <p className="text-xs text-zinc-400">
                    Submitted: {applicant.submitted}
                  </p>
                )}
              </CardContent>
            </Card>
                        {/* Resume card */}
            <Card className="border-zinc-200">
              <CardContent className="p-6">
                <h2 className="font-semibold text-zinc-900">Resume</h2>
                {applicant.resumeUrl ? (
                  <a
                    href={applicant.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-50"
                  >
                    <FileText className="h-4 w-4" />
                    View / Download Resume
                  </a>
                ) : (
                  <p className="mt-3 text-sm italic text-slate-400">
                    No resume provided.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Additional Notes card */}
            {applicant.additionalNotes && (
              <Card className="border-zinc-200">
                <CardContent className="p-6">
                  <h2 className="font-semibold text-zinc-900">Additional Notes</h2>
                  <p className="mt-3 text-sm text-zinc-600 leading-relaxed">
                    {applicant.additionalNotes}
                  </p>
                </CardContent>
              </Card>
            )}
            <MeetingActivity
              applicantId={id}
              refreshKey={acceptedAdvisorId}
            />
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6 lg:col-span-2">
            {/* Recommendations header card */}
            <Card className="border-zinc-200">
              <CardContent className="flex flex-col gap-4 p-6">
                <div className="text-left">
                  <h2 className="text-lg font-bold text-zinc-900">
                    Advisor Recommendations
                  </h2>
                  <p className="text-sm text-zinc-500">
                    {hasGenerated && !recLoading && !recError
                      ? `${recommendations.length} match${recommendations.length === 1 ? "" : "es"} found`
                      : "No recommendations generated yet."}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleGenerateRecommendations}
                    disabled={recLoading || matchActionsDisabled || applicant.status === "Closed"}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#2F7FA8] px-6 py-3 text-base font-medium text-white hover:bg-[#286E92] disabled:opacity-60"
                  >
                    <Sparkles className="h-5 w-5" />
                    {recLoading ? "Generating..." : "Generate Recommendations"}
                  </button>
                  <button
                    onClick={() => setManualMatchOpen(true)}
                    disabled={matchActionsDisabled || applicant.status === "Closed"}
                    className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 px-6 py-3 text-base font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-60"
                  >
                    <Users className="h-5 w-5" />
                    Manual Match
                  </button>
                  {deletableRecommendationCount > 0 && (
                    <button
                      onClick={handleDeleteAllRecommendations}
                      disabled={isDeletingAll || deletingRecommendationId !== null}
                      className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-6 py-3 text-base font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
                    >
                      <Trash2 className="h-5 w-5" />
                      {isDeletingAll ? "Deleting..." : "Delete All"}
                    </button>
                  )}
                </div>
                {deleteError && (
                  <p className="text-sm font-medium text-red-600">{deleteError}</p>
                )}
              </CardContent>
            </Card>

            <ManualMatchModal
              applicantId={id}
              applicantName={applicant.name}
              open={manualMatchOpen}
              onOpenChange={setManualMatchOpen}
              onMatched={handleManualMatched}
            />

            {manualMatch && (
              <Card className="border-zinc-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Link
                        href={`/advisors/${manualMatch.advisorId}`}
                        className="font-semibold text-zinc-900 hover:underline"
                      >
                        {manualMatch.advisorName}
                      </Link>
                      <p className="text-sm text-zinc-500">
                        {manualMatch.jobTitle} · {manualMatch.company}
                      </p>
                    </div>

                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-sky-50 px-3 py-1 text-sm font-semibold text-sky-700">
                      <Users className="h-3.5 w-3.5" />
                      Manual Match
                    </span>
                  </div>

                  <AdvisorDetailsGrid
                    industry={manualMatch.industry}
                    experienceLevel={manualMatch.experienceLevel}
                    reliabilityLevel={manualMatch.reliabilityLevel}
                    currentMonthlyAssignments={manualMatch.currentMonthlyAssignments}
                    maxMonthlyAssignments={manualMatch.maxMonthlyAssignments}
                  />

                  <div className="mt-4 flex items-center gap-2 border-t border-zinc-100 pt-4">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Matched
                    </span>
                    <button
                      onClick={handleUndo}
                      disabled={isUndoing}
                      className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <RotateCcw className="h-4 w-4" />
                      {isUndoing ? "Undoing..." : "Undo Match"}
                    </button>
                  </div>
                </CardContent>
              </Card>
            )}

            {recLoading && (
              <Card className="border-zinc-200">
                <CardContent className="p-12 text-center text-sm text-zinc-500">
                  Finding the best advisor matches...
                </CardContent>
              </Card>
            )}

            {!recLoading && recError && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-12 text-center text-sm text-red-700">
                  {recError}
                </CardContent>
              </Card>
            )}

            {!recLoading && acceptError && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4 text-center text-sm text-red-700">
                  {acceptError}
                </CardContent>
              </Card>
            )}

            {!recLoading && !recError && !hasGenerated && !manualMatch && (
              <Card className="border-zinc-200">
                <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                  <Sparkles className="h-8 w-8 text-zinc-700" />
                  <p className="mt-4 text-sm text-zinc-500">
                    Click &quot;Generate Recommendations&quot; to find the best
                    advisor matches for this applicant.
                  </p>
                </CardContent>
              </Card>
            )}

            {!recLoading && !recError && hasGenerated && recommendations.length === 0 && (
              <Card className="border-zinc-200">
                <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                  <Sparkles className="h-8 w-8 text-zinc-700" />
                  <p className="mt-4 text-sm text-zinc-500">
                    No eligible advisors matched this applicant.
                  </p>
                </CardContent>
              </Card>
            )}

            {!recLoading && !recError && recommendations.length > 0 && (
              <div className="space-y-4">
                {recommendations
                  .filter((rec) =>
                    // Show all cards when no match yet, or when rematch is allowed.
                    // Once a match is accepted, hide all other cards.
                    acceptedAdvisorId === null ||
                    additionalSessionRequested ||
                    rec.advisorId === acceptedAdvisorId ||
                    rec.recommendationStatus === "Accepted"
                  )
                  .map((rec, index) => {
                  const isAccepted =
                    acceptedAdvisorId === rec.advisorId ||
                    rec.recommendationStatus === "Accepted";
                  const isBlocked =
                    acceptedAdvisorId !== null &&
                    !isAccepted &&
                    !additionalSessionRequested;

                  return (
                    <Card
                      key={rec.advisorId}
                      className={`border-zinc-200 ${isBlocked ? "opacity-60" : ""}`}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <Link
                              href={`/advisors/${rec.advisorId}`}
                              className="font-semibold text-zinc-900 hover:underline"
                            >
                              {rec.advisorName}
                            </Link>
                            <p className="text-sm text-zinc-500">
                              {rec.jobTitle} · {rec.company}
                            </p>
                          </div>

                          <span className="inline-flex shrink-0 items-center rounded-full bg-sky-50 px-3 py-1 text-sm font-semibold text-sky-700">
                            {rec.matchScore}% match
                          </span>
                        </div>

                        <AdvisorDetailsGrid
                          industry={rec.industry}
                          experienceLevel={rec.experienceLevel}
                          reliabilityLevel={rec.reliabilityLevel}
                          currentMonthlyAssignments={rec.currentMonthlyAssignments}
                          maxMonthlyAssignments={rec.maxMonthlyAssignments}
                        />

                        {rec.explanation?.length > 0 && (
                          <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-zinc-600">
                            {rec.explanation.map((line: string) => (
                              <li key={line}>{line}</li>
                            ))}
                          </ul>
                        )}

                        <div className="mt-4 flex items-center gap-2 border-t border-zinc-100 pt-4">
                          {isAccepted ? (
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Accepted
                              </span>
                              <button
                                onClick={handleUndo}
                                disabled={isUndoing}
                                className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                <RotateCcw className="h-4 w-4" />
                                {isUndoing ? "Undoing..." : "Undo Match"}
                              </button>
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={() => handleAccept(rec, index + 1)}
                                disabled={isBlocked || acceptingAdvisorId !== null}
                                title={isBlocked ? "An advisor is already accepted for this applicant." : undefined}
                                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:hover:bg-zinc-300"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                                {acceptingAdvisorId === rec.advisorId
                                  ? "Accepting..."
                                  : "Accept"}
                              </button>
                              <button
                                onClick={() => handleDeleteRecommendation(rec)}
                                disabled={
                                  deletingRecommendationId !== null ||
                                  isDeletingAll ||
                                  acceptingAdvisorId !== null
                                }
                                className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                <Trash2 className="h-4 w-4" />
                                {deletingRecommendationId === rec.recommendationId
                                  ? "Deleting..."
                                  : "Delete"}
                              </button>
                              {isBlocked && (
                                <span className="text-xs text-zinc-500">
                                  Another advisor is already accepted for this applicant.
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </MainLayout>
  );
}

// Small helper for the career detail rows
function Detail({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-zinc-500">{label}</p>
      <p className="text-zinc-900">{value ?? "—"}</p>
    </div>
  );
}

// Shared advisor attribute grid — used by both automatic recommendation cards
// and the manual match card so they stay visually and structurally identical.
function AdvisorDetailsGrid({
  industry,
  experienceLevel,
  reliabilityLevel,
  currentMonthlyAssignments,
  maxMonthlyAssignments,
}: {
  industry: string;
  experienceLevel: string;
  reliabilityLevel: string;
  currentMonthlyAssignments: number;
  maxMonthlyAssignments: number;
}) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
      <Detail label="Industry" value={industry} />
      <Detail label="Experience Level" value={experienceLevel} />
      <div>
        <p className="text-zinc-500">Reliability</p>
        <span
          className={`mt-0.5 inline-block rounded px-2 py-0.5 text-xs font-medium ${getReliabilityStyles(
            reliabilityLevel,
          )}`}
        >
          {reliabilityLevel}
        </span>
      </div>
      <Detail
        label="Monthly Assignments"
        value={`${currentMonthlyAssignments} / ${maxMonthlyAssignments}`}
      />
    </div>
  );
}