"use client";

import { CheckCircle2, Circle, CircleDot } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: "job", label: "Job Created", description: "Role and AI criteria defined in Sub0" },
  { id: "upload", label: "Applicants Uploaded", description: "Spreadsheets or resumes ingested" },
  { id: "parse", label: "Profiles Parsed", description: "Structured talent records in Sub0" },
  { id: "score", label: "AI Scored", description: "Gemini screening with explainable results" },
  { id: "review", label: "Recruiter Review", description: "Ranked shortlist with strengths and gaps" },
  { id: "email", label: "Emails Sent", description: "Shortlist and rejection notifications" },
] as const;

type HiringWorkflowTimelineProps = {
  activeStep?: number;
  className?: string;
};

export function HiringWorkflowTimeline({
  activeStep = 3,
  className,
}: HiringWorkflowTimelineProps) {
  return (
    <div className={cn("rounded-card border border-border bg-card p-5 shadow-card", className)}>
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">Hiring Workflow</p>
        <h3 className="mt-1 text-lg font-bold text-text-primary">Sub0-powered pipeline</h3>
        <p className="mt-1 text-sm text-text-muted">
          From messy applicant data to queryable, explainable hiring decisions.
        </p>
      </div>

      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {STEPS.map((step, index) => {
          const done = index < activeStep;
          const active = index === activeStep;

          return (
            <li
              key={step.id}
              className={cn(
                "flex items-start gap-3 rounded-input border px-3 py-3 transition-colors",
                done
                  ? "border-success/30 bg-success/5"
                  : active
                    ? "border-accent/40 bg-accent/5"
                    : "border-border bg-bg",
              )}
            >
              <div className="mt-0.5 shrink-0">
                {done ? (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                ) : active ? (
                  <CircleDot className="h-5 w-5 text-accent" />
                ) : (
                  <Circle className="h-5 w-5 text-text-muted" />
                )}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-text-primary">{step.label}</div>
                <div className="mt-0.5 text-xs leading-relaxed text-text-muted">
                  {step.description}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
