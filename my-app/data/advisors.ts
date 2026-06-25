export type Advisor = {
  id: string;
  name: string;
  role: string;
  industry: string;
  company: string;
  location: string;
  availability: string;
  specialties: string[];
};

export const advisors: Advisor[] = [
  {
    id: "1",
    name: "Aisha Rahman",
    role: "Software Engineer",
    industry: "Technology",
    company: "Google",
    location: "New York, NY",
    availability: "Available",
    specialties: ["Resume Review", "Technical Interviews", "Career Guidance"],
  },
  {
    id: "2",
    name: "Omar Khan",
    role: "Financial Analyst",
    industry: "Finance",
    company: "JPMorgan Chase",
    location: "Jersey City, NJ",
    availability: "Available",
    specialties: ["Finance Careers", "Interview Prep", "Networking"],
  },
  {
    id: "3",
    name: "Mariam Ali",
    role: "Product Manager",
    industry: "Business",
    company: "Microsoft",
    location: "Remote",
    availability: "Limited Availability",
    specialties: ["Product Strategy", "Career Switching", "Mentorship"],
  },
  {
    id: "4",
    name: "Yusuf Ibrahim",
    role: "Junior Developer",
    industry: "Technology",
    company: "Startup",
    location: "Philadelphia, PA",
    availability: "Available",
    specialties: ["Entry-Level Tech", "Portfolio Review", "Internships"],
  },
];
