
export const INDUSTRY_ORDER = [
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

export function compareIndustries(a: string, b: string): number {
  const rank = (value: string) => {
    if (value === "Other") return 999; // always last
    const index = INDUSTRY_ORDER.indexOf(value as (typeof INDUSTRY_ORDER)[number]);
    return index === -1 ? 998 : index; // unknowns just before "Other"
  };

  const diff = rank(a) - rank(b);
  return diff !== 0 ? diff : a.localeCompare(b);
}