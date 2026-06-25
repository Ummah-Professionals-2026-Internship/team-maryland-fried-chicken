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

  careerPrepDefault: boolean;
  monthlyCapacityUsed: number;
  monthlyCapacityTotal: number;
  lastEvent: string;
  lastCareerPrep: string;
  signUpDate: string;
  experienceLevel: string;
  areasOfExpertise: string[];
  major: string;
  university: string;
  country: string;
  stateProvince: string;
  careerHistorySummary: string;
  uniqueCareerExperiences: string;
  mentorshipExperience: string;
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
    serviceTypes: ["Resume Review", "Mock Interview", "Mentorship"],
    reliabilityLevel: "Level 3",
    specialties: ["Resume Review", "Mock Interview", "Mentorship"],

    careerPrepDefault: true,
    monthlyCapacityUsed: 2,
    monthlyCapacityTotal: 4,
    lastEvent: "2026-05-15",
    lastCareerPrep: "2026-05-20",
    signUpDate: "2024-01-10",
    experienceLevel: "10+ Years",
    areasOfExpertise: [
      "Full-Stack Development",
      "System Design",
      "Cloud Architecture",
      "Technical Interviews",
    ],
    major: "Computer Science",
    university: "University of Toronto",
    country: "Canada",
    stateProvince: "Ontario",
    careerHistorySummary:
      "Started as a junior developer at a Toronto startup, grew into senior engineering roles at mid-size tech companies before joining Microsoft. Has led teams of 5-12 engineers across SaaS and cloud infrastructure projects.",
    uniqueCareerExperiences:
      "Navigated the transition from a non-traditional CS background into Big Tech. Worked across three countries before settling in Canada.",
    mentorshipExperience:
      "3 years of formal mentorship through Ummah Professionals. Previously mentored junior developers through an internal Microsoft program.",
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

    careerPrepDefault: true,
    monthlyCapacityUsed: 1,
    monthlyCapacityTotal: 4,
    lastEvent: "2026-05-12",
    lastCareerPrep: "2026-05-18",
    signUpDate: "2024-03-04",
    experienceLevel: "7+ Years",
    areasOfExpertise: ["Product Strategy", "Fintech", "Mock Interviews"],
    major: "Business Administration",
    university: "Rutgers University",
    country: "United States",
    stateProvince: "New Jersey",
    careerHistorySummary:
      "Built experience across startup and fintech product teams before becoming a product manager at Stripe.",
    uniqueCareerExperiences:
      "Has worked closely with engineering, design, and business teams to launch user-facing financial products.",
    mentorshipExperience:
      "Mentors early-career professionals interested in product management and fintech careers.",
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

    careerPrepDefault: true,
    monthlyCapacityUsed: 2,
    monthlyCapacityTotal: 5,
    lastEvent: "2026-04-28",
    lastCareerPrep: "2026-05-02",
    signUpDate: "2024-02-14",
    experienceLevel: "8+ Years",
    areasOfExpertise: ["Brand Marketing", "Consumer Strategy", "Networking"],
    major: "Marketing",
    university: "Ohio State University",
    country: "United States",
    stateProvince: "Ohio",
    careerHistorySummary:
      "Developed brand campaigns and consumer marketing strategies across multiple product categories.",
    uniqueCareerExperiences:
      "Worked on cross-functional marketing launches with sales, design, and analytics teams.",
    mentorshipExperience:
      "Supports students and early professionals with resumes, networking, and marketing career paths.",
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

    careerPrepDefault: false,
    monthlyCapacityUsed: 3,
    monthlyCapacityTotal: 4,
    lastEvent: "2026-05-08",
    lastCareerPrep: "2026-05-10",
    signUpDate: "2023-11-19",
    experienceLevel: "6+ Years",
    areasOfExpertise: ["Financial Analysis", "Investment Banking", "Interview Prep"],
    major: "Finance",
    university: "New York University",
    country: "United States",
    stateProvince: "New York",
    careerHistorySummary:
      "Built finance experience through analyst roles focused on financial modeling, reporting, and client-facing projects.",
    uniqueCareerExperiences:
      "Has helped candidates prepare for technical finance interviews and networking conversations.",
    mentorshipExperience:
      "Mentors students interested in finance, banking, and analyst-track roles.",
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

    careerPrepDefault: true,
    monthlyCapacityUsed: 4,
    monthlyCapacityTotal: 4,
    lastEvent: "2026-05-01",
    lastCareerPrep: "2026-05-06",
    signUpDate: "2023-09-22",
    experienceLevel: "9+ Years",
    areasOfExpertise: ["Healthcare Operations", "Administration", "Career Guidance"],
    major: "Healthcare Administration",
    university: "Columbia University",
    country: "United States",
    stateProvince: "New York",
    careerHistorySummary:
      "Worked across hospital operations, patient services, and administrative leadership roles.",
    uniqueCareerExperiences:
      "Has experience navigating healthcare systems and supporting operational improvements.",
    mentorshipExperience:
      "Mentors students interested in healthcare administration and nonprofit healthcare work.",
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

    careerPrepDefault: true,
    monthlyCapacityUsed: 2,
    monthlyCapacityTotal: 3,
    lastEvent: "2026-04-20",
    lastCareerPrep: "2026-04-26",
    signUpDate: "2024-01-28",
    experienceLevel: "10+ Years",
    areasOfExpertise: ["Corporate Law", "Legal Careers", "Interview Prep"],
    major: "Political Science",
    university: "University of Chicago",
    country: "United States",
    stateProvince: "Illinois",
    careerHistorySummary:
      "Built a legal career through corporate law, client advisory work, and international business matters.",
    uniqueCareerExperiences:
      "Has worked with multinational clients and supported students preparing for law school and legal internships.",
    mentorshipExperience:
      "Mentors students interested in law school, corporate law, and professional communication.",
  },
];
