import type { Request, Response } from "express";
import Applicant from "../models/Applicant.js";
import Job from "../models/Job.js";
import { ScreeningResultModel } from "../models/ScreenResult.js";
import debug from "debug";

const controlDebug = debug("app:controller");

function asArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string" && value.trim()) return [value.trim()];
  return [];
}

export function toFrontendJob(job: any, applicantsCount = 0, shortlistedCount = 0) {
  return {
    id: String(job._id),
    title: job.job_title,
    department: job.job_department,
    location: job.job_location,
    employmentType: job.job_employment_type,
    experienceLevel: `${job.job_experience ?? 0}+ years`,
    description: asArray(job.job_requirements).join("\n"),
    responsibilities: asArray(job.job_notes).join("\n"),
    qualifications: asArray(job.job_qualifications).join("\n"),
    aiCriteria: {
      mustHaveSkills: asArray(job.job_skills).join(", "),
      niceToHaveSkills: "",
      screeningQuestions: "",
      dealBreakers: "",
      shortlistSize: 10,
    },
    status: "Active",
    applicantsCount,
    shortlistedCount,
    updatedAtISO: job.updatedAt?.toISOString?.() ?? new Date().toISOString(),
  };
}

export function toFrontendCandidate(applicant: any) {
  const skills = Array.isArray(applicant.skills) ? applicant.skills : [];
  const education = Array.isArray(applicant.education) ? applicant.education : [];
  const experience = Array.isArray(applicant.experience) ? applicant.experience : [];

  return {
    id: String(applicant._id),
    name: `${applicant.first_name ?? ""} ${applicant.last_name ?? ""}`.trim(),
    currentTitle: applicant.headline || applicant.job_title,
    location: applicant.location || "Not provided",
    yearsExperience: Math.max(
      0,
      ...experience.map((item: any) => Number(item.years_of_experience ?? 0)),
      ...skills.map((item: any) => Number(item.years_of_experience ?? 0)),
    ),
    email: applicant.email,
    linkedIn: applicant.social_links?.linked_in,
    shortlisted: applicant.applicant_state === "Shortlisted",
    appliedJobTitle: applicant.job_title,
    createdAtISO: applicant.createdAt?.toISOString?.(),
    updatedAtISO: applicant.updatedAt?.toISOString?.(),
    skills: {
      technical: skills.map((item: any) => String(item.name ?? item)).filter(Boolean),
      soft: [],
    },
    education: education
      .map((item: any) => String(item.degree ?? item.institution ?? item))
      .filter(Boolean),
    workHistory: experience.map((item: any) => ({
      role: String(item.role ?? ""),
      company: String(item.company ?? ""),
      startISO: String(item.start_date ?? ""),
      endISO: item.end_date ? String(item.end_date) : undefined,
      highlights: Array.isArray(item.technologies) ? item.technologies.map(String) : [],
    })),
  };
}

export const listJobs = async (_req: Request, res: Response) => {
  const jobs = await Job.find().sort({ createdAt: -1 }).lean();
  const applicants = await Applicant.find().lean();
  const results = await ScreeningResultModel.find().lean();
  res.json({
    jobs: jobs.map((job: any) =>
      toFrontendJob(
        job,
        applicants.filter((applicant: any) => applicant.job_title === job.job_title).length,
        results.filter((result: any) => String(result.job_id) === String(job._id)).length,
      ),
    ),
  });
};

export const getJob = async (req: Request, res: Response) => {
  const job = await Job.findById(req.params.id).lean();
  if (!job) return res.status(404).json({ data_error: "Job not found" });
  const applicantsCount = await Applicant.countDocuments({ job_title: (job as any).job_title });
  const shortlistedCount = await ScreeningResultModel.countDocuments({
    job_id: String(req.params.id),
  } as any);
  return res.json({ job: toFrontendJob(job, applicantsCount, shortlistedCount) });
};

export const listCandidates = async (_req: Request, res: Response) => {
  const applicants = await Applicant.find().sort({ createdAt: -1 }).lean();
  res.json({ candidates: applicants.map(toFrontendCandidate) });
};

export const getCandidate = async (req: Request, res: Response) => {
  const applicant = await Applicant.findById(req.params.id).lean();
  if (!applicant) return res.status(404).json({ data_error: "Candidate not found" });
  return res.json({ candidate: toFrontendCandidate(applicant) });
};

const dashBoardControl = async (_req: Request, res: Response) => {
  try {
    const applicants = await Applicant.find().lean();
    const jobs = await Job.find().lean();
    const shortlisted = applicants.filter(
      (applicant: any) => applicant.applicant_state === "Shortlisted",
    ).length;

    res.status(200).json({
      applicants: applicants.map(toFrontendCandidate),
      jobs: jobs.map((job: any) =>
        toFrontendJob(
          job,
          applicants.filter((applicant: any) => applicant.job_title === job.job_title).length,
          shortlisted,
        ),
      ),
      stats: {
        activeJobs: {
          value: jobs.length,
          trend: { label: "ready for screening", value: `${jobs.length}`, direction: "neutral" },
        },
        totalApplicants: {
          value: applicants.length,
          trend: { label: "imported profiles", value: `${applicants.length}`, direction: "up" },
        },
        shortlisted: {
          value: shortlisted,
          conversionRatePct: applicants.length ? Math.round((shortlisted / applicants.length) * 100) : 0,
          trend: { label: "review queue", value: `${shortlisted}`, direction: "neutral" },
        },
        inScreening: {
          value: applicants.filter((applicant: any) => applicant.applicant_state === "Queued").length,
          avgTimePerCandidateMins: 2,
          trend: { label: "AI workflow", value: "2 min", direction: "down" },
        },
      },
    });
  } catch (error) {
    controlDebug(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default dashBoardControl;
