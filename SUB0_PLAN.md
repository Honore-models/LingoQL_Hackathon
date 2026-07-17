# Sub0 and LingoQL Implementation Plan

This is the hackathon-ready backend plan for moving Talvo from the current Mongo/Express implementation into the LingoQL ecosystem.

## Sub0 Models

Create these models in Sub0:

- `users`: recruiter account, company, verification state.
- `jobs`: title, department, location, employment type, requirements, skills, qualifications, shortlist size.
- `applicants`: normalized candidate profile, contact info, skills, education, work history, availability, source.
- `resumes`: applicant id, storage URL, parse status, extracted text hash.
- `screening_runs`: job id, applicant ids, status, model, started/completed timestamps.
- `screening_results`: run id, job id, applicant id, rank, match score, strengths, gaps, recommendation.
- `audit_events`: user id, action, entity type, entity id, metadata.

## Sub0 APIs

Expose CRUD/query APIs for:

- `GET /dashboard`
- `GET /jobs`
- `POST /jobs`
- `GET /applicants`
- `POST /applicants/import`
- `POST /screening-runs`
- `GET /screening-runs/:id`
- `POST /talent-query`

The Node service can remain as a focused AI worker:

- receives a `screening_run` id,
- reads job/applicant data from Sub0,
- calls Gemini,
- writes `screening_results` and audit events back into Sub0.

## Winning Feature: Query Talent

Add a natural-language query box backed by Sub0 structured data:

- "Show backend candidates with PostgreSQL and 3+ years."
- "Which shortlisted candidates have the weakest education match?"
- "Find applicants available immediately in Lagos."

This directly matches the hackathon theme: going from messy data to queryable production workflows.

## Deployment Story

- Deploy frontend on LingoQL.
- Build backend data models and APIs with Sub0.
- Use the existing Express app only for AI orchestration if Sub0 does not host long-running Gemini jobs directly.
- Document the Sub0 schemas, API screenshots, and live URL in the final Devpost submission.
