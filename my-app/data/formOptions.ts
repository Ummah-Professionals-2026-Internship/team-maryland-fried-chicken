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
// Used on the applicant form (service requested).
export const SERVICE_TYPES = [
  "Resume Review",
  "Mentorship Program",
  "General Career Advice",
] as const;

// Services an advisor can offer — the base set plus Interview Prep and
// Healthcare Service.
export const ADVISOR_SERVICE_TYPES = [
  "Resume Review",
  "Mentorship Program",
  "General Career Advice",
  "Interview Prep",
  "Healthcare Service",
] as const;

// applicants.academic_standing CHECK constraint.
// NOTE: "Graduated" + "Masters" are pending a matching schema update (Shuiab).
export const ACADEMIC_STANDINGS = [
  "Freshman",
  "Sophomore",
  "Junior",
  "Senior",
  "Graduated",
  "Masters",
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

export const COUNTRY_CODES = [
  "+1",
  "+20",
  "+27",
  "+30",
  "+31",
  "+32",
  "+33",
  "+34",
  "+39",
  "+44",
  "+49",
  "+52",
  "+55",
  "+60",
  "+61",
  "+62",
  "+63",
  "+64",
  "+65",
  "+81",
  "+82",
  "+90",
  "+91",
  "+92",
  "+93",
  "+94",
  "+98",
  "+212",
  "+213",
  "+216",
  "+218",
  "+220",
  "+221",
  "+234",
  "+249",
  "+254",
  "+351",
  "+352",
  "+353",
  "+354",
  "+355",
  "+356",
  "+357",
  "+358",
  "+359",
  "+370",
  "+371",
  "+372",
  "+373",
  "+374",
  "+375",
  "+376",
  "+377",
  "+378",
  "+380",
  "+381",
  "+382",
  "+383",
  "+385",
  "+386",
  "+387",
  "+389",
  "+420",
  "+421",
  "+423",
  "+880",
  "+961",
  "+962",
  "+963",
  "+964",
  "+965",
  "+966",
  "+967",
  "+968",
  "+970",
  "+971",
  "+972",
  "+973",
  "+974",
  "+975",
  "+976",
  "+977",
  "+992",
  "+993",
  "+994",
  "+995",
  "+996",
  "+998",
] as const;
export type Industry = (typeof INDUSTRIES)[number];
export type ServiceType = (typeof SERVICE_TYPES)[number];
export type AcademicStanding = (typeof ACADEMIC_STANDINGS)[number];
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];
export type Gender = (typeof GENDERS)[number];

export const REFERRAL_SOURCES = [
  "Word of Mouth",
  "Instagram",
  "LinkedIn",
  "My MSA",
  "My YM",
  "Other",
] as const;

export type ReferralSource = (typeof REFERRAL_SOURCES)[number];
