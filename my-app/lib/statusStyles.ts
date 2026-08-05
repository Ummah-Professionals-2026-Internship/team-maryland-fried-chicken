// Standardized applicant status badge colors, applied wherever applicant
// status is shown (submissions list, applicant profile, dashboard).
//
//   Pending Review            -> Red
//   Recommendations Generated -> Yellow
//   Matched                   -> Green
//   Follow-up                 -> Blue   (derived: a Matched applicant in an
//                                        active follow-up phase — see mapApplicant)
//   Closed                    -> Purple
export function getApplicantStatusStyles(status?: string): string {
  switch (status) {
    case "Pending Review":
      return "bg-red-50 text-red-700";
    case "Recommendations Generated":
      return "bg-amber-50 text-amber-700";
    case "Matched":
      return "bg-emerald-50 text-emerald-700";
    // The API stores this status as "Follow Up" (space); keep the hyphenated
    // spelling too so any legacy/derived value still maps to a color.
    case "Follow Up":
    case "Follow-up":
      return "bg-blue-50 text-blue-700";
    case "Closed":
      return "bg-purple-50 text-purple-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

// The five selectable applicant statuses, in workflow order.
export const APPLICANT_STATUS_OPTIONS = [
  "Pending Review",
  "Recommendations Generated",
  "Matched",
  "Follow Up",
  "Closed",
] as const;

// Active follow-up phases that promote a Matched applicant to the "Follow-up"
// display status. "Not Started" and "Follow-up Complete" do not.
export const ACTIVE_FOLLOW_UP_PHASES = [
  "1 Week Follow-up",
  "2 Month Follow-up",
  "4 Month Follow-up",
] as const;

// Derives the display status shown in badges/filters from the raw DB row.
export function deriveApplicantStatus(
  rawStatus?: string | null,
  followUpPhase?: string | null,
): string {
  const status = String(rawStatus ?? "");
  if (
    status === "Matched" &&
    (ACTIVE_FOLLOW_UP_PHASES as readonly string[]).includes(
      String(followUpPhase ?? ""),
    )
  ) {
    return "Follow Up";
  }
  return status;
}
