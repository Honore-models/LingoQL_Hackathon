import axios, { type AxiosInstance } from 'axios';
import {
  mockCandidates,
  mockCandidateScores,
  mockDashboardStats,
  mockJobs,
} from '@/lib/mockData';
import type {
  Candidate,
  CandidateScore,
  DashboardStats,
  Job,
  ScreeningAnalysis,
  ScreeningCandidateAnalysis,
} from '@/types';
import { dashboardStatsSchema } from '@/types';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'mock://local';

export const api: AxiosInstance = axios.create({
  baseURL,
  timeout: 15000,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

type MockResponse<T> = { data: T };

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  isVerified?: boolean;
  createdAtISO?: string;
  updatedAtISO?: string;
};

export type DashboardOverview = {
  applicants: Candidate[];
  jobs: Job[];
  stats: DashboardStats;
};

export type LoginPayload = {
  user_email: string;
  user_pass: string;
};

export type SignupPayload = {
  user_name: string;
  user_email: string;
  user_pass: string;
  user_pass_conf: string;
  company_name?: string;
};

export type CompleteJobPayload = {
  reqBody: {
    job_title: string;
    job_department: string;
    job_location: string;
    job_employment_type: string;
    job_salary_min?: number;
    job_salary_max?: number;
    job_experience_required: string;
    job_description: string;
    job_responsibilities: string;
    job_qualifications: string;
    job_shortlist_size: 10 | 20;
    job_ai_criteria: Array<{
      criteria_string: string;
      description: string;
      priority: string;
    }>;
    workers_required: number;
    job_state?: string;
  };
};

export type RegisterCandidateInput = {
  applicant_name: string;
  job_title: string;
  skills: string[] | string;
  education_certificates: string[] | string;
  additional_info?: string[] | string;
  experience_in_years: number;
};

type LoginResponse = {
  success: string;
  user?: AuthUser;
};

type SignupResponse = {
  success: string;
  verificationRequired?: boolean;
  user?: AuthUser;
  devOtpToken?: string;
};

type ConfirmResponse = {
  success: string;
  user?: AuthUser;
};

type ForgotPasswordResponse = {
  success: string;
  devResetToken?: string;
};

type VerifyResetCodeResponse = {
  success: string;
};

type ResetPasswordResponse = {
  success: string;
};

type LogoutResponse = {
  success: string;
};

type CompleteJobResponse = {
  success: string;
  job?: Job;
};

type DashboardResponse = DashboardOverview;
type JobsResponse = { jobs: Job[] };
type JobResponse = { job: Job };
type CandidatesResponse = { candidates: Candidate[] };
type CandidateResponse = { candidate: Candidate };
type CurrentUserResponse = { user: AuthUser };
type RegisterCandidatesResponse = {
  success: string;
  createdCount: number;
  skippedCount: number;
  applicants: Candidate[];
};

type ResumeUploadResponse = {
  success: string;
  uploadedCount: number;
  applicants: string[];
};

type ScreeningRunApiResult = {
  applicant_id?: string;
  applicant_name?: string;
  match_score?: number;
  strengths?: string[];
  gaps?: string[];
  recommendation?: string;
};

type LegacyScreeningRunApiResult = {
  applicant_id?: string;
  applicant_name?: string;
  applicant_marks?: number;
  applicant_specification_relevance?: {
    skills_relevance?: number;
    education_relevance?: number;
  };
  applicant_result_description?: string;
};

type ScreeningRunResponse = {
  runId?: string;
  jobTitle?: string;
  verdict?: string;
  results?: ScreeningRunApiResult[];
};

type LegacyScreeningRunResponse = {
  success: {
    job_title?: string;
    applicants_details?: LegacyScreeningRunApiResult[];
    result_verdict?: string;
  };
};

const SCREENING_STORAGE_PREFIX = 'talvo-screening:';

function normalizeCandidateList(value: string[] | string | undefined) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.map((item) => item.trim()).filter(Boolean);
  }

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildMockCandidate(
  input: RegisterCandidateInput,
  index: number
): Candidate {
  const createdAtISO = new Date().toISOString();
  const additionalInfo = normalizeCandidateList(input.additional_info);
  const email = additionalInfo.find((item) => /\S+@\S+\.\S+/.test(item));
  const linkedIn = additionalInfo.find((item) =>
    item.toLowerCase().includes('linkedin')
  );

  return {
    id: `mock-candidate-${Date.now()}-${index}`,
    name: input.applicant_name,
    currentTitle: input.job_title,
    location: 'Location not provided',
    yearsExperience: input.experience_in_years,
    email,
    linkedIn,
    shortlisted: false,
    appliedJobTitle: input.job_title,
    createdAtISO,
    updatedAtISO: createdAtISO,
    skills: {
      technical: normalizeCandidateList(input.skills),
      soft: additionalInfo.filter(
        (item) => item !== email && item !== linkedIn
      ),
    },
    education: normalizeCandidateList(input.education_certificates),
    workHistory: [],
  };
}

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

