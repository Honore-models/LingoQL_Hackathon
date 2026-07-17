# Umurava-Talvo Project Workflow

This document captures the 5-step workflow you can use to manage the Talvo implementation for the Umurava AI Hackathon.

## 1. Set Goals

Purpose: Align the team around what the app must deliver and what winning looks like.

- Define the project objective:
  - Build an AI-powered screening platform for recruiters.
  - Support structured Talent Profile schema ingestion.
  - Generate ranked candidate shortlists with clear reasoning.
- Agree on hackathon success criteria:
  - Uses Gemini API for AI processing.
  - Stores jobs, applicants, screening runs, and results.
  - Supports spreadsheet + PDF resume upload and parsing.
  - Provides recruiter-facing shortlist review and explanation.
- Create measurable goals:
  - Complete job creation flow.
  - Implement applicant ingestion and resume parsing.
  - Deliver end-to-end AI screening with top K ranking.
  - Add security controls for auth, upload limits, and safe AI handling.
- Set a final delivery list:
  - Working frontend UI for dashboard, jobs, candidates, screening.
  - Backend REST API with `/auth`, `/register-candidate`, `/ai/run`, `/ai/runs/:runId`.
  - Deployment-ready README and demo script.

## 2. Plan Iteration

Purpose: Break the work into small, achievable phases and define realistic timelines.

- Divide the project into short iterations (1-3 days each).
- Suggested iteration plan:
  1. **Iteration 1**: Core backend APIs + job model + candidate model.
  2. **Iteration 2**: Candidate ingestion, spreadsheet parsing, resume upload.
  3. **Iteration 3**: Gemini integration for profile parsing and screening.
  4. **Iteration 4**: Frontend flows for job creation, uploads, screening results.
  5. **Iteration 5**: Explainability, security hardening, demo polish, README.
- For each iteration, specify deliverables:
  - Work items
  - Acceptance criteria
  - Required tests or checks
- Use a simple board or list to capture tasks:
  - `Todo`, `In progress`, `Review`, `Done`
- Document task details clearly so any team member can pick them up.

## 3. Assign Tasks

Purpose: Distribute responsibilities based on team strengths and avoid duplicate work.

- Identify roles and skills in your team:
  - Frontend engineer
  - Backend engineer
  - AI/ML engineer
  - Product / UX owner
- Assign primary ownership for each area:
  - Backend APIs and database models
  - Upload flow and resume parsing
  - Gemini prompt engineering and screening logic
  - Frontend UI for dashboard, job builder, and results
- Use paired work for high-risk features:
  - Resume parsing logic with Gemini prompt design
  - Candidate upload + validation
  - Security and rate-limiter implementation
- Track ownership in your task list so accountability is clear.
- Keep assignments flexible; adjust based on team progress.

## 4. Track Progress

Purpose: Keep the team aligned, catch blockers early, and verify progress frequently.

- Hold daily check-ins or quick syncs:
  - What was done yesterday?
  - What will be done today?
  - What is blocking progress?
- Use a visible progress tracker:
  - Online board (Trello, GitHub Projects, Notion)
  - Spreadsheet or shared document
- Keep engineering checkpoints:
  - Backend API review
  - Frontend integration review
  - AI prompt and output validation
- Measure progress against the goal list:
  - Have candidate ingestion working?
  - Can recruiters run AI screening?
  - Are results stored and retrievable?
- Use simple quality checks:
  - Does the upload flow reject invalid files?
  - Does Gemini output validate before saving?
  - Do UI screens show user-friendly errors?

## 5. Evaluate Results

Purpose: Review completed work, confirm it matches requirements, and prepare for demo.

- Evaluate every iteration outcome:
  - Did the feature meet the acceptance criteria?
  - Are there visible bugs or gaps?
  - Is the flow coherent and easy to use?
- Use a demo-first mindset:
  - Run through the recruiter journey end-to-end.
  - Verify job creation, candidate upload, screening, and shortlist review.
- Check alignment with hackathon criteria:
  - Gemini API usage
  - Structured Talent Profile schema support
  - Ranked shortlist with explanation
  - Security and production readiness
- Capture improvement actions:
  - What must be fixed before the final submission?
  - What can be polished to make the experience outstanding?
- Prepare the final demo script and presentation notes.

## Applying the workflow to Umurava-Talvo

### Product goals
- Build a recruiter dashboard for job creation and result review.
- Enable structured candidate ingestion with schema mapping.
- Ensure the AI screening output is transparent and actionable.
- Add security controls to protect the app from abuse.

### Iteration guide
- **Iteration 1**: Build `Job`, `Applicant`, `ScreeningRun`, and `ScreenResult` models.
- **Iteration 2**: Implement `/register-candidate`, spreadsheet parsing, resume upload and storage.
- **Iteration 3**: Add Gemini resume parsing and resume-to-schema mapping.
- **Iteration 4**: Build frontend pages for jobs, candidates, and screening results.
- **Iteration 5**: Harden auth, rate limiting, validation, and final demo polish.

### Recommended task mapping
- Backend tasks:
  - Add rate limiter middleware for auth + candidate upload.
  - Add strong validation for request payloads.
  - Build screening orchestration in `services/aiservice.ts`.
- Frontend tasks:
  - Add job builder UI.
  - Add candidate upload flow.
  - Add screening progress/results pages.
- AI tasks:
  - Design Gemini prompt for resume parsing.
  - Design Gemini prompt for ranking and explainability.
  - Validate outputs with strict JSON schemas.
- Quality tasks:
  - Test upload + parsing with sample spreadsheets/resumes.
  - Review UI flow and copy for clarity.
  - Prepare the demo and presentation.

## Recommended team cadence
- Day 1: goal alignment, architecture review, assign first tasks.
- Day 2: backend core models, job and applicant APIs.
- Day 3: upload flow, resume parsing, frontend job screens.
- Day 4: AI screening integration, results view, security checks.
- Day 5: polish, bug fixes, final demo rehearsal.

## Notes for Canva / Presentation
- Use this workflow as the project execution story:
  - Set clear goals
  - Plan in short iterations
  - Assign tasks to specialists
  - Track progress daily
  - Evaluate results frequently
- Explain that this process keeps the team focused and ensures a high-quality hackathon delivery.
