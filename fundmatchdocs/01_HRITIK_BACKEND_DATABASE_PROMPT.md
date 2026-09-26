# CURSOR PROMPT — Hritik (Backend Core + Database)

## Who you are on this team
You are **Hritik**, building the **backend core and database layer** of FundMatch AI for the PS-41 hackathon (team of 3: you, Kirt, Shashank). Kirt owns the AI/matching services and the two AI-driven endpoints on top of your foundation. Shashank owns frontend + deployment of the frontend. You own everything below.

Read these project docs before starting (already in the repo root / docs folder): `01_PRD.md`, `03_SYSTEM_ARCHITECTURE.md` (or `03_TECH_ARCHITECTURE.md`), `05_DATABASE_AND_API.md`. Treat `05_DATABASE_AND_API.md` as the source of truth for schema and endpoint contracts — do not invent field names that differ from it, because Kirt's services and Shashank's frontend are both coded against that exact contract.

## Your scope (own these folders/files)
```
backend/
  src/
    index.ts                  ← Express app bootstrap, middleware, error handler
    config/
      db.ts                   ← PostgreSQL pool (pg or postgres.js)
      env.ts                  ← env var loading/validation
    db/
      schema.sql              ← all 4 tables (profiles, schemes, matches, action_plans)
      seed.sql                ← 15-20 demo schemes
      migrate.ts / migrate.sh ← run schema.sql + seed.sql against DATABASE_URL
    routes/
      profiles.routes.ts      ← POST /api/profiles
      schemes.routes.ts       ← GET /api/schemes, GET /api/schemes/:id
    services/
      profile.service.ts
      scheme.service.ts
    repositories/
      profile.repository.ts
      scheme.repository.ts
    middleware/
      validate.ts             ← Zod validation middleware
      errorHandler.ts         ← standard error response shape
    types/
      profile.types.ts
      scheme.types.ts
  package.json / tsconfig.json / .env.example
```
**Do NOT touch:** `backend/src/services/matching.service.ts`, `backend/src/services/actionPlan.service.ts`, `backend/src/services/claude.service.ts`, `backend/src/routes/matches.routes.ts`, `backend/src/routes/actionPlans.routes.ts`, or anything under `frontend/`. Those belong to Kirt and Shashank. If you need something from them (e.g. a shared type), propose it in a shared `backend/src/types/shared.types.ts` file and message the team rather than editing their files directly.

## Build order

### 1. Project + DB setup
- `backend/`: `npm init -y`, install `express typescript ts-node dotenv cors pg zod`, dev deps `@types/express @types/node @types/pg`.
- Set up `tsconfig.json`, `src/index.ts` with Express, `cors()`, `express.json()`, and a `/health` route returning `{ status: "ok" }`.
- `.env.example`:
  ```
  DATABASE_URL=postgresql://localhost/fundmatch_ai
  PORT=3000
  NODE_ENV=development
  ```
- Provision PostgreSQL locally or on Railway; create the `fundmatch_ai` database.

### 2. Schema (exactly as specified in `05_DATABASE_AND_API.md`)
Create all 4 tables with these exact columns — Kirt's services read/write `matches` and `action_plans` directly, so don't rename fields:
- `profiles` — id (UUID pk), name, sector, stage, location, funding_needed, founder_experience, incorporation_date, gst_status, dpiit_registration, previous_funding, created_at, updated_at
- `schemes` — id (UUID pk), name (unique), description, eligible_sectors (text[]), eligible_stages (text[]), eligible_locations (text[]), funding_min, funding_max, eligibility_criteria (JSONB), source_url, scheme_type, created_at, updated_at
- `matches` — id, profile_id (fk), scheme_id (fk), compatibility_score, match_data (JSONB), fallback_mode, created_at, expires_at, unique(profile_id, scheme_id)
- `action_plans` — id, profile_id (fk), scheme_id (fk), action_data (JSONB), total_estimated_time, created_at, expires_at, unique(profile_id, scheme_id)

Add the indexes listed in the doc (GIN indexes on the array columns, score/expiry indexes). Write this as `schema.sql` and a small `migrate.ts` script that runs it against `DATABASE_URL`.

### 3. Seed data
Write `seed.sql` with **15-20 real, varied government/startup schemes** (Startup India, NASSCOM, DST Grant, MSME Udyam, state-level schemes, accelerators, etc.) covering a spread of sectors, stages, funding ranges, and locations so the matching demo actually produces differentiated scores. Follow the `eligibility_criteria` JSONB shape from the doc exactly: `[{ "id", "name", "description", "required", "impact" }]`.

### 4. Endpoints (yours only)
Implement exactly per `05_DATABASE_AND_API.md`:
- `POST /api/profiles` — validate with Zod (name required ≤255 chars; sector/stage/location/founderExperience from allowed lists; fundingNeeded positive int), insert, return `{ success, profile }` (201) or `{ success:false, error, details }` (400).
- `GET /api/schemes` — return `{ success, schemes, totalCount }`.
- `GET /api/schemes/:schemeId` — return `{ success, scheme }` (200) or `{ success:false, error }` (404).

Use camelCase in JSON responses even though columns are snake_case in Postgres — map it in the repository/service layer.

### 5. Cross-cutting
- `middleware/errorHandler.ts`: standard shapes for 400/404/500 exactly as in the doc's "Error Handling" section.
- Connection pooling (single pool, no clustering — this is a hackathon build).
- `npm run dev` (ts-node-dev or nodemon) and `npm run build && npm start` for production.

### 6. Deployment
- Deploy backend + PostgreSQL to Railway. Set `DATABASE_URL` from Railway's provisioned Postgres, keep `CLAUDE_API_KEY` (Kirt will need this var name available in Railway even though you don't use it) and other env vars in Railway's dashboard, never committed.
- Confirm `GET /health`, `GET /api/schemes`, and `POST /api/profiles` all work against the deployed URL before handing off to Kirt/Shashank.

## Testing checklist before you say "done"
- [ ] `npm run dev` starts with no errors, `/health` returns 200
- [ ] `schema.sql` + `seed.sql` run clean against a fresh database
- [ ] `POST /api/profiles` with valid body returns 201 with a real UUID
- [ ] `POST /api/profiles` with missing/invalid fields returns 400 with `details`
- [ ] `GET /api/schemes` returns all seeded schemes with correct field names (camelCase)
- [ ] `GET /api/schemes/:id` returns 404 for a bogus UUID
- [ ] Railway deployment is live and reachable from outside your machine

## Git & commit rules — read this before running any git command
- You already have `GITHUB_SETUP_GUIDE.md` — follow it exactly for repo init and the first commit.
- **Do not let Cursor's agent mode run `git commit`, `git push`, or manage the GitHub remote for you.** Run all git commands yourself in the terminal, after reviewing `git diff`/`git status`.
- Before every commit, verify identity: `git config user.name` and `git config user.email` must show **you** (hritik3706 + your email), never anything mentioning Cursor, AI, or an agent.
- Every commit message must be written by you, in your own words, describing what changed — never "Generated by Cursor," never a Co-Authored-By trailer for any AI tool.
- After each commit, run `git log -1 --format=fuller` and confirm Author/Committer show only your identity with no extra trailers.
- Push to your own feature branch (e.g. `backend-core`) and open a PR into `main` rather than pushing straight to `main`, so Kirt and Shashank can see what changed in your layer.