function clampPercentage(value: unknown) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(numericValue)));
}

function screeningStorageKey(jobId: string) {
  return `${SCREENING_STORAGE_PREFIX}${jobId}`;
}

function buildMockScreeningAnalysis(jobId: string): ScreeningAnalysis {
  const job = mockJobs.find((item) => item.id === jobId);

  return {
    jobId,
    jobTitle: job?.title ?? 'Candidate screening',
    verdict: 'Top candidates shortlisted based on the mock screening dataset.',
    generatedAtISO: new Date().toISOString(),
    applicants: mockCandidateScores
      .filter((item) => item.jobId === jobId)
      .map((item) => ({
        candidateId: item.candidateId,
        candidateName:
          mockCandidates.find((candidate) => candidate.id === item.candidateId)
            ?.name ?? 'Candidate',
        score: item.score,
        skillsMatchPct: item.skillsMatchPct,
        educationPct: item.educationPct,
        reasoning: item.reasoning,
      })),
  };
}

function normalizeScreeningApplicant(
  applicant: LegacyScreeningRunApiResult
): ScreeningCandidateAnalysis {
  return {
    candidateId: applicant.applicant_id?.trim() || undefined,
    candidateName: applicant.applicant_name?.trim() || 'Unnamed candidate',
    score: clampPercentage(applicant.applicant_marks),
    skillsMatchPct: clampPercentage(
      applicant.applicant_specification_relevance?.skills_relevance
    ),
    educationPct: clampPercentage(
      applicant.applicant_specification_relevance?.education_relevance
    ),
    reasoning:
      applicant.applicant_result_description?.trim() ||
      'Screening summary unavailable.',
  };
}

function normalizeAiRunApplicant(
  applicant: ScreeningRunApiResult
): ScreeningCandidateAnalysis {
  return {
    candidateId: applicant.applicant_id?.trim() || undefined,
    candidateName: applicant.applicant_name?.trim() || 'Candidate',
    score: clampPercentage(applicant.match_score),
    skillsMatchPct: clampPercentage(applicant.match_score),
    educationPct: 0,
    reasoning:
      applicant.recommendation?.trim() ||
      [...(applicant.strengths ?? []), ...(applicant.gaps ?? [])].join(' ') ||
      'Screening summary unavailable.',
  };
}

export function storeScreeningAnalysis(analysis: ScreeningAnalysis) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(
    screeningStorageKey(analysis.jobId),
    JSON.stringify(analysis)
  );
}

