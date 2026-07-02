"use client";

import * as React from "react";
import { CheckCircle2 } from "lucide-react";
import {
  ADVISOR_SERVICE_TYPES,
  EXPERIENCE_LEVELS,
  EXPERTISE_SUGGESTIONS,
  GENDERS,
  INDUSTRIES,
} from "@/data/formOptions";
import {
  ChipInput,
  Field,
  FieldGrid,
  FormSection,
  MultiToggle,
  SelectField,
  TextArea,
  TextField,
} from "./formPrimitives";

type AdvisorFormState = {
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  almaMaters: string[];
  majors: string[];
  company: string;
  jobTitle: string;
  industry: string;
  experienceLevel: string;
  expertise: string[];
  services: string[];
  careerHistorySummary: string;
  uniqueCareerExperiences: string;
  mentorshipExperience: string;
  maxMeetingsPerMonth: string;
  additionalNotes: string;
};

const initialState: AdvisorFormState = {
  firstName: "",
  lastName: "",
  email: "",
  gender: "",
  almaMaters: [],
  majors: [],
  company: "",
  jobTitle: "",
  industry: "",
  experienceLevel: "",
  expertise: [],
  services: [],
  careerHistorySummary: "",
  uniqueCareerExperiences: "",
  mentorshipExperience: "",
  maxMeetingsPerMonth: "",
  additionalNotes: "",
};

