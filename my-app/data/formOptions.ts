// Controlled vocabularies for the applicant & advisor forms.
// These are sourced directly from the database schema
// (my-app/migrations/init.sql) so the form values always match the
// CHECK constraints and lookup tables the backend enforces.

// applicants.industry / advisors.industry CHECK constraint.
// Use these exact names and only these.
export const INDUSTRIES = [
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

// service_types seed data (Resume Review, Mentorship Program, General Career Advice).
export const SERVICE_TYPES = [
  "Resume Review",
  "Mentorship Program",
  "General Career Advice",
] as const;

// applicants.academic_standing CHECK constraint.
export const ACADEMIC_STANDINGS = [
  "Freshman",
  "Sophomore",
  "Junior",
  "Senior",
  "Graduate",
] as const;

// advisors.experience_level CHECK constraint.
export const EXPERIENCE_LEVELS = [
  "Graduate/Working Student",
  "Young Professional (0-3 Years)",
  "Mid-Career Professional (3-10 Years)",
  "Senior Professional (10+ Years)",
] as const;

// Gender choices — kept as Brother / Sister per program convention.
export const GENDERS = ["Brother", "Sister"] as const;

// Suggested areas of expertise shown as quick-add chips on the advisor form.
export const EXPERTISE_SUGGESTIONS = [
  "Software Engineering",
  "Product Management",
  "Data Science",
  "UX Design",
  "Financial Modeling",
  "Investment Banking",
] as const;

export type Industry = (typeof INDUSTRIES)[number];
export type ServiceType = (typeof SERVICE_TYPES)[number];
export type AcademicStanding = (typeof ACADEMIC_STANDINGS)[number];
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];
export type Gender = (typeof GENDERS)[number];
