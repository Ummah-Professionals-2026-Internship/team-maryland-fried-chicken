export type Advisor = {
  id: string;
  name: string;
  role: string;
  industry: string;
  availability: string;
};

export const advisors: Advisor[] = [
  {
    id: "1",
    name: "Aisha Rahman",
    role: "Software Engineer",
    industry: "Technology",
    availability: "Available",
  },
  {
    id: "2",
    name: "Omar Khan",
    role: "Financial Analyst",
    industry: "Finance",
    availability: "Available",
  },
  {
    id: "3",
    name: "Mariam Ali",
    role: "Product Manager",
    industry: "Business",
    availability: "Limited Availability",
  },
];
