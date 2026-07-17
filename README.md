# Talvo

Talvo is a recruiter-facing talent intelligence workspace for the Zero to Query: LingoQL Hackathon. It turns messy applicant spreadsheets and resumes into structured candidate profiles, runs explainable AI screening, and gives recruiters a queryable shortlist workflow.

## Hackathon Positioning

- **Innovation:** natural-language talent intelligence plus explainable AI screening, not just resume ranking.
- **Technical implementation:** Next.js frontend, Express/Gemini worker, MongoDB today, and a Sub0-ready backend model/API plan for deployment on LingoQL infrastructure.
- **Practical utility:** recruiters can create a job, ingest candidates, run AI scoring, review strengths/gaps, and move candidates to shortlist/reject decisions.
- **Presentation:** demo path is designed around one clear recruiter journey.

## Current Stack

- Frontend: Next.js, TypeScript, Tailwind CSS, React Query, Redux Toolkit.
- Backend: Express, TypeScript, MongoDB/Mongoose, Gemini, Cloudinary optional resume storage.
- Deployment target: frontend on LingoQL; backend data/API layer through Sub0, with the existing Node service retained as the AI worker if needed.

## Required Keys

Minimum for local non-AI flows:

- `MONGO_URI`
- `ACCESS_SECRET`
- `REFRESH_SECRET`

Needed for AI screening:

- `GOOGLE_API_KEY`
- `GOOGLE_AI_MODEL` such as `gemini-1.5-flash`

Optional:

- `CLOUDINARY_API_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` for resume ZIP storage.
- `USER_EMAIL`, `USER_PASS` for real email. Without these, signup returns `devOtpToken` so the demo can continue.
- LingoQL/Sub0 deployment credentials once you create the project.

## Local Setup

```bash
npm run install:all
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
npm run build:backend
```

Run locally:

```bash
docker compose up --build
```

Or run services separately:

```bash
npm run dev:backend
npm run dev:frontend
```

## Demo Flow

1. Create an account. If SMTP is not configured, the backend returns a dev OTP automatically.
2. Create a job from the dashboard.
3. Upload or manually register candidates.
4. Run AI screening.
5. Review ranked candidates with strengths, gaps, and recommendation text.
6. Pitch the Sub0 model/API layer as the production backend path.

## Sub0/LingoQL Plan

See [SUB0_PLAN.md](./SUB0_PLAN.md).
