export type MatchStatus = "awaiting" | "matched";
export type RecommendationStatus = "pending" | "accepted" | "rejected";

export interface Recommendation {
  id: string;
  advisorId: string;
  advisorName: string;
  jobTitle: string;
  company: string;
  industry: string;
  expertise: string[];
  matchScore: number;
  status: RecommendationStatus;
  generatedAt: string;
  acceptedAt?: string;
}

export interface Applicant {
  id: string;
  name: string;
  email: string;
  phone: string;
  careerGoal: string;
  industryInterest: string;
  occupationField: string;
  requestedServices: string[];
  educationLevel: string;
  currentRole: string;
  yearsOfExperience: number;
  skills: string[];
  status: MatchStatus;
  submittedAt: string;
  assignedAdvisorId?: string;
  matchDate?: string;
  recommendations: Recommendation[];
}

export interface Advisor {
  id: string;
  name: string;
  email: string;
  jobTitle: string;
  company: string;
  industry: string;
  occupationField: string;
  yearsOfExperience: number;
  specializations: string[];
  servicesOffered: string[];
  industryExpertise: string[];
  careerPath: string;
  proficiency: "Newcomer" | "Intermediate" | "Veteran";
  bio: string;
  languages: string[];
  availability: string;
}

export const advisors: Advisor[] = [
  {
    id: "a1",
    name: "David Johnson",
    email: "david.johnson@email.com",
    jobTitle: "Senior Software Engineer",
    company: "Microsoft",
    industry: "Technology",
    occupationField: "Technology",
    yearsOfExperience: 12,
    specializations: ["Full-Stack Development", "System Design", "Career Transitions"],
    servicesOffered: ["Resume Review", "Mock Interview", "Mentorship"],
    industryExpertise: ["SaaS", "Cloud Computing", "Fintech"],
    careerPath: "Started as a junior developer → Senior Engineer → Engineering Lead → Now focusing on giving back through mentorship",
    proficiency: "Veteran",
    bio: "12 years in software engineering across startups and Fortune 500 companies. Passionate about helping newcomers navigate the tech industry.",
    languages: ["English", "Spanish"],
    availability: "Weekends",
  },
  {
    id: "a2",
    name: "Fatima Ali",
    email: "fatima.ali@email.com",
    jobTitle: "Marketing Manager",
    company: "Procter & Gamble",
    industry: "Consumer Goods",
    occupationField: "Marketing",
    yearsOfExperience: 8,
    specializations: ["Brand Strategy", "Digital Marketing", "Product Launch"],
    servicesOffered: ["Resume Review", "Mentorship"],
    industryExpertise: ["FMCG", "E-commerce", "Healthcare Marketing"],
    careerPath: "Marketing Coordinator → Brand Manager → Senior Marketing Manager → Current role at P&G",
    proficiency: "Intermediate",
    bio: "8 years in consumer marketing. Experienced in brand building and helping professionals transition into marketing roles.",
    languages: ["English", "Urdu", "Arabic"],
    availability: "Evenings",
  },
  {
    id: "a3",
    name: "Ahmed Khan",
    email: "ahmed.khan@email.com",
    jobTitle: "Financial Analyst",
    company: "Goldman Sachs",
    industry: "Finance",
    occupationField: "Finance",
    yearsOfExperience: 6,
    specializations: ["Financial Modeling", "Investment Analysis", "CFA Prep"],
    servicesOffered: ["Resume Review", "Mock Interview"],
    industryExpertise: ["Investment Banking", "Asset Management", "Corporate Finance"],
    careerPath: "Junior Analyst → Financial Analyst → Senior Analyst track at Goldman Sachs",
    proficiency: "Intermediate",
    bio: "CFA Charterholder with 6 years in investment banking. Dedicated to helping finance professionals break into top firms.",
    languages: ["English", "Urdu"],
    availability: "Weekdays evenings",
  },
  {
    id: "a4",
    name: "Nadia Rahman",
    email: "nadia.rahman@email.com",
    jobTitle: "Healthcare Administrator",
    company: "Mount Sinai Health System",
    industry: "Healthcare",
    occupationField: "Healthcare",
    yearsOfExperience: 15,
    specializations: ["Hospital Operations", "Health Policy", "Leadership Development"],
    servicesOffered: ["Mentorship", "Resume Review", "Mock Interview"],
    industryExpertise: ["Hospital Management", "Public Health", "Medical Education"],
    careerPath: "Nurse → Nurse Manager → Director of Operations → Healthcare Administrator",
    proficiency: "Veteran",
    bio: "15 years in healthcare administration. Helped over 50 professionals transition into healthcare management roles.",
    languages: ["English", "Bengali", "French"],
    availability: "Flexible",
  },
  {
    id: "a5",
    name: "Omar Siddiqui",
    email: "omar.siddiqui@email.com",
    jobTitle: "Product Manager",
    company: "Stripe",
    industry: "Technology",
    occupationField: "Technology",
    yearsOfExperience: 7,
    specializations: ["Product Strategy", "User Research", "Agile"],
    servicesOffered: ["Mock Interview", "Mentorship"],
    industryExpertise: ["Fintech", "B2B SaaS", "Payments"],
    careerPath: "Software Engineer → Associate PM → Product Manager at Stripe",
    proficiency: "Intermediate",
    bio: "Former engineer turned PM at Stripe. Specializes in helping engineers and analysts transition into product management.",
    languages: ["English", "Urdu"],
    availability: "Weekends",
  },
  {
    id: "a6",
    name: "Layla Hassan",
    email: "layla.hassan@email.com",
    jobTitle: "Corporate Lawyer",
    company: "Baker McKenzie",
    industry: "Legal",
    occupationField: "Legal",
    yearsOfExperience: 10,
    specializations: ["Corporate Law", "M&A", "International Trade"],
    servicesOffered: ["Resume Review", "Mock Interview", "Mentorship"],
    industryExpertise: ["Corporate Transactions", "Compliance", "International Business"],
    careerPath: "Law School → Associate at BigLaw → Senior Associate → Counsel at Baker McKenzie",
    proficiency: "Veteran",
    bio: "10 years in BigLaw specializing in M&A and corporate transactions. Committed to diversifying the legal profession.",
    languages: ["English", "Arabic", "French"],
    availability: "Weekends",
  },
];

