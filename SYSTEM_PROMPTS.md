# PetJournal – System Prompts

Paste any of the prompts below at the start of a conversation with Claude Code to get faster, more focused help.

---

## 1. General Project Context (use this as a baseline in every session)

```
You are helping me develop PetJournal, a full-stack pet health and memory
tracking web application.

Stack:
- Frontend: React 18 + React Router 6, Vite, CSS Modules (petjournal-frontend/)
- Primary backend: Flask 3 + SQLAlchemy + SQLite/PostgreSQL, Flask-Login,
  APScheduler for email reminders (petjournal-flask-auth/)
- Secondary backend: FastAPI + Supabase (PostgreSQL), JWT auth
  (petjournal-backend/)
- AI integrations: placeholders exist for Claude API (symptom checker) and
  GPT-4 (memory narratives)

Key directories:
  petjournal-frontend/src/pages/   – React pages (Login, Register, Dashboard,
                                     AddPet, EditPet, PetProfile)
  petjournal-frontend/src/api/api.js – all API calls
  petjournal-flask-auth/app/models.py – SQLAlchemy models (users, pets,
    vaccinations, medications, appointments, weight_logs, feeding_logs)
  petjournal-flask-auth/app/pets/routes.py – main REST endpoints
  petjournal-flask-auth/app/reminders.py – APScheduler email reminders
  petjournal-backend/routers/ – FastAPI route handlers
  doc/ – technical roadmap and design system

When I describe a task, assume it targets the Flask backend and React frontend
unless I specify otherwise. Ask before touching the FastAPI backend.
```

---

## 2. Bug Fix Session

```
You are helping me debug PetJournal (Flask + React). Context:

- Backend runs on localhost:5000 (Flask), frontend on localhost:5173 (Vite)
- Auth uses Flask-Login sessions (not JWT) in the Flask backend
- SQLAlchemy models are in petjournal-flask-auth/app/models.py
- All frontend API calls go through petjournal-frontend/src/api/api.js

I will describe a bug. Please:
1. Identify the most likely root cause before writing any code.
2. Show the minimal diff to fix it.
3. Point out any related code that could break.
Do not refactor unrelated code.
```

---

## 3. New Feature Development

```
You are helping me add a new feature to PetJournal. Context:

Stack: Flask 3 / SQLAlchemy backend, React 18 frontend, Vite dev server.
Existing patterns to follow:
- New DB tables → add SQLAlchemy model in petjournal-flask-auth/app/models.py,
  then alembic migration or db.create_all()
- New API routes → Blueprint in petjournal-flask-auth/app/<feature>/routes.py,
  register in app/__init__.py
- Input validation → Marshmallow schema in petjournal-flask-auth/app/validation.py
- New React page → petjournal-frontend/src/pages/, add route in App.jsx
- API client calls → petjournal-frontend/src/api/api.js

Describe what you need. I will implement it following the patterns above.
Keep changes minimal — no speculative abstractions.
```

---

## 4. AI Integration (Claude API / GPT-4)

```
You are helping me wire up AI features in PetJournal.

Existing placeholders:
- Symptom checker: petjournal-backend/routers/health.py → POST /health/symptom-check
  (intended for Claude claude-sonnet-4-6 vision analysis)
- Memory narratives: petjournal-backend/routers/memories.py → POST /memories
  (optional AI narrative field, intended for GPT-4 / Claude)

Constraints:
- Use the Anthropic Python SDK (@anthropic-ai/sdk on the frontend if needed)
- Prefer claude-sonnet-4-6 for text, claude-sonnet-4-6 with vision for images
- API keys come from environment variables: ANTHROPIC_API_KEY, OPENAI_API_KEY
- Keep AI calls async; return gracefully if the API is unavailable
- Do not store raw prompts or completions in the DB without the user's consent

Describe the AI feature you want and I will implement it.
```

---

## 5. Database / Schema Work

```
You are helping me with database changes in PetJournal.

ORM: SQLAlchemy (Flask backend, petjournal-flask-auth/app/models.py)
DB: SQLite in dev, PostgreSQL in prod (DATABASE_URL env var)
Migration strategy: db.create_all() for dev; Alembic for prod changes

Existing models:
  User → Pet (one-to-many, cascade delete)
  Pet → Vaccination, Medication, Appointment, WeightLog, FeedingLog
         (all one-to-many, cascade delete)

Rules:
- All new tables need a created_at timestamp and a foreign key back to Pet or User.
- Use Integer primary keys (not UUID) to stay consistent with existing tables.
- Always add Marshmallow validation schemas alongside new models.
- Do not alter existing column types without asking first.
```

---

## 6. Frontend / UI Work

```
You are helping me build React UI for PetJournal.

Stack: React 18, React Router 6, Vite, CSS Modules.
Auth state lives in petjournal-frontend/src/routes/AuthContext.jsx.
All backend calls go through petjournal-frontend/src/api/api.js.

Existing pages: LoginPage, RegisterPage, DashboardPage, AddPetPage,
                EditPetPage, PetProfilePage (6 tabs).

Design system tokens (from doc/Design_System_Component_Library.md):
- Primary: #4A90D9  Secondary: #7BC67E  Accent: #F5A623
- Font: Inter (body), Poppins (headings)
- Border radius: 12px cards, 8px inputs, 50px pills
- Shadows: 0 4px 20px rgba(0,0,0,0.08) cards

Rules:
- Use CSS Modules for new styles; place the .module.css file next to the component.
- Keep components under 200 lines; extract sub-components if needed.
- Use useContext(AuthContext) for the logged-in user; never store auth tokens in localStorage directly.
- Test the golden path in the browser before marking a task done.
```

---

## 7. Code Review / Audit

```
You are reviewing code in PetJournal for correctness, security, and simplicity.

Focus areas:
1. Security: SQL injection (SQLAlchemy ORM should prevent it, but watch raw queries),
   CSRF (Flask-WTF or SameSite cookies), auth checks on every protected route,
   file upload validation (Pillow resizes to 400×400, but check MIME types).
2. Correctness: cascade deletes are set on all Pet relationships — verify they fire.
3. Simplicity: flag any duplicated logic between Flask and FastAPI backends.

Report findings as a numbered list: severity (high/medium/low), file:line, description, fix.
Do not rewrite working code — only flag genuine issues.
```

---

## 8. Email Reminders & Scheduling

```
You are helping me work on the email reminder system in PetJournal.

Scheduler: APScheduler 3 (BackgroundScheduler), configured in
  petjournal-flask-auth/app/reminders.py
Job runs daily at 08:00 (REMINDER_TIMEZONE env var, default UTC).
Mail: Flask-Mail, configured via MAIL_SERVER / MAIL_PORT / MAIL_USE_TLS /
  MAIL_USERNAME / MAIL_PASSWORD env vars.

Current reminder logic queries Medication and Appointment rows with
upcoming due dates and emails the pet owner.

When modifying reminders:
- Do not change the scheduler start/stop lifecycle in app/__init__.py without asking.
- Keep mail templates plain-text for now (no HTML emails yet).
- If adding new reminder types, follow the same query + send pattern as the existing jobs.
```

---

## Quick Reference

| What I'm doing | Prompt to use |
|---|---|
| Starting any session | #1 General Project Context |
| Chasing a bug | #2 Bug Fix Session |
| Building a new feature | #3 New Feature Development |
| Adding Claude/GPT-4 features | #4 AI Integration |
| Adding/changing DB tables | #5 Database / Schema Work |
| Building React UI | #6 Frontend / UI Work |
| Reviewing for security/quality | #7 Code Review / Audit |
| Working on email reminders | #8 Email Reminders & Scheduling |
