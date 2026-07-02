"use client";

import * as React from "react";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

const BRAND = "#2F7FA8";

/* ------------------------------------------------------------------ */
/* Section card with a numbered header                                 */
/* ------------------------------------------------------------------ */
export function FormSection({
  step,
  title,
  children,
}: {
  step: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white p-6 ring-1 ring-slate-200">
      <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-3">
        <span
          className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold text-white"
          style={{ backgroundColor: BRAND }}
        >
          {step}
        </span>
        <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
      </div>
      {children}
    </section>
  );
}

/* Two-column responsive grid for fields */
export function FieldGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Field label wrapper                                                 */
/* ------------------------------------------------------------------ */
export function Field({
  label,
  required,
  htmlFor,
  hint,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  htmlFor?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium text-slate-700"
      >
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
        {!required && (
          <span className="ml-1 text-xs font-normal text-slate-400">
            (optional)
          </span>
        )}
      </label>
      {hint && <p className="-mt-0.5 text-xs text-slate-400">{hint}</p>}
      {children}
    </div>
  );
}

const controlClasses =
  "w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-[#2F7FA8] focus:bg-white focus:ring-2 focus:ring-[#2F7FA8]/20";

/* Text / email / tel / number input */
export function TextField(props: React.ComponentProps<"input">) {
  return <input {...props} className={cn(controlClasses, props.className)} />;
}

/* Multi-line textarea */
export function TextArea(props: React.ComponentProps<"textarea">) {
  return (
    <textarea
      {...props}
      className={cn(controlClasses, "min-h-24 resize-y", props.className)}
    />
  );
}

/* Native select styled like the other controls */
export function SelectField({
  placeholder,
  options,
  className,
  ...props
}: React.ComponentProps<"select"> & {
  placeholder?: string;
  options: readonly string[];
}) {
  return (
    <select
      {...props}
      className={cn(
        controlClasses,
        "appearance-none bg-[right_0.75rem_center] bg-no-repeat pr-9",
        !props.value && "text-slate-400",
        className,
      )}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>\")",
      }}
    >
      <option value="" disabled hidden>
        {placeholder ?? "Select an option"}
      </option>
      {options.map((opt) => (
        <option key={opt} value={opt} className="text-slate-800">
          {opt}
        </option>
      ))}
    </select>
  );
}

/* ------------------------------------------------------------------ */
/* Multi-select pill toggle (e.g. Service Types)                       */
/* ------------------------------------------------------------------ */
export function MultiToggle({
  options,
  value,
  onChange,
}: {
  options: readonly string[];
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const toggle = (opt: string) =>
    onChange(
      value.includes(opt)
        ? value.filter((v) => v !== opt)
        : [...value, opt],
    );

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = value.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            aria-pressed={active}
            className={cn(
              "rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors",
              active
                ? "border-[#2F7FA8] bg-[#2F7FA8] text-white"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
            )}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Chip / tag input (e.g. Alma Mater(s), Major(s), Areas of Expertise) */
/* ------------------------------------------------------------------ */
export function ChipInput({
  value,
  onChange,
  placeholder,
  suggestions,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  suggestions?: readonly string[];
}) {
  const [draft, setDraft] = React.useState("");

  const add = (raw: string) => {
    const item = raw.trim();
    if (!item || value.includes(item)) return;
    onChange([...value, item]);
    setDraft("");
  };

  const remove = (item: string) =>
    onChange(value.filter((v) => v !== item));

  const availableSuggestions = suggestions?.filter(
    (s) => !value.includes(s),
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-stretch gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add(draft);
            }
          }}
          placeholder={placeholder}
          className={cn(controlClasses, "flex-1")}
        />
        <button
          type="button"
          onClick={() => add(draft)}
          aria-label="Add"
          className="flex w-10 items-center justify-center rounded-lg text-white transition-colors hover:opacity-90"
          style={{ backgroundColor: BRAND }}
        >
          <Plus size={16} />
        </button>
      </div>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 rounded-md border border-[#2F7FA8]/30 bg-[#2F7FA8]/10 px-2.5 py-1 text-xs font-medium text-[#2F7FA8]"
            >
              {item}
              <button
                type="button"
                onClick={() => remove(item)}
                aria-label={`Remove ${item}`}
                className="text-[#2F7FA8]/70 hover:text-[#2F7FA8]"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      {availableSuggestions && availableSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {availableSuggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-500 hover:border-[#2F7FA8]/40 hover:text-[#2F7FA8]"
            >
              <Plus size={11} />
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
