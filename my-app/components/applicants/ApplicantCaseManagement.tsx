"use client";

import { useEffect, useState, type FormEvent } from "react";
import { CalendarDays, CheckCircle2, Save } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const FOLLOW_UP_PHASES = [
  "Not Started",
  "1 Week Follow-up",
  "2 Month Follow-up",
  "4 Month Follow-up",
  "Follow-up Complete",
] as const;

const FOLLOW_UP_OUTCOMES = [
  "Awaiting Follow-up",
  "No Additional Session Needed",
  "Additional Session Requested",
] as const;

type FollowUpPhase = (typeof FOLLOW_UP_PHASES)[number];
type FollowUpOutcome = (typeof FOLLOW_UP_OUTCOMES)[number];

type CaseForm = {
  followUpPhase: FollowUpPhase;
  followUpOutcome: FollowUpOutcome | "";
  lastMeetingDate: string;
  nextFollowUpDate: string;
  internalNotes: string;
};

type AdvisorRelation = {
  first_name?: string | null;
  last_name?: string | null;
};

type MeetingRecord = {
  id: string;
  match_status: string;
  matched_at: string | null;
  created_at: string | null;
  advisors: AdvisorRelation | AdvisorRelation[] | null;
};

type CaseResponse = {
  status?: string;
  follow_up_phase?: FollowUpPhase | null;
  follow_up_outcome?: FollowUpOutcome | null;
  last_meeting_date?: string | null;
  next_follow_up_date?: string | null;
  internal_notes?: string | null;
  meetingActivity?: MeetingRecord[];
};

type ApplicantCaseManagementProps = {
  applicantId: string;
  applicantStatus: string;
  onStatusChange: (status: string) => void;
};

type MeetingActivityProps = {
  applicantId: string;
  refreshKey?: string | null;
};

const EMPTY_FORM: CaseForm = {
  followUpPhase: "Not Started",
  followUpOutcome: "",
  lastMeetingDate: "",
  nextFollowUpDate: "",
  internalNotes: "",
};

function formFromResponse(data: CaseResponse): CaseForm {
  return {
    followUpPhase: data.follow_up_phase ?? "Not Started",
    followUpOutcome: data.follow_up_outcome ?? "",
    lastMeetingDate: data.last_meeting_date ?? "",
    nextFollowUpDate: data.next_follow_up_date ?? "",
    internalNotes: data.internal_notes ?? "",
  };
}

function advisorName(record: MeetingRecord) {
  const relation = Array.isArray(record.advisors)
    ? record.advisors[0]
    : record.advisors;

  const name = [relation?.first_name, relation?.last_name]
    .filter(Boolean)
    .join(" ");

  return name || "Advisor";
}

