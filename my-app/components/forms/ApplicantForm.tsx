"use client";

import * as React from "react";
import { Upload, CheckCircle2 } from "lucide-react";
import {
  ACADEMIC_STANDINGS,
  GENDERS,
  INDUSTRIES,
} from "@/data/formOptions";
import {
  Field,
  FieldGrid,
  FormSection,
  MultiToggle,
  SelectField,
  TextArea,
  TextField,
} from "./formPrimitives";

const MAX_RESUME_MB = 5;

// Revised service options matching the organization's current offerings
const REVISED_SERVICE_TYPES = [
  "Resume Review",
  "General Career Advice",
  "Interview Prep",
] as const;

type ApplicantFormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  county: string;
  state: string;
  university: string;
  major: string;
  academicStanding: string;
  desiredFutureCareer: string;
  industry: string;
  services: string[];
  additionalNotes: string;
};

const initialState: ApplicantFormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  gender: "",
  county: "",
  state: "",
  university: "",
  major: "",
  academicStanding: "",
  desiredFutureCareer: "",
  industry: "",
  services: [],
  additionalNotes: "",
};

export default function ApplicantForm() {
  const [form, setForm] = React.useState<ApplicantFormState>(initialState);
  const [resume, setResume] = React.useState<File | null>(null);
  const [submitted, setSubmitted] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const set = <K extends keyof ApplicantFormState>(
    key: K,
    value: ApplicantFormState[K],
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const onFile = (file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_RESUME_MB * 1024 * 1024) {
      alert(`Resume must be ${MAX_RESUME_MB} MB or smaller.`);
      return;
    }
    setResume(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const missingFields: string[] = [];
    if (!form.county.trim()) missingFields.push("County");
    if (!form.state.trim()) missingFields.push("State");
    if (form.services.length === 0) missingFields.push("Service Type Requested");

    if (missingFields.length > 0) {
      setError(`Please complete: ${missingFields.join(", ")}.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/applicants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          resumeName: resume?.name ?? null,
        }),
      });

      const result = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to submit applicant form.");
      }

      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to submit applicant form.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center ring-1 ring-slate-200">
        <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-[#2F7FA8]" />
        <h2 className="text-lg font-semibold text-slate-800">
          Application submitted
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Thanks, {form.firstName || "there"}! We&apos;ve received your
          application and will be in touch soon.
        </p>
        <button
          type="button"
          onClick={() => {
            setForm(initialState);
            setResume(null);
            setSubmitted(false);
            setError(null);
          }}
          className="mt-6 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Submit another application
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Applicant Submission Form
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Fill out the form below to apply for the Ummah Professionals
          mentorship program. Fields marked{" "}
          <span className="text-red-500">*</span> are required.
        </p>
      </div>

      {/* 1. Personal Information */}
      <FormSection step={1} title="Personal Information">
        <FieldGrid>
          <Field label="First Name" required htmlFor="firstName">
            <TextField
              id="firstName"
              required
              placeholder="e.g. Yusuf"
              value={form.firstName}
              onChange={(e) => set("firstName", e.target.value)}
            />
          </Field>
          <Field label="Last Name" required htmlFor="lastName">
            <TextField
              id="lastName"
              required
              placeholder="e.g. Ibrahim"
              value={form.lastName}
              onChange={(e) => set("lastName", e.target.value)}
            />
          </Field>
          <Field label="Email Address" required htmlFor="email">
            <TextField
              id="email"
              type="email"
              required
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </Field>
          <Field label="Phone Number" required htmlFor="phone">
            <TextField
              id="phone"
              type="tel"
              required
              placeholder="+1 (416) 555-0000"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
            />
          </Field>
          <Field label="Gender" required htmlFor="gender">
            <SelectField
              id="gender"
              required
              placeholder="Select gender"
              options={GENDERS}
              value={form.gender}
              onChange={(e) => set("gender", e.target.value)}
            />
          </Field>
          <Field label="County" required htmlFor="county">
            <TextField
              id="county"
              required
              placeholder="e.g. Wake"
              value={form.county}
              onChange={(e) => set("county", e.target.value)}
            />
          </Field>
          <Field label="State" required htmlFor="state">
            <TextField
              id="state"
              required
              placeholder="e.g. NC"
              value={form.state}
              onChange={(e) => set("state", e.target.value)}
            />
          </Field>
        </FieldGrid>
      </FormSection>

      {/* 2. Academic Information */}
      <FormSection step={2} title="Academic Information">
        <FieldGrid>
          <Field label="University" required htmlFor="university">
            <TextField
              id="university"
              required
              placeholder="e.g. University of Toronto"
              value={form.university}
              onChange={(e) => set("university", e.target.value)}
            />
          </Field>
          <Field label="Major" required htmlFor="major">
            <TextField
              id="major"
              required
              placeholder="e.g. Computer Science"
              value={form.major}
              onChange={(e) => set("major", e.target.value)}
            />
          </Field>
          <Field label="Academic Standing" required htmlFor="academicStanding">
            <SelectField
              id="academicStanding"
              required
              placeholder="Select standing"
              options={ACADEMIC_STANDINGS}
              value={form.academicStanding}
              onChange={(e) => set("academicStanding", e.target.value)}
            />
          </Field>
        </FieldGrid>
      </FormSection>

      {/* 3. Career Information */}
      <FormSection step={3} title="Career Information">
        <FieldGrid>
          <Field
            label="Desired Future Career"
            required
            htmlFor="desiredFutureCareer"
          >
            <TextField
              id="desiredFutureCareer"
              required
              placeholder="e.g. Software Engineer"
              value={form.desiredFutureCareer}
              onChange={(e) => set("desiredFutureCareer", e.target.value)}
            />
          </Field>
          <Field label="Industry Interest" required htmlFor="industry">
            <SelectField
              id="industry"
              required
              placeholder="Select an industry"
              options={INDUSTRIES}
              value={form.industry}
              onChange={(e) => set("industry", e.target.value)}
            />
          </Field>
        </FieldGrid>

        <Field label="Resume" className="mt-5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center transition-colors hover:border-[#2F7FA8] hover:bg-white"
          >
            <Upload className="h-5 w-5 text-slate-400" />
            <span className="text-sm font-medium text-slate-700">
              {resume ? resume.name : "Click to upload your resume"}
            </span>
            <span className="text-xs text-[#2F7FA8]">
              PDF, DOC, or DOCX — max {MAX_RESUME_MB} MB
            </span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0])}
          />
        </Field>
      </FormSection>

      {/* 4. Mentorship Information */}
      <FormSection step={4} title="Mentorship Information">
        <Field
          label="Service Type Requested"
          required
          hint="Select all that apply"
        >
          <MultiToggle
            options={REVISED_SERVICE_TYPES}
            value={form.services}
            onChange={(next) => set("services", next)}
          />
        </Field>

        <Field label="Additional Notes" htmlFor="additionalNotes" className="mt-5">
          <TextArea
            id="additionalNotes"
            placeholder="Anything else you'd like us to know..."
            value={form.additionalNotes}
            onChange={(e) => set("additionalNotes", e.target.value)}
          />
        </Field>
      </FormSection>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">
          All fields marked <span className="text-red-500">*</span> are required
        </p>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          style={{ backgroundColor: "#2F7FA8" }}
        >
          {isSubmitting ? "Submitting..." : "Submit Application"}
        </button>
      </div>
    </form>
  );
}