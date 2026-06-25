export type Advisor = {
  id: string;
  initials: string;
  name: string;
  role: string;
  jobTitle: string;
  industry: string;
  field: string;
  company: string;
  location: string;
  availability: string;
  serviceTypes: string[];
  reliabilityLevel: "Level 1" | "Level 2" | "Level 3";
  specialties: string[];
};

export const advisors: Advisor[] = [
  {
    id: "1",
    initials: "DJ",
    name: "David Johnson",
    role: "Senior Software Engineer",
    jobTitle: "Senior Software Engineer",
    industry: "Technology",
    field: "Technology",
    company: "Microsoft",
    location: "Seattle, WA",
    availability: "Available",
    serviceTypes: ["Resume Review", "Mock Interview", "Career Guidance"],
    reliabilityLevel: "Level 3",
    specialties: ["Resume Review", "Mock Interview", "Career Guidance"],
  },
  {
    id: "2",
    initials: "OS",
    name: "Omar Siddiqui",
    role: "Product Manager",
    jobTitle: "Product Manager",
    industry: "Technology",
    field: "Technology",
    company: "Stripe",
    location: "Remote",
    availability: "Available",
    serviceTypes: ["Mock Interview", "Mentorship"],
    reliabilityLevel: "Level 1",
    specialties: ["Mock Interview", "Mentorship"],
  },
  {
    id: "3",
    initials: "FA",
    name: "Fatima Ali",
    role: "Marketing Manager",
    jobTitle: "Marketing Manager",
    industry: "Marketing",
    field: "Marketing",
    company: "Procter & Gamble",
    location: "Cincinnati, OH",
    availability: "Available",
    serviceTypes: ["Resume Review", "Mentorship"],
    reliabilityLevel: "Level 2",
    specialties: ["Resume Review", "Mentorship"],
  },
  {
    id: "4",
    initials: "AK",
    name: "Ahmed Khan",
    role: "Financial Analyst",
    jobTitle: "Financial Analyst",
    industry: "Finance",
    field: "Finance",
    company: "Goldman Sachs",
    location: "New York, NY",
    availability: "Available",
    serviceTypes: ["Resume Review", "Mock Interview"],
    reliabilityLevel: "Level 2",
    specialties: ["Resume Review", "Mock Interview"],
  },
  {
    id: "5",
    initials: "NR",
    name: "Nadia Rahman",
    role: "Healthcare Administrator",
    jobTitle: "Healthcare Administrator",
    industry: "Healthcare",
    field: "Healthcare",
    company: "Mount Sinai Health System",
    location: "New York, NY",
    availability: "Limited Availability",
    serviceTypes: ["Mentorship", "Resume Review", "Career Guidance"],
    reliabilityLevel: "Level 3",
    specialties: ["Mentorship", "Resume Review", "Career Guidance"],
  },
  {
    id: "6",
    initials: "LH",
    name: "Layla Hassan",
    role: "Corporate Lawyer",
    jobTitle: "Corporate Lawyer",
    industry: "Legal",
    field: "Legal",
    company: "Baker McKenzie",
    location: "Chicago, IL",
    availability: "Available",
    serviceTypes: ["Resume Review", "Mock Interview", "Career Guidance"],
    reliabilityLevel: "Level 3",
    specialties: ["Resume Review", "Mock Interview", "Career Guidance"],
  },
];