export const applicants: Applicant[] = [
  {
    id: "ap1",
    name: "Yusuf Ibrahim",
    email: "yusuf.ibrahim@email.com",
    phone: "+1 (416) 555-0142",
    careerGoal: "Transition into a senior software engineering role at a top tech company",
    industryInterest: "Technology",
    occupationField: "Technology",
    requestedServices: ["Resume Review", "Mock Interview"],
    educationLevel: "Bachelor's in Computer Science",
    currentRole: "Junior Developer",
    yearsOfExperience: 2,
    skills: ["Python", "React", "Node.js", "AWS"],
    status: "awaiting",
    submittedAt: "2026-06-01",
    recommendations: [],
  },
  {
    id: "ap2",
    name: "Amira Osman",
    email: "amira.osman@email.com",
    phone: "+1 (647) 555-0187",
    careerGoal: "Land a brand manager role at a Fortune 500 CPG company",
    industryInterest: "Consumer Goods",
    occupationField: "Marketing",
    requestedServices: ["Resume Review", "Mentorship"],
    educationLevel: "MBA — Marketing",
    currentRole: "Marketing Coordinator",
    yearsOfExperience: 3,
    skills: ["Brand Strategy", "Digital Marketing", "Market Research", "Adobe Suite"],
    status: "matched",
    submittedAt: "2026-05-20",
    assignedAdvisorId: "a2",
    matchDate: "2026-05-28",
    recommendations: [
      {
        id: "r1",
        advisorId: "a2",
        advisorName: "Fatima Ali",
        jobTitle: "Marketing Manager",
        company: "Procter & Gamble",
        industry: "Consumer Goods",
        expertise: ["Brand Strategy", "Digital Marketing", "Product Launch"],
        matchScore: 94,
        status: "accepted",
        generatedAt: "2026-05-27",
        acceptedAt: "2026-05-28",
      },
      {
        id: "r2",
        advisorId: "a5",
        advisorName: "Omar Siddiqui",
        jobTitle: "Product Manager",
        company: "Stripe",
        industry: "Technology",
        expertise: ["Product Strategy", "User Research"],
        matchScore: 71,
        status: "rejected",
        generatedAt: "2026-05-27",
      },
    ],
  },
  {
    id: "ap3",
    name: "Bilal Chaudhry",
    email: "bilal.chaudhry@email.com",
    phone: "+1 (905) 555-0231",
    careerGoal: "Break into investment banking or asset management",
    industryInterest: "Finance",
    occupationField: "Finance",
    requestedServices: ["Resume Review", "Mock Interview", "Mentorship"],
    educationLevel: "Bachelor's in Economics",
    currentRole: "Financial Analyst (Regional Bank)",
    yearsOfExperience: 4,
    skills: ["Financial Modeling", "Excel", "Bloomberg", "CFA Level 1"],
    status: "awaiting",
    submittedAt: "2026-06-03",
    recommendations: [],
  },
  {
    id: "ap4",
    name: "Hana Malik",
    email: "hana.malik@email.com",
    phone: "+1 (437) 555-0098",
    careerGoal: "Move into healthcare administration leadership",
    industryInterest: "Healthcare",
    occupationField: "Healthcare",
    requestedServices: ["Mentorship"],
    educationLevel: "Master's in Health Administration",
    currentRole: "Patient Services Coordinator",
    yearsOfExperience: 5,
    skills: ["Healthcare Operations", "EHR Systems", "Patient Relations", "Quality Improvement"],
    status: "awaiting",
    submittedAt: "2026-06-05",
    recommendations: [],
  },
  {
    id: "ap5",
    name: "Tariq Mahmood",
    email: "tariq.mahmood@email.com",
    phone: "+1 (416) 555-0319",
    careerGoal: "Transition from engineering to product management",
    industryInterest: "Technology",
    occupationField: "Technology",
    requestedServices: ["Mock Interview", "Mentorship"],
    educationLevel: "Bachelor's in Electrical Engineering",
    currentRole: "Systems Engineer",
    yearsOfExperience: 5,
    skills: ["Systems Engineering", "Python", "SQL", "Agile"],
    status: "awaiting",
    submittedAt: "2026-06-07",
    recommendations: [],
  },
  {
    id: "ap6",
    name: "Salma Diallo",
    email: "salma.diallo@email.com",
    phone: "+1 (647) 555-0452",
    careerGoal: "Join a corporate law firm as an associate",
    industryInterest: "Legal",
    occupationField: "Legal",
    requestedServices: ["Resume Review", "Mock Interview"],
    educationLevel: "JD — Law",
    currentRole: "Legal Clerk",
    yearsOfExperience: 1,
    skills: ["Legal Research", "Contract Drafting", "Corporate Law Basics"],
    status: "matched",
    submittedAt: "2026-05-15",
    assignedAdvisorId: "a6",
    matchDate: "2026-05-22",
    recommendations: [
      {
        id: "r3",
        advisorId: "a6",
        advisorName: "Layla Hassan",
        jobTitle: "Corporate Lawyer",
        company: "Baker McKenzie",
        industry: "Legal",
        expertise: ["Corporate Law", "M&A", "International Trade"],
        matchScore: 97,
        status: "accepted",
        generatedAt: "2026-05-21",
        acceptedAt: "2026-05-22",
      },
    ],
  },
];

