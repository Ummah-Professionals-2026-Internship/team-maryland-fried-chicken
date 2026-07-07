"use client";

import * as React from "react";
import { CheckCircle2, ChevronDown } from "lucide-react";
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

import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "../ui/collapsible";
import { useState } from "react";
import { Button } from "../ui/button";

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
  uniqueCareerExperiences: string[];
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
  uniqueCareerExperiences: [],
  mentorshipExperience: "",
  maxMeetingsPerMonth: "",
  additionalNotes: "",
};

export default function AdvisorForm() {
  const [form, setForm] = React.useState<AdvisorFormState>(initialState);
  const [submitted, setSubmitted] = React.useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const MENTORSHIP_OPTIONS = [
    "Career Change", "Graduate School", "Enterpreneurship", "International Career", "Startup Experience", "Leadership Experience", "Career Break", "First-Generation College Student", "Military Experience", "Remote Work", "Immigration Journey"
  ];

  const MENTORSHIP_EXPERIENCE_LEVELS = [
    "None", "Less than 1 year", "1-3 years", "3-5 years", "5+ years"
  ];

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
    
    <form onSubmit={handleSubmit} className="flex flex-col gap-10">
      {/* 1. Personal Information */}
      <FormSection step={1} title="Personal Information">
        <FieldGrid>
          <Field label="First Name" required labelClassName="text-lg">
            <TextField
              id="advFirstName"
              required
              placeholder="e.g. Fatima"
              value={form.firstName}
              onChange={(e) => set("firstName", e.target.value)}
            />
          </Field>
          <Field label="Last Name" required htmlFor="advLastName" labelClassName="text-lg">
            <TextField
              id="advLastName"
              required
              placeholder="e.g. Ali"
              value={form.lastName}
              onChange={(e) => set("lastName", e.target.value)}
            />
          </Field>
          <Field label="Email Address" required htmlFor="advEmail" labelClassName="text-lg">
            <TextField
              id="advEmail"
              type="email"
              required
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </Field>
          <Field label="Gender" required htmlFor="advGender" labelClassName="text-lg">
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
             labelClassName="text-lg"
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
            labelClassName="text-lg"
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
          <Field label="Employer / Company" required htmlFor="company"  labelClassName="text-lg">
            <TextField
              id="company"
              required
              placeholder="e.g. Microsoft"
              value={form.company}
              onChange={(e) => set("company", e.target.value)}
            />
          </Field>
          <Field label="Job Title" required htmlFor="jobTitle" labelClassName="text-lg">
            <TextField
              id="jobTitle"
              required
              placeholder="e.g. Senior Software Engineer"
              value={form.jobTitle}
              onChange={(e) => set("jobTitle", e.target.value)}
            />
          </Field>
          <Field label="Industry" required htmlFor="advIndustry" labelClassName="text-lg">
            <SelectField
              id="advIndustry"
              required
              placeholder="Select an industry"
              options={INDUSTRIES}
              value={form.industry}
              onChange={(e) => set("industry", e.target.value)}
            />
          </Field>
          <Field label="Experience Level" required htmlFor="experienceLevel" labelClassName="text-lg">
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
          <Field label="Service Types" required hint="Select the types of support you are willing to provide to students." labelClassName="text-lg">
            <MultiToggle
              options={ADVISOR_SERVICE_TYPES}
              value={form.services}
              onChange={(next) => set("services", next)}
            />
          </Field>

          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-6">
            <div className="flex flex-col gap-2.5 sm:flex-1">
              <label
                htmlFor="maxMeetings"
                className="text-lg font-medium text-slate-700"
              >
                Maximum Meetings Per Month
                <span className="ml-0.5 text-red-500">*</span>
              </label>
              <p className="-mt-0.5 text-xs text-slate-400">
                Approximately how many mentoring meetings are you comfortable
                conducting each month? This helps us balance advisor workload
                and prevent advisor burnout.
              </p>
            </div>
            <TextField
              id="maxMeetings"
              type="number"
              min={1}
              required
              placeholder="Example: 4"
              value={form.maxMeetingsPerMonth}
              onChange={(e) => set("maxMeetingsPerMonth", e.target.value)}
              className="sm:w-40 sm:shrink-0"
            />
          </div>

          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <Button 
                type="button"
                variant="ghost"
                className="flex w-full items-center justify-between p-0 text-xl   "

                >
                  <span>Want to help us make even better matches? (Optional)</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    />
                </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-8 pt-4">
                    <Field
                      label="Areas of Expertise"
                      hint="Please narrow down your area of expertise for us and mention any specific skills
that you implement in your daily work. This information helps us provide more
relevant advisor recommendations."
 labelClassName="text-lg"
                    >
                      <ChipInput
                        value={form.expertise}
                        onChange={(next) => set("expertise", next)}
                        placeholder="Example: Software Engineering, Product Management, Financial Modeling, UX
Design"
                        suggestions={EXPERTISE_SUGGESTIONS}
                      />
                    </Field>
                    <Field
                      label="Career Journey"
                      hint="Briefly describe your current role and career journey in 2Ã¢â‚¬â€œ3 sentences. This helps
us understand your professional background."
                      htmlFor="careerHistorySummary"
                       labelClassName="text-lg"
                    >
                      <TextArea
                        id="careerHistorySummary"
                        placeholder="Example: I am currently a Software Engineer at Microsoft with five years of
experience building cloud applications after completing my Computer Science
degree."
                        value={form.careerHistorySummary}
                        onChange={(e) => set("careerHistorySummary", e.target.value)}
                      />
                    </Field>
                     <Field
                      label="Unique Career Experiences"
                      htmlFor="uniqueCareerExperiences"
                      labelClassName="text-lg"
                      hint="Have you had any unique career experiences that you would like to share with us?"
                    >
                      <MultiToggle
                        options={MENTORSHIP_OPTIONS}
                        value={form.uniqueCareerExperiences}
                        onChange={(next) => set("uniqueCareerExperiences", next)}
                      />
                    </Field>
                    <Field
                      label="How much prior mentorship or advising experience do you have with Ummah
Professionals?"
hint="Select the option that best describes your previous mentoring experience."
                      htmlFor="mentorshipExperience"
                       labelClassName="text-lg"
                    >
                      <SelectField
                        id="mentorshipExperience"
                        required
                        placeholder="Select Mentorship experience"
                        options={MENTORSHIP_EXPERIENCE_LEVELS}
                        value={form.mentorshipExperience}
                        onChange={(e) => set("mentorshipExperience", e.target.value)}
                      />
                    </Field>
                    <Field label="Additional Notes" 
                    hint="Is there anything else you would like us to know about your background or
experience?"
                    htmlFor="advAdditionalNotes"
                     labelClassName="text-lg">
                      <TextArea
                        id="advAdditionalNotes"

                        placeholder="Share any additional information that may help us understand your professional
experienc"
                        value={form.additionalNotes}
                        onChange={(e) => set("additionalNotes", e.target.value)}
                      />
                    </Field>

            </CollapsibleContent>
          
          </Collapsible>
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
