# Sub0 and LingoQL Implementation Plan

Talvo's production architecture separates **hosting** (LingoQL) from **backend data/APIs** (Sub0). This document explains exactly how each platform is used and how the current Express/Mongo codebase maps to Sub0.

## Target Architecture

```
Recruiter Browser
       │
       ▼
┌──────────────────┐
│ LingoQL          │  Next.js frontend (Vercel-style deploy)
│ app.talvo.dev    │
└────────┬─────────┘
         │ HTTPS
         ▼
┌──────────────────┐
│ Sub0             │  Production backend
│ api.talvo.sub0   │  • users, jobs, applicants, resumes
│                  │  • screening_runs, screening_results
│                  │  • audit_events, talent-query
└────────┬─────────┘
         │ webhook / worker call
         ▼
┌──────────────────┐
│ Express Worker   │  AI bridge (Gemini)
│ worker.talvo     │  • POST /ai/run  → screening
│                  │  • POST /ai/ask  → talent query
└──────────────────┘
```

### LingoQL role

- Deploy and serve the Next.js frontend
- Environment variables for `NEXT_PUBLIC_API_URL` pointing to Sub0 APIs
- **Not** the backend data layer — judges should see Sub0 as the API backend

### Sub0 role (required for technical score)

- Define and host all data models (see `sub0/models/`)
- Expose CRUD and query APIs (see `sub0/apis/`)
- Store screening runs and results
- Log audit events for demo traceability
- Invoke Express worker for Gemini jobs

### Express role (AI worker bridge)

- Long-running Gemini screening (`POST /ai/run`)
- Natural-language talent assistant (`POST /ai/ask`)
- Reads job/applicant context from Sub0
- Writes `screening_results` and audit events back to Sub0
- **Local fallback:** mirrors Sub0 schemas in MongoDB when Sub0 credentials are not configured

## Sub0 Models

Implemented as JSON schema drafts in `sub0/models/`:

| Model | Purpose |
|-------|---------|
| `users` | Recruiter accounts, company, verification |
| `jobs` | Role definitions, skills, qualifications, shortlist size |
| `applicants` | Normalized profiles from spreadsheet/resume intake |
| `resumes` | File URLs, parse status, text hash |
| `screening_runs` | AI job orchestration (queued → completed) |
| `screening_results` | Rank, score, strengths, gaps, recommendation |
| `audit_events` | Immutable action log for compliance demo |

## Sub0 APIs

Documented in `sub0/apis/`:

| API file | Key endpoints |
|----------|---------------|
| `auth.json` | signup, confirm, login, me |
| `dashboard.json` | GET /dashboard |
| `jobs.json` | GET/POST jobs |
| `applicants.json` | GET applicants, POST /applicants/import |
| `screening.json` | POST /screening-runs, GET /screening-runs/:id |
| `talent_query.json` | POST /talent-query |

## Express → Sub0 Route Mapping

| Current Express (local dev) | Sub0 production API | After migration |
|----------------------------|---------------------|-----------------|
| `POST /auth/signup` | Sub0 auth | Frontend → Sub0 |
| `POST /auth/confirm` | Sub0 auth | Frontend → Sub0 |
| `POST /auth/login` | Sub0 auth | Frontend → Sub0 |
| `GET /auth/me` | Sub0 auth | Frontend → Sub0 |
| `GET /dashboard` | `GET /dashboard` | Frontend → Sub0 |
| `GET /jobs` | `GET /jobs` | Frontend → Sub0 |
| `GET /jobs/:id` | `GET /jobs/:id` | Frontend → Sub0 |
| `POST /complete-job` | `POST /jobs` | Frontend → Sub0 |
| `GET /candidates` | `GET /applicants` | Frontend → Sub0 |
| `GET /candidates/:id` | `GET /applicants/:id` | Frontend → Sub0 |
| `POST /register-candidate` | `POST /applicants/import` | Frontend → Sub0 |
| `POST /ai/run` | `POST /screening-runs` | Sub0 → Express worker |
| `GET /ai/runs/:runId` | `GET /screening-runs/:id` | Frontend → Sub0 |
| `POST /ai/ask` | `POST /talent-query` | Sub0 → Express worker |

## Screening Flow (Sub0 + Gemini)

1. Recruiter clicks "Run screening" in frontend
2. Frontend calls Sub0 `POST /screening-runs` with `job_id` and `topK`
3. Sub0 creates `screening_runs` row (status: `queued`)
4. Sub0 invokes Express worker with run ID
5. Worker fetches job + applicants from Sub0
6. Worker calls Gemini (`screenWithGemini`) for explainable ranking
7. Worker writes `screening_results` rows to Sub0
8. Sub0 updates run status to `completed`
9. Frontend polls `GET /screening-runs/:id` and renders results

## Talent Query Flow (Zero to Query)

1. Recruiter types: "Show backend candidates with PostgreSQL and 3+ years"
2. Frontend calls Sub0 `POST /talent-query`
3. Sub0 loads structured applicant data (optionally filtered by `job_id`)
4. Sub0 invokes Express worker with question + context
5. Worker calls Gemini (`assistantWithGemini`)
6. Response: `answer`, `suggestedNextQuestions`, `context`
7. Sub0 logs `audit_events` with action `talent_query.asked`

## Local Fallback Plan

For hackathon judging reliability:

| Mode | Config | Behavior |
|------|--------|----------|
| **Mock** | No `NEXT_PUBLIC_API_URL` | Frontend uses `mockData.ts` — no backend needed |
| **Local API** | `NEXT_PUBLIC_API_URL=http://localhost:3001` | Express + Mongo mirrors Sub0 schemas |
| **Production** | Sub0 credentials + LingoQL deploy | Sub0 APIs + Express worker |

MongoDB schemas in `backend/src/models/` are intentionally aligned with `sub0/models/*.json` so migration is schema-compatible.

## Deployment Checklist

1. [ ] Create Sub0 project and import models from `sub0/models/`
2. [ ] Implement APIs from `sub0/apis/`
3. [ ] Deploy Express worker with `GOOGLE_API_KEY`
4. [ ] Wire Sub0 webhooks to worker for screening and talent query
5. [ ] Deploy frontend on LingoQL with `NEXT_PUBLIC_API_URL` → Sub0
6. [ ] Verify mock mode still works (unset env var)
7. [ ] Capture Sub0 dashboard screenshots for Devpost

## Winning Feature: Query Talent

The hackathon theme is **Zero to Query**. Talvo's differentiator:

- Structured applicant data in Sub0 (not raw spreadsheets)
- Natural-language queries via `POST /talent-query`
- Suggested follow-up questions for recruiter exploration
- Mock mode answers from local data when APIs unavailable

Example queries for demo:

- "Show backend candidates with PostgreSQL and 3+ years."
- "Which candidates have the strongest React experience?"
- "Find shortlisted candidates with weak education match."