function displayDate(value: string | null) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function ApplicantCaseManagement({
  applicantId,
  applicantStatus,
  onStatusChange,
}: ApplicantCaseManagementProps) {
  const [form, setForm] = useState<CaseForm>(EMPTY_FORM);
  const [currentStatus, setCurrentStatus] = useState(applicantStatus);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [closing, setClosing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCaseManagement() {
      try {
        const response = await fetch(
          `/api/applicants/${applicantId}/case-management`,
        );
        const body: CaseResponse & { error?: string } = await response
          .json()
          .catch(() => ({}));

        if (!response.ok) {
          throw new Error(body.error ?? `Server error: ${response.status}`);
        }

        if (!cancelled) {
          setForm(formFromResponse(body));
          setCurrentStatus(body.status ?? applicantStatus);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load case management.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadCaseManagement();

    return () => {
      cancelled = true;
    };
  }, [applicantId, applicantStatus]);

  function updateField<Key extends keyof CaseForm>(
    key: Key,
    value: CaseForm[Key],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
    setSuccess(null);
  }

  async function persistCase(closeCase: boolean) {
    if (closeCase) setClosing(true);
    else setSaving(true);

    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(
        `/api/applicants/${applicantId}/case-management`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            followUpPhase: form.followUpPhase,
            followUpOutcome: form.followUpOutcome || null,
            lastMeetingDate: form.lastMeetingDate || null,
            nextFollowUpDate: form.nextFollowUpDate || null,
            internalNotes: form.internalNotes,
            closeCase,
          }),
        },
      );

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(body.error ?? `Server error: ${response.status}`);
      }

      if (body.applicant) {
        setForm(formFromResponse(body.applicant));

        const nextStatus = String(
          body.applicant.status ?? currentStatus,
        );

        setCurrentStatus(nextStatus);
        onStatusChange(nextStatus);
      }

      setSuccess(
        closeCase
          ? "Applicant case closed successfully."
          : "Case management saved successfully.",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save case management.",
      );
    } finally {
      setSaving(false);
      setClosing(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void persistCase(false);
  }

  const isClosed = currentStatus === "Closed";
  const canClose =
    form.followUpPhase === "Follow-up Complete" &&
    form.followUpOutcome === "No Additional Session Needed";

  const showOutcome = [
    "1 Week Follow-up",
    "2 Month Follow-up",
    "4 Month Follow-up",
  ].includes(form.followUpPhase);

  if (loading) {
    return (
      <Card className="border-zinc-200">
        <CardContent className="p-6 text-sm text-zinc-500">
          Loading case management...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-zinc-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-zinc-900">
              Applicant Case Management
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Track meetings, follow-ups, outcomes, and internal notes.
            </p>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
            Status: {currentStatus}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-zinc-700">
              <span>Follow-up Phase</span>
              <select
                value={form.followUpPhase}
                disabled={isClosed}
                onChange={(event) =>
                  updateField(
                    "followUpPhase",
                    event.target.value as FollowUpPhase,
                  )
                }
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 disabled:bg-zinc-100"
              >
                {FOLLOW_UP_PHASES.map((phase) => (
                  <option key={phase} value={phase}>
                    {phase}
                  </option>
                ))}
              </select>
            </label>

            {showOutcome && (
              <label className="space-y-2 text-sm font-medium text-zinc-700">
                <span>Follow-up Outcome</span>
                <select
                  value={form.followUpOutcome}
                  disabled={isClosed}
                  onChange={(event) =>
                    updateField(
                      "followUpOutcome",
                      event.target.value as FollowUpOutcome | "",
                    )
                  }
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 disabled:bg-zinc-100"
                >
                  <option value="">Select an outcome</option>
                  {FOLLOW_UP_OUTCOMES.map((outcome) => (
                    <option key={outcome} value={outcome}>
                      {outcome}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-zinc-700">
              <span>Last Meeting Date</span>
              <input
                type="date"
                value={form.lastMeetingDate}
                disabled={isClosed}
                onChange={(event) =>
                  updateField("lastMeetingDate", event.target.value)
                }
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 disabled:bg-zinc-100"
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-zinc-700">
              <span>Next Follow-up Date</span>
              <input
                type="date"
                value={form.nextFollowUpDate}
                disabled={isClosed}
                onChange={(event) =>
                  updateField("nextFollowUpDate", event.target.value)
                }
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 disabled:bg-zinc-100"
              />
            </label>
          </div>

          <label className="block space-y-2 text-sm font-medium text-zinc-700">
            <span>Internal Notes</span>
            <textarea
              rows={5}
              value={form.internalNotes}
              disabled={isClosed}
              placeholder="Requested another mentor, found employment, waiting for a response..."
              onChange={(event) =>
                updateField("internalNotes", event.target.value)
              }
              className="w-full resize-y rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 disabled:bg-zinc-100"
            />
          </label>

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}

          {success && (
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
              {success}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 pt-5">
            <button
              type="submit"
              disabled={saving || closing || isClosed}
              className="inline-flex items-center gap-2 rounded-lg bg-[#2F7FA8] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#286E92] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Case Details"}
            </button>

            {!isClosed && (
              <button
                type="button"
                disabled={!canClose || saving || closing}
                onClick={() => void persistCase(true)}
                title={
                  canClose
                    ? undefined
                    : "Complete follow-up with no additional session needed first."
                }
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
              >
                <CheckCircle2 className="h-4 w-4" />
                {closing ? "Closing..." : "Close Case"}
              </button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export function MeetingActivity({
  applicantId,
  refreshKey,
}: MeetingActivityProps) {
  const [records, setRecords] = useState<MeetingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadMeetingActivity() {
      try {
        const response = await fetch(
          `/api/applicants/${applicantId}/case-management`,
        );
        const body: CaseResponse & { error?: string } = await response
          .json()
          .catch(() => ({}));

        if (!response.ok) {
          throw new Error(body.error ?? `Server error: ${response.status}`);
        }

        if (!cancelled) {
          setRecords(body.meetingActivity ?? []);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load meeting activity.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadMeetingActivity();

    return () => {
      cancelled = true;
    };
  }, [applicantId, refreshKey]);

  return (
    <Card className="border-zinc-200">
      <CardContent className="p-6">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-sky-700" />
          <h2 className="font-semibold text-zinc-900">Meeting Activity</h2>
        </div>

        {loading && (
          <p className="mt-4 text-sm text-zinc-500">Loading meetings...</p>
        )}

        {!loading && error && (
          <p className="mt-4 text-sm text-red-600">{error}</p>
        )}

        {!loading && !error && records.length === 0 && (
          <p className="mt-4 text-sm text-zinc-500">
            No meetings have been recorded yet.
          </p>
        )}

        {!loading && !error && records.length > 0 && (
          <div className="mt-4 space-y-3">
            {records.map((record) => (
              <div
                key={record.id}
                className="rounded-lg border border-zinc-200 bg-zinc-50 p-3"
              >
                <p className="text-sm font-medium text-zinc-900">
                  {advisorName(record)}
                </p>
                <div className="mt-1 flex items-center justify-between gap-2 text-xs text-zinc-500">
                  <span>{displayDate(record.matched_at ?? record.created_at)}</span>
                  <span className="rounded-full bg-white px-2 py-0.5">
                    {record.match_status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
