# Talvo

**Sub0-powered talent intelligence** for the Zero to Query: LingoQL Hackathon.

Talvo turns messy applicant spreadsheets and resumes into structured, queryable candidate profiles, runs explainable AI screening, and gives recruiters a natural-language shortlist workflow.

> **Pitch:** Talvo is a Sub0-powered talent intelligence workflow that turns messy applicant data into queryable, explainable hiring decisions.

## Problem

Recruiters receive unstructured applicant data (spreadsheets, PDFs, emails) and struggle to screen consistently, explain decisions, and query talent pools without manual spreadsheet work.

## Solution

Talvo provides an end-to-end recruiter workflow:

1. Create a job with AI screening criteria
2. Ingest applicants from spreadsheets or resume uploads
3. Run Gemini-powered screening with strengths, gaps, and recommendations
4. Query talent data in natural language ("Show backend candidates with PostgreSQL and 3+ years")
5. Review ranked shortlists and move candidates forward

## Architecture: LingoQL + Sub0 + Express

Talvo uses **three layers** — not just frontend hosting:

```
┌─────────────────────┐
│  Next.js Frontend   │  Deployed on LingoQL (Vercel-style)
│  (this repo/frontend)│
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  Sub0               │  Production backend: models, CRUD, queries, audit
│  users, jobs,       │  See sub0/ for JSON schema + API specs
│  applicants,        │
│  screening_*        │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  Express AI Worker  │  Gemini screening + NL talent queries
│  (this repo/backend)│  Reads/writes Sub0; MongoDB for local dev only
└─────────────────────┘
```

| Component | Role | Hackathon requirement |
|-----------|------|----------------------|
| **LingoQL** | Hosts Next.js frontend | Deployment platform |
| **Sub0** | Backend data + API layer | **Required for technical score** |
| **Express + Gemini** | AI worker for screening and recruiter assistant | Bridge when Sub0 does not host long-running AI jobs |
| **MongoDB** | Local dev fallback mirroring Sub0 schemas | Demo reliability when Sub0 credentials unavailable |

### How Sub0 powers Talvo

Sub0 owns all core backend functionality:

- **Models:** `users`, `jobs`, `applicants`, `resumes`, `screening_runs`, `screening_results`, `audit_events`
- **APIs:** dashboard, job creation, applicant import, screening lifecycle, talent query
- **Specs:** documented in [`sub0/`](./sub0/) with JSON schemas and Express route mappings

The Express service maps to Sub0 today for local development and acts as the **Gemini AI worker** in production:

| Express route (local) | Sub0 API (production) | Notes |
|-----------------------|----------------------|-------|
| `GET /dashboard` | `GET /dashboard` | Sub0 aggregates stats |
| `POST /complete-job` | `POST /jobs` | Job CRUD in Sub0 |
| `POST /register-candidate` | `POST /applicants/import` | Normalized intake |
| `POST /ai/run` | `POST /screening-runs` | Worker writes results to Sub0 |
| `POST /ai/ask` | `POST /talent-query` | NL queries over Sub0 data |

See [SUB0_PLAN.md](./SUB0_PLAN.md) and [sub0/README.md](./sub0/README.md) for full migration plan.

## Tech Stack

- **Frontend:** Next.js 16, TypeScript, Tailwind CSS, React Query, Redux Toolkit
- **Sub0:** Production models and APIs (see `sub0/`)
- **AI Worker:** Express 5, TypeScript, Gemini (Google AI)
- **Local dev DB:** MongoDB/Mongoose (mirrors Sub0 schemas)
- **Deployment:** Frontend on LingoQL; backend data on Sub0

## Required API Keys

### Required

| Key | Purpose |
|-----|---------|
| `MONGO_URI` | Local dev database (mirrors Sub0 schemas) |
| `ACCESS_SECRET` | JWT access token signing |
| `REFRESH_SECRET` | JWT refresh token signing |
| `GOOGLE_API_KEY` | Gemini AI screening and talent queries |
| `GOOGLE_AI_MODEL` | e.g. `gemini-1.5-flash` |

### Optional

| Key | Purpose |
|-----|---------|
| `CLOUDINARY_API_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Resume ZIP storage |
| `USER_EMAIL`, `USER_PASS` | SMTP for real emails (without these, signup returns `devOtpToken`) |
| Sub0 / LingoQL credentials | Production deployment |

## Deployment

### Docker (local / demo server)

```bash
copy backend\.env.example backend\.env
# Edit backend\.env with MONGO_URI, secrets, and optional GOOGLE_API_KEY

docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API docs: http://localhost:5000/docs

### LingoQL + Sub0 (production)

1. **Sub0** — Create models from `sub0/models/` and APIs from `sub0/apis/`
2. **Express worker** — Deploy `backend/` with `GOOGLE_API_KEY`; wire Sub0 webhooks for `/ai/run` and `/ai/ask`
3. **LingoQL** — Deploy `frontend/` with `NEXT_PUBLIC_API_URL` pointing to your Sub0 API base URL
4. **Judging fallback** — Deploy frontend without `NEXT_PUBLIC_API_URL` to enable mock mode

## Local Setup

```bash
npm run install:all
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
npm run build
```

**Mock mode:** Leave `NEXT_PUBLIC_API_URL` unset in `frontend/.env` — the app runs with local mock data (reliable for judging).

**Live API mode:** Set `NEXT_PUBLIC_API_URL=http://localhost:5000` (Express worker URL).

Run services separately:

```bash
npm run dev:backend
npm run dev:frontend
```

## Demo Flow (for judges)

1. **Landing** — "Sub0-powered talent intelligence" positioning
2. **Register/Login** — dev OTP returned if SMTP not configured
3. **Dashboard** — hiring workflow timeline, stats, recent jobs
4. **Create Job** — multi-step builder with AI criteria
5. **Import Candidates** — spreadsheet or manual entry
6. **Run AI Screening** — progress animation, then ranked results with strengths/gaps
7. **Query Talent** — natural-language search over candidate pool
8. **Architecture slide** — LingoQL hosts frontend, Sub0 owns data/APIs, Express runs Gemini

## Screenshots

<!-- Add screenshots before submission -->
| Screen | Path |
|--------|------|
| Landing | `docs/screenshots/landing.png` |
| Dashboard | `docs/screenshots/dashboard.png` |
| Screening Results | `docs/screenshots/screening-results.png` |
| Query Talent | `docs/screenshots/talent-query.png` |
| Sub0 Models | `docs/screenshots/sub0-models.png` |

## Submission Checklist

- [ ] Frontend deployed on LingoQL with live URL
- [ ] Sub0 models created (`sub0/models/*.json`)
- [ ] Sub0 APIs wired (`sub0/apis/*.json`)
- [ ] Express AI worker connected to Sub0 for screening
- [ ] Demo video shows full recruiter workflow
- [ ] README explains LingoQL vs Sub0 roles clearly
- [ ] Mock mode works without API keys
- [ ] Screenshots added to `docs/screenshots/`

## Hackathon Scoring Alignment

| Criterion | How Talvo addresses it |
|-----------|----------------------|
| Innovation (25%) | NL talent queries + explainable AI screening |
| Technical (30%) | Sub0 backend models/APIs + Gemini worker + LingoQL deploy |
| Practical utility (25%) | Full recruiter workflow from intake to shortlist |
| Presentation (20%) | Clear demo path, workflow timeline, architecture story |

## Further Reading

- [SUB0_PLAN.md](./SUB0_PLAN.md) — migration plan and Express mapping
- [sub0/](./sub0/) — Sub0 model and API JSON specs
