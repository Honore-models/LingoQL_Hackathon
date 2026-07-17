# Talvo Frontend

Next.js frontend for Talvo, a Sub0-ready talent intelligence and AI screening workspace for recruiters.

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- Redux Toolkit
- TanStack Query
- Axios
- Framer Motion
- Recharts
- Lucide React

## Local Development

```bash
npm install
npm run dev
```

Set `NEXT_PUBLIC_API_URL=http://localhost:5000` to use the backend. If omitted, the app uses local mock data for the demo screens.

## Routes

- `/` - landing page
- `/login` - sign in
- `/register` - signup and OTP verification
- `/dashboard` - recruiter dashboard
- `/dashboard/jobs/new` - job builder
- `/dashboard/jobs/[id]` - job detail
- `/dashboard/screening/[id]` - applicant intake
- `/dashboard/screening/[id]/progress` - screening progress
- `/dashboard/screening/[id]/results` - shortlist results
- `/dashboard/candidates/[id]` - candidate detail
- `/settings` - workspace settings