export default function AdvisorForm() {
  const [form, setForm] = React.useState<AdvisorFormState>(initialState);
  const [submitted, setSubmitted] = React.useState(false);

  const set = <K extends keyof AdvisorFormState>(
    key: K,
    value: AdvisorFormState[K],
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: POST to /api/advisors once the write endpoint exists.
    console.log("Advisor submission", form);
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (submitted) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center ring-1 ring-slate-200">
        <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-[#2F7FA8]" />
        <h2 className="text-lg font-semibold text-slate-800">
          Advisor profile submitted
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Thanks, {form.firstName || "there"}! The advisor profile has been
          recorded.
        </p>
        <button
          type="button"
          onClick={() => {
            setForm(initialState);
            setSubmitted(false);
          }}
          className="mt-6 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Add another advisor
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* 1. Personal Information */}
      <FormSection step={1} title="Personal Information">
        <FieldGrid>
          <Field label="First Name" required htmlFor="advFirstName">
            <TextField
              id="advFirstName"
              required
              placeholder="e.g. Fatima"
              value={form.firstName}
              onChange={(e) => set("firstName", e.target.value)}
            />
          </Field>
          <Field label="Last Name" required htmlFor="advLastName">
            <TextField
              id="advLastName"
              required
              placeholder="e.g. Ali"
              value={form.lastName}
              onChange={(e) => set("lastName", e.target.value)}
            />
          </Field>
          <Field label="Email Address" required htmlFor="advEmail">
            <TextField
              id="advEmail"
              type="email"
              required
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </Field>
          <Field label="Gender" required htmlFor="advGender">
            <SelectField
              id="advGender"
              required
              placeholder="Select gender"
              options={GENDERS}
              value={form.gender}
              onChange={(e) => set("gender", e.target.value)}
            />
          </Field>
        </FieldGrid>
      </FormSection>

      {/* 2. Education */}
      <FormSection step={2} title="Education">
        <div className="flex flex-col gap-5">
          <Field
            label="Alma Mater(s)"
            required
            hint="Type a university name and press Enter or click +"
          >
            <ChipInput
              value={form.almaMaters}
              onChange={(next) => set("almaMaters", next)}
              placeholder="e.g. University of Toronto"
            />
          </Field>
          <Field
            label="Major(s)"
            required
            hint="Type a major and press Enter or click +"
          >
            <ChipInput
              value={form.majors}
              onChange={(next) => set("majors", next)}
              placeholder="e.g. Computer Science"
            />
          </Field>
        </div>
      </FormSection>

      {/* 3. Professional Information */}
      <FormSection step={3} title="Professional Information">
        <FieldGrid>
          <Field label="Employer / Company" required htmlFor="company">
            <TextField
              id="company"
              required
              placeholder="e.g. Microsoft"
              value={form.company}
              onChange={(e) => set("company", e.target.value)}
            />
          </Field>
          <Field label="Job Title" required htmlFor="jobTitle">
            <TextField
              id="jobTitle"
              required
              placeholder="e.g. Senior Software Engineer"
              value={form.jobTitle}
              onChange={(e) => set("jobTitle", e.target.value)}
            />
          </Field>
          <Field label="Industry" required htmlFor="advIndustry">
            <SelectField
              id="advIndustry"
              required
              placeholder="Select an industry"
              options={INDUSTRIES}
              value={form.industry}
              onChange={(e) => set("industry", e.target.value)}
            />
          </Field>
          <Field label="Experience Level" required htmlFor="experienceLevel">
            <SelectField
              id="experienceLevel"
              required
              placeholder="Select experience level"
              options={EXPERIENCE_LEVELS}
              value={form.experienceLevel}
              onChange={(e) => set("experienceLevel", e.target.value)}
            />
          </Field>
        </FieldGrid>
      </FormSection>

      {/* 4. Advisor Information */}
      <FormSection step={4} title="Advisor Information">
        <div className="flex flex-col gap-5">
          <Field
            label="Areas of Expertise"
            required
            hint="Type or choose from suggestions"
          >
            <ChipInput
              value={form.expertise}
              onChange={(next) => set("expertise", next)}
              placeholder="e.g. Financial Modeling"
              suggestions={EXPERTISE_SUGGESTIONS}
            />
          </Field>

          <Field label="Service Types" required hint="Select all that apply">
            <MultiToggle
              options={ADVISOR_SERVICE_TYPES}
              value={form.services}
              onChange={(next) => set("services", next)}
            />
          </Field>

          <Field
            label="Career History Summary"
            required
            htmlFor="careerHistorySummary"
          >
            <TextArea
              id="careerHistorySummary"
              required
              placeholder="Summarize your career history, key roles, and progression..."
              value={form.careerHistorySummary}
              onChange={(e) => set("careerHistorySummary", e.target.value)}
            />
          </Field>

          <Field
            label="Unique Career Experiences"
            required
            htmlFor="uniqueCareerExperiences"
          >
            <TextArea
              id="uniqueCareerExperiences"
              required
              placeholder="Describe any unique or non-traditional experiences in your career..."
              value={form.uniqueCareerExperiences}
              onChange={(e) => set("uniqueCareerExperiences", e.target.value)}
            />
          </Field>

          <Field
            label="Mentorship Experience"
            required
            htmlFor="mentorshipExperience"
          >
            <TextArea
              id="mentorshipExperience"
              required
              placeholder="Describe your previous mentorship or advising experience..."
              value={form.mentorshipExperience}
              onChange={(e) => set("mentorshipExperience", e.target.value)}
            />
          </Field>

          <Field
            label="Maximum Meetings Per Month"
            required
            htmlFor="maxMeetings"
            className="max-w-xs"
          >
            <TextField
              id="maxMeetings"
              type="number"
              min={1}
              required
              placeholder="e.g. 4"
              value={form.maxMeetingsPerMonth}
              onChange={(e) => set("maxMeetingsPerMonth", e.target.value)}
            />
          </Field>

          <Field label="Additional Notes" htmlFor="advAdditionalNotes">
            <TextArea
              id="advAdditionalNotes"
              placeholder="Anything else you'd like us to know..."
              value={form.additionalNotes}
              onChange={(e) => set("additionalNotes", e.target.value)}
            />
          </Field>
        </div>
      </FormSection>

      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">
          All fields marked <span className="text-red-500">*</span> are required
        </p>
        <button
          type="submit"
          className="rounded-lg px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#2F7FA8" }}
        >
          Submit Advisor Profile
        </button>
      </div>
    </form>
  );
}
