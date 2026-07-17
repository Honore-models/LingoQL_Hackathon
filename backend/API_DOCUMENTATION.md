# Talvo API Documentation

Talvo exposes the recruiter workspace API plus Gemini-powered screening routes.

## Authentication

Base path: `/auth`

- `POST /auth/signup` - create a recruiter account. If SMTP is not configured, the response includes `devOtpToken` for local demos.
- `POST /auth/confirm` - verify signup OTP and issue the `access_token` cookie.
- `POST /auth/login` - sign in and issue the `access_token` cookie.
- `GET /auth/me` - return the current authenticated user.
- `POST /auth/forgot` - request password reset.
- `POST /auth/verify` - verify reset OTP.
- `POST /auth/reset` - set a new password.
- `GET /auth/confirm_link/:confirmation_link_id` - verify via email link.

## Recruiter Workspace

Protected by `middleAuth`.

- `GET /dashboard` - normalized dashboard payload for the frontend.
- `GET /jobs` - list jobs.
- `GET /jobs/:id` - get one job.
- `POST /complete-job` - create a job.
- `GET /candidates` - list candidates.
- `GET /candidates/:id` - get one candidate.
- `POST /register-candidate` - register candidates from JSON or multipart form data.
- `POST /shortlist` - update applicant states and trigger emails.
- `POST /sendEmails` - send shortlist/rejection emails.

Multipart fields for `POST /register-candidate`:

- `applicants_spreadsheet`: CSV or XLSX.
- `resume_pdf_zip`: optional ZIP of PDFs.

## AI Screening

Base path: `/ai`

- `GET /ai/models` - list Gemini models.
- `POST /ai/run` - create a screening run for a job.
- `GET /ai/runs` - list screening runs.
- `GET /ai/runs/:runId` - get screening run results.
- `POST /ai/ask` - ask a recruiter question against job/applicant context.