export function generateRecommendations(applicant: Applicant): Recommendation[] {
  const scoreAdvisor = (advisor: Advisor): number => {
    let score = 0;
    if (advisor.occupationField === applicant.occupationField) score += 40;
    else if (advisor.industry === applicant.industryInterest) score += 25;
    const serviceMatch = applicant.requestedServices.filter(s =>
      advisor.servicesOffered.includes(s)
    ).length;
    score += serviceMatch * 15;
    const skillOverlap = applicant.skills.filter(skill =>
      advisor.specializations.some(s => s.toLowerCase().includes(skill.toLowerCase())) ||
      advisor.industryExpertise.some(e => e.toLowerCase().includes(skill.toLowerCase()))
    ).length;
    score += Math.min(skillOverlap * 5, 20);
    if (advisor.proficiency === "Veteran") score += 5;
    return Math.min(score + Math.floor(Math.random() * 8), 99);
  };

  return advisors
    .map(advisor => ({
      id: `r-${Date.now()}-${advisor.id}`,
      advisorId: advisor.id,
      advisorName: advisor.name,
      jobTitle: advisor.jobTitle,
      company: advisor.company,
      industry: advisor.industry,
      expertise: advisor.specializations.slice(0, 3),
      matchScore: scoreAdvisor(advisor),
      status: "pending" as RecommendationStatus,
      generatedAt: new Date().toISOString().split("T")[0],
    }))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3);
}