export function getStoredScreeningAnalysis(
  jobId: string
): ScreeningAnalysis | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawValue = window.localStorage.getItem(screeningStorageKey(jobId));
  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as ScreeningAnalysis;
    if (!parsed || !Array.isArray(parsed.applicants)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function getStoredScreeningAnalyses(): ScreeningAnalysis[] {
  if (typeof window === 'undefined') {
    return [];
  }

  return Object.keys(window.localStorage)
    .filter((key) => key.startsWith(SCREENING_STORAGE_PREFIX))
    .map((key) => {
      try {
        return JSON.parse(
          window.localStorage.getItem(key) ?? 'null'
        ) as ScreeningAnalysis | null;
      } catch {
        return null;
      }
    })
    .filter((analysis): analysis is ScreeningAnalysis =>
      Boolean(analysis && Array.isArray(analysis.applicants))
    )
    .sort((left, right) => {
      return (
        new Date(right.generatedAtISO).getTime() -
        new Date(left.generatedAtISO).getTime()
      );
    });
}

export function findStoredCandidateScreening(candidate: Candidate) {
  const candidateName = candidate.name.trim().toLowerCase();

  for (const analysis of getStoredScreeningAnalyses()) {
    const match = analysis.applicants.find((applicant) => {
      const idsMatch = applicant.candidateId?.trim() === candidate.id;
      const namesMatch =
        applicant.candidateName.trim().toLowerCase() === candidateName;
      return idsMatch || namesMatch;
    });

    if (match) {
      return { analysis, result: match };
    }
  }

  return null;
}

async function mockGet<T>(path: string): Promise<MockResponse<T>> {
  await sleep(450);

  const dashboardPayload: DashboardOverview = {
    applicants: mockCandidates,
    jobs: mockJobs,
    stats: mockDashboardStats,
  };

  if (path === '/dashboard') {
    return { data: dashboardPayload as unknown as T };
  }

  if (path === '/jobs') {
    return { data: { jobs: mockJobs } as unknown as T };
  }

  if (path.startsWith('/jobs/')) {
    const id = path.split('/')[2] ?? '';
    const job = mockJobs.find((item) => item.id === id);
    if (!job) throw new Error('Job not found');
    return { data: { job } as unknown as T };
  }

  if (path === '/candidates') {
    return { data: { candidates: mockCandidates } as unknown as T };
  }

  if (path.startsWith('/candidates/')) {
    const id = path.split('/')[2] ?? '';
    const candidate = mockCandidates.find((item) => item.id === id);
    if (!candidate) throw new Error('Candidate not found');
    return { data: { candidate } as unknown as T };
  }

  if (path === '/auth/me') {
    return {
      data: {
        user: {
          id: 'demo-user',
          name: 'A. Recruiter',
          email: 'recruiter@talvo.dev',
          isVerified: true,
        },
      } as unknown as T,
    };
  }

  throw new Error(`No mock handler for GET ${path}`);
}

export function isMockMode() {
  return baseURL.startsWith('mock://');
}

export function getApiErrorMessage(
  error: unknown,
  fallback = 'Something went wrong'
) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;

    if (typeof data === 'string' && data.trim()) {
      return data;
    }

    if (data && typeof data === 'object') {
      const knownKeys = [
        'message',
        'success',
        'input_error',
        'auth_error',
        'data_error',
        'server_error',
        'error',
      ] as const;

      for (const key of knownKeys) {
        const value = (data as Record<string, unknown>)[key];
        if (typeof value === 'string' && value.trim()) {
          return value;
        }
      }
    }

    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export async function getDashboardOverview(): Promise<DashboardOverview> {
  if (isMockMode()) {
    const response = await mockGet<DashboardResponse>('/dashboard');
    return {
      applicants: response.data.applicants,
      jobs: response.data.jobs,
      stats: dashboardStatsSchema.parse(response.data.stats),
    };
  }

  const response = await api.get<DashboardResponse>('/dashboard');
  return {
    applicants: response.data.applicants,
    jobs: response.data.jobs,
    stats: dashboardStatsSchema.parse(response.data.stats),
  };
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const overview = await getDashboardOverview();
  return overview.stats;
}

export async function getJobs(): Promise<Job[]> {
  if (isMockMode()) {
    const response = await mockGet<JobsResponse>('/jobs');
    return response.data.jobs;
  }

  const response = await api.get<JobsResponse>('/jobs');
  return response.data.jobs;
}

export async function getJob(id: string): Promise<Job> {
  if (isMockMode()) {
    const response = await mockGet<JobResponse>(`/jobs/${id}`);
    return response.data.job;
  }

  const response = await api.get<JobResponse>(`/jobs/${id}`);
  return response.data.job;
}

export async function getCandidates(): Promise<Candidate[]> {
  if (isMockMode()) {
    const response = await mockGet<CandidatesResponse>('/candidates');
    return response.data.candidates;
  }

  const response = await api.get<CandidatesResponse>('/candidates');
  return response.data.candidates;
}

export async function getCandidate(id: string): Promise<Candidate> {
  if (isMockMode()) {
    const response = await mockGet<CandidateResponse>(`/candidates/${id}`);
    return response.data.candidate;
  }

  const response = await api.get<CandidateResponse>(`/candidates/${id}`);
  return response.data.candidate;
}

export async function getScreeningResults(
  jobId: string
): Promise<CandidateScore[]> {
  if (isMockMode()) {
    const _jobId = jobId;
    return mockCandidateScores.filter((item) => item.jobId === _jobId);
  }

  const analysis = getStoredScreeningAnalysis(jobId);
  if (!analysis) {
    return [];
  }

  return analysis.applicants.map((applicant) => ({
    candidateId: applicant.candidateId || applicant.candidateName,
    jobId,
    score: applicant.score,
    skillsMatchPct: applicant.skillsMatchPct,
    experiencePct: applicant.score,
    educationPct: applicant.educationPct,
    overallRelevancePct: applicant.score,
    reasoning: applicant.reasoning,
    strengths:
      applicant.skillsMatchPct > 0
        ? [`Skills relevance ${applicant.skillsMatchPct}%`]
        : [],
    gaps:
      applicant.educationPct < 60
        ? ['Education relevance needs follow-up']
        : [],
    screenedAtISO: analysis.generatedAtISO,
  }));
}

export async function getCurrentUser(): Promise<AuthUser> {
  if (isMockMode()) {
    const response = await mockGet<CurrentUserResponse>('/auth/me');
    return response.data.user;
  }

  const response = await api.get<CurrentUserResponse>('/auth/me');
  return response.data.user;
}

export async function loginUser(payload: LoginPayload): Promise<LoginResponse> {
  if (isMockMode()) {
    await sleep(350);
    return {
      success: 'Login successful',
      user: {
        id: 'demo-user',
        name: 'A. Recruiter',
        email: payload.user_email,
        isVerified: true,
      },
    };
  }

  const response = await api.post<LoginResponse>('/auth/login', payload);
  return response.data;
}

export async function signupUser(
  payload: SignupPayload
): Promise<SignupResponse> {
  if (isMockMode()) {
    await sleep(450);
    return {
      success: 'Signup successful',
      verificationRequired: true,
      devOtpToken: '123456',
      user: {
        id: 'demo-user',
        name: payload.user_name,
        email: payload.user_email,
        isVerified: false,
      },
    };
  }

  const response = await api.post<SignupResponse>('/auth/signup', payload);
  return response.data;
}

export async function confirmSignup(token: string): Promise<ConfirmResponse> {
  if (isMockMode()) {
    await sleep(350);
    return {
      success: 'Account verified successfully',
      user: {
        id: 'demo-user',
        name: 'A. Recruiter',
        email: 'recruiter@talvo.dev',
        isVerified: true,
      },
    };
  }

  const response = await api.post<ConfirmResponse>('/auth/confirm', { token });
  return response.data;
}

export async function forgotPassword(
  user_email: string
): Promise<ForgotPasswordResponse> {
  if (isMockMode()) {
    await sleep(450);
    return {
      success: 'Reset code generated successfully',
      devResetToken: '123456',
    };
  }

  const response = await api.post<ForgotPasswordResponse>('/auth/forgot', {
    user_email,
  });
  return response.data;
}

export async function verifyResetCode(
  token: string
): Promise<VerifyResetCodeResponse> {
  if (isMockMode()) {
    await sleep(350);
    return { success: 'Token verification successful' };
  }

  const response = await api.post<VerifyResetCodeResponse>('/auth/verify', {
    token,
  });
  return response.data;
}

export async function resetPassword(payload: {
  user_pass: string;
  user_pass_conf: string;
}): Promise<ResetPasswordResponse> {
  if (isMockMode()) {
    await sleep(350);
    return { success: 'Password reset successful' };
  }

  const response = await api.post<ResetPasswordResponse>(
    '/auth/reset',
    payload
  );
  return response.data;
}

export async function logoutUser(): Promise<LogoutResponse> {
  if (isMockMode()) {
    return { success: 'Logged out successfully' };
  }

  const response = await api.post<LogoutResponse>('/auth/logout');
  return response.data;
}

export async function createJob(
  payload: CompleteJobPayload
): Promise<CompleteJobResponse> {
  if (isMockMode()) {
    await sleep(500);
    const createdAtISO = new Date().toISOString();
    return {
      success: 'Job created successfully',
      job: {
        id: `mock-job-${Date.now()}`,
        title: payload.reqBody.job_title,
        department: payload.reqBody.job_department,
        location: payload.reqBody.job_location,
        employmentType: payload.reqBody.job_employment_type,
        experienceLevel: payload.reqBody.job_experience_required,
        salaryMin: payload.reqBody.job_salary_min,
        salaryMax: payload.reqBody.job_salary_max,
        description: payload.reqBody.job_description,
        responsibilities: payload.reqBody.job_responsibilities,
        qualifications: payload.reqBody.job_qualifications,
        aiCriteria: {
          mustHaveSkills: payload.reqBody.job_ai_criteria
            .filter((item) => item.priority.toLowerCase().includes('must'))
            .map((item) => item.criteria_string)
            .join(', '),
          niceToHaveSkills: payload.reqBody.job_ai_criteria
            .filter((item) => !item.priority.toLowerCase().includes('must'))
            .map((item) => item.criteria_string)
            .join(', '),
          screeningQuestions: payload.reqBody.job_description,
          dealBreakers: '',
          shortlistSize: payload.reqBody.job_shortlist_size,
        },
        status: 'Active',
        applicantsCount: 0,
        shortlistedCount: 0,
        updatedAtISO: createdAtISO,
      },
    };
  }

  const response = await api.post<CompleteJobResponse>(
    '/complete-job',
    {
      reqBody: {
        ...payload.reqBody,
        job_requirements: payload.reqBody.job_description,
        job_skills: payload.reqBody.job_ai_criteria.map(
          (criterion) => criterion.criteria_string
        ),
        job_qualifications: payload.reqBody.job_qualifications,
        job_notes: [
          payload.reqBody.job_responsibilities,
          ...payload.reqBody.job_ai_criteria.map(
            (criterion) => `${criterion.priority}: ${criterion.description}`
          ),
        ],
      },
    }
  );
  return response.data;
}

export async function uploadCandidatesFile(
  file: File
): Promise<RegisterCandidatesResponse> {
  if (isMockMode()) {
    await sleep(450);
    return {
      success: 'Applicants processed successfully',
      createdCount: 0,
      skippedCount: 0,
      applicants: mockCandidates,
    };
  }

  const formData = new FormData();
  formData.append('applicants_spreadsheet', file);

  const response = await api.post<RegisterCandidatesResponse>(
    '/register-candidate',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
}

export async function uploadResumeZip(
  file: File
): Promise<ResumeUploadResponse> {
  if (isMockMode()) {
    await sleep(450);
    return {
      success: 'Successfully uploaded resume PDFs',
      uploadedCount: 1,
      applicants: ['Mock Applicant'],
    };
  }

  const formData = new FormData();
  formData.append('resume_pdf_zip', file);

  const response = await api.post<ResumeUploadResponse>('/register-candidate', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}

export async function registerCandidates(
  applicants: RegisterCandidateInput[]
): Promise<RegisterCandidatesResponse> {
  if (isMockMode()) {
    await sleep(450);
    return {
      success: 'Applicants processed successfully',
      createdCount: applicants.length,
      skippedCount: 0,
      applicants: applicants.map(buildMockCandidate),
    };
  }

  const response = await api.post<RegisterCandidatesResponse>(
    '/register-candidate',
    { raw_application_data: JSON.stringify(applicants) },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data;
}

export async function runScreening(
  jobId: string,
  jobTitle: string
): Promise<ScreeningAnalysis> {
  if (isMockMode()) {
    const analysis = buildMockScreeningAnalysis(jobId);
    storeScreeningAnalysis(analysis);
    return analysis;
  }

  const response = await api.post<ScreeningRunResponse | LegacyScreeningRunResponse>(
    '/ai/run',
    { job_id: jobId, topK: 10 }
  );
  if ('success' in response.data) {
    const result = response.data.success;
    const legacyAnalysis: ScreeningAnalysis = {
      jobId,
      jobTitle: result.job_title?.trim() || jobTitle,
      verdict:
        result.result_verdict?.trim() || 'Screening completed successfully',
      generatedAtISO: new Date().toISOString(),
      applicants: (result.applicants_details ?? []).map(
        normalizeScreeningApplicant
      ),
    };

    storeScreeningAnalysis(legacyAnalysis);
    return legacyAnalysis;
  }

  const result = response.data;
  const analysis: ScreeningAnalysis = {
    jobId,
    jobTitle: result.jobTitle?.trim() || jobTitle,
    verdict: result.verdict?.trim() || 'Screening completed successfully',
    generatedAtISO: new Date().toISOString(),
    applicants: (result.results ?? []).map(normalizeAiRunApplicant),
  };

  storeScreeningAnalysis(analysis);
  return analysis;
}
