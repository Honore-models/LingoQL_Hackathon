# Talvo Sub0 Backend Specs

Draft specifications for Talvo's **production backend data and API layer** on Sub0, as required for the LingoQL Hackathon technical score.

## Architecture

```
┌─────────────────────┐     ┌──────────────────────────┐     ┌─────────────────┐
│  Next.js Frontend   │────▶│  Sub0 (data + APIs)      │────▶│  Structured     │
│  hosted on LingoQL  │     │  users, jobs, applicants,  │     │  talent data    │
└─────────┬───────────┘     │  screening runs/results    │     └─────────────────┘
          │                 └────────────┬─────────────┘
          │                              │
          │                 ┌────────────▼─────────────┐
          └────────────────▶│  Express AI Worker       │
                            │  Gemini screening + NL Q │
                            └──────────────────────────┘
```

| Layer | Role |
|-------|------|
| **LingoQL** | Hosts the Next.js frontend (Vercel-style deployment). |
| **Sub0** | Production backend: models, CRUD, queries, audit trail. |
| **Express + Gemini** | AI worker bridge for long-running screening and recruiter assistant when Sub0 does not host Gemini jobs directly. |
| **MongoDB (local)** | Development fallback mirroring Sub0 schemas; not the production story. |

## Models

| File | Description |
|------|-------------|
| [models/users.json](./models/users.json) | Recruiter accounts and verification state |
| [models/jobs.json](./models/jobs.json) | Job postings and AI criteria |
| [models/applicants.json](./models/applicants.json) | Normalized candidate profiles |
| [models/resumes.json](./models/resumes.json) | Resume storage and parse status |
| [models/screening_runs.json](./models/screening_runs.json) | AI screening job orchestration |
| [models/screening_results.json](./models/screening_results.json) | Ranked shortlist with explainability |
| [models/audit_events.json](./models/audit_events.json) | Compliance and demo audit trail |

## APIs

| File | Endpoints |
|------|-----------|
| [apis/auth.json](./apis/auth.json) | Signup, confirm, login, session |
| [apis/dashboard.json](./apis/dashboard.json) | Recruiter overview |
| [apis/jobs.json](./apis/jobs.json) | Job CRUD and creation |
| [apis/applicants.json](./apis/applicants.json) | Applicant import and listing |
| [apis/screening.json](./apis/screening.json) | Screening run lifecycle |
| [apis/talent_query.json](./apis/talent_query.json) | Natural-language talent queries |

## Express → Sub0 mapping

| Current Express route | Sub0 target | Express role after migration |
|-----------------------|-------------|------------------------------|
| `POST /auth/*` | Sub0 auth APIs | Deprecated; frontend calls Sub0 |
| `GET /dashboard` | `GET /dashboard` | Deprecated |
| `GET /jobs`, `GET /jobs/:id` | Sub0 jobs APIs | Deprecated |
| `POST /complete-job` | `POST /jobs` | Deprecated |
| `GET /candidates`, `GET /candidates/:id` | Sub0 applicants APIs | Deprecated |
| `POST /register-candidate` | `POST /applicants/import` | Deprecated |
| `POST /ai/run` | `POST /screening-runs` + worker callback | **Keep** as Gemini worker |
| `GET /ai/runs/:runId` | `GET /screening-runs/:id` | Worker writes results to Sub0 |
| `POST /ai/ask` | `POST /talent-query` | Worker reads Sub0, returns NL answer |

## Local fallback

When Sub0 credentials are not configured, the Express/Mongo stack in `backend/` mirrors these schemas so judges can run the full demo locally. Set `NEXT_PUBLIC_API_URL` to the Express worker URL; omit it for frontend mock mode.
