# school-portal-ng

A school result checker built with Next.js (App Router), Supabase and Tailwind CSS.

Students check their term results by registration number; teachers manage students and record CA/exam scores.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

| Route | Purpose |
| --- | --- |
| `/check-result` | Student result checker |
| `/teacher/login` -> `/teacher/dashboard` | Teacher area (functional dashboard) |
| `/dashboard/teacher` | Static UI mock, not wired to the database |

## Environment variables

Copy `.env.example` to `.env.local` and fill in the values. Never commit `.env.local`.

| Variable | Where used | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | client + server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client + server | Supabase anon key (public; must be protected by RLS) |
| `SUPABASE_SERVICE_KEY` | server only | Service-role key. Bypasses RLS. Never expose it to the browser. |
| `NEXT_PUBLIC_URL` | misc | Public base URL of the deployment |

## Database schema (Supabase)

- `classes` - id, name
- `students` - id, reg_number, first_name, last_name, class_id, parent_email, parent_phone
- `teachers` - full_name, email, subject_specialization (login is planned to move to Supabase Auth)
- `assessments` - id, name (`"<subject> <type>"`), type (CA1/CA2/CA3/Exam), max_score, term
- `scores` - student_id, assessment_id, score; unique on (student_id, assessment_id)

## Security notes

- A real service-role key was previously committed in `.env.local`. If you cloned this repo before that file was removed, treat every key as compromised: rotate them in Supabase (Settings -> API) and purge git history with `git filter-repo` or BFG.
- `.env*` files are git-ignored; `.env.example` is the only tracked env file.
- Open security and bug work is tracked in the repository issues.
