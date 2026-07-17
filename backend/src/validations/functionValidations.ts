import z from "zod";
export const askSchema = z.object({
  job_id: z.string().min(1).optional(),
  applicant_ids: z.array(z.string().min(1)).optional(),
  max_applicants: z.number().int().min(1).max(200).default(50),
  question: z.string().min(1).max(4000),
});
export const geminiOutputSchema = z.object({
  shortlist: z
    .array(
      z.object({
        applicant_id: z.string().min(1).optional(),
        applicantId: z.string().min(1).optional(),
        rank: z.number().int().min(1),
        match_score: z.number().min(0).max(100).optional(),
        matchScore: z.number().min(0).max(100).optional(),
        strengths: z.array(z.string()).default([]),
        gaps: z.array(z.string()).default([]),
        recommendation: z.string().min(1),
      }),
    )
    .min(1)
    .transform((items) =>
      items.map((item) => ({
        applicant_id: item.applicant_id ?? item.applicantId ?? "",
        rank: item.rank,
        match_score: item.match_score ?? item.matchScore ?? 0,
        strengths: item.strengths,
        gaps: item.gaps,
        recommendation: item.recommendation,
      })),
    )
    .pipe(
      z.array(
        z.object({
          applicant_id: z.string().min(1),
          rank: z.number().int().min(1),
          match_score: z.number().min(0).max(100),
          strengths: z.array(z.string()),
          gaps: z.array(z.string()),
          recommendation: z.string().min(1),
        }),
      ),
    ),
});
export const triggerSchema = z.object({
  job_id: z.string().min(1),
  applicant_ids: z.array(z.string().min(1)).optional(),
  topK: z.number().int().min(1).max(50).default(10),
});

export const JobSchema = z.object({
  job_title: z.string(),
  job_department: z.string(),
  job_location: z.string(),
  job_employment_type: z.string(),
  job_requirements: z.union([z.string(), z.array(z.string())]).transform((value) =>
    Array.isArray(value)
      ? value
      : value
          .split(/\n|,|;/g)
          .map((item) => item.trim())
          .filter(Boolean),
  ),
  job_skills: z.array(z.string()),
  job_experience: z.coerce.number().min(0).default(0),
  job_qualifications: z.union([z.string(), z.array(z.string())]).transform((value) =>
    Array.isArray(value)
      ? value
      : value
          .split(/\n|,|;/g)
          .map((item) => item.trim())
          .filter(Boolean),
  ),
  workers_required: z.number(),
  job_notes: z.array(z.string()),
});
export const shortListSchema = z.object({
  shortList_applicants: z.string(),
});
export type Job_ = z.infer<typeof JobSchema>;
