# FundMatch AI — source catalog and build plan

PS-41, Startup Scheme & Funding Agent. Team: Hritik Kumar (backend and database), Kirt Raj Dixit (AI matching and those APIs), Shashank Kumar Singh (frontend and frontend deployment).

This plan is the reading order for the files that were collected from Downloads and from `origin/main`. It records what each file is, where the documents disagree, and which contract to build.

## Decision

Build the **hackathon MVP** now. Keep the **taxonomy agent** as the next product. Do not start the production platform until a real scheme catalog exists.

| Horizon | What it is | Contract |
|---|---|---|
| Now | One-day demo: profile, ranked schemes, gaps, action plan, PDF | `01_PRD.md` through `05_DATABASE_AND_API.md`, plus `fundmatchdocs/01_HRITIK_BACKEND_DATABASE_PROMPT.md` |
| Next | Pre-classified government catalog, two-stage match, cited eligibility | `fundmatchdocs/PS41-System-Design-Architecture.md` and the lean TRD `fundmatchdocs/PS41-TRD-Work-Division (2).md` |
| Later | Celery, Redis, Kubernetes, AWS, full observability | `fundmatchdocs/PS41-TRD-Work-Division-Production.md` |

Mixing these in one codebase is the failure mode the TRDs are written to prevent: two backends, two schemas, and two definitions of “a match.”

## Why the hackathon contract comes first

The pitch deck, the PRD, the API spec, and Hritik’s assignment all describe the same product:

- React + TypeScript frontend, Node.js + Express + TypeScript API, PostgreSQL.
- Four tables: `profiles`, `schemes`, `matches`, `action_plans`.
- Claude reasons over a seeded catalog of 15–20 schemes.
- A deterministic formula is the fallback when Claude is unavailable.
- No accounts. Demo data, not a live government crawl.
- Success is a 2–3 minute jury path that finishes before 7 PM: submit a profile, see ranked schemes, open a breakdown, generate a plan, download a PDF.

The PS-41 system design is the better long-term architecture. It is also a different product: FastAPI, a shared taxonomy, Qdrant, offline ingestion, admin verification, and an 11-page flow. That work starts after the demo path is real.

## Source catalog

| File in this repo | Origin | Role |
|---|---|---|
| `01_PRD.md` | Downloads | Product scope. P0 / P1 / P2. Functional requirements FR-01–FR-11. |
| `02_FEATURES_AND_USER_FLOWS.md` | Downloads | Six features, eight-step user flow, six screens, jury script. |
| `03_TECH_ARCHITECTURE.md` | Downloads | Hackathon stack, request flow, folder layout, deploy targets. |
| `04_AI_MATCHING_SPEC.md` | Downloads | Score formula, Claude prompts, gap rules, cache keys, fallback payload. |
| `05_DATABASE_AND_API.md` | Downloads | Schema and endpoint contract. Source of truth for field names. |
| `fundmatchdocs/01_HRITIK_BACKEND_DATABASE_PROMPT.md` | Downloads | Hritik’s folder ownership and the files he must not edit. |
| `Readme.md` | Already on `main` | Index of the original seven-doc pack. Docs 06 and 07 were not in this source set. |
| `fundmatchdocs/PS41-System-Design-Architecture.md` | Already on `main` | Next-product architecture: offline catalog, shared taxonomy, rules-first eligibility. |
| `fundmatchdocs/PS41-TRD-Work-Division (2).md` | Already on `main` | Lean three-team split for that next product. This is the stack to adopt later. |
| `fundmatchdocs/PS41-TRD-Work-Division-Production.md` | Downloads `PS41-TRD-Work-Division.md` | Same split, with Celery, Redis, Kubernetes, AWS, and observability. Scale checklist only. |
| `fundmatchdocs/PS41-Database-Schema.md` | Downloads `gemini-code-1790404867046.md` | PostgreSQL ERD for the taxonomy design. |
| `fundmatchdocs/PS41-Match-Sequence.md` | Downloads `gemini-code-1790404863363.txt` | Sequence: parse, classify upward, SQL stage 1, rules/LLM stage 2. |
| `fundmatchdocs/examples/two-stage-match.example.json` | Downloads `gemini-code-1790404853627.json` | Example stage-1 taxonomy hit and stage-2 field evaluation. |
| `FundMatch-AI (3).pdf` | Downloads, not committed | Eight-page pitch. Pages 1–7 match the hackathon PRD. Page 8 is a different product (PhishEye) and is out of scope. |

`06_UI_UX_SPEC.md` and `07_MASTER_BUILD_PROMPT.md` are named in `Readme.md` and were not in the files provided. Frontend visual spec and the generic six-hour agent prompt are still missing. Until `06` exists, Shashank follows `02_FEATURES_AND_USER_FLOWS.md` and the screen list in `03_TECH_ARCHITECTURE.md`.

## Conflicts and the call on each

| Topic | Hackathon pack | PS-41 pack | Call for the current build |
|---|---|---|---|
| Frontend | React 18, Context, Axios, Tailwind, Vercel | Next.js 14, TanStack Query, Zustand, shadcn/ui | React app in `frontend/`. Next.js waits for the next product. |
| Backend | Node 18, Express, TypeScript, Zod | Python FastAPI | Express in `backend/`. |
| Database | Four tables, arrays and JSONB | Taxonomy nodes, governing bodies, evidence clauses, Qdrant | Implement `05_DATABASE_AND_API.md` exactly. Do not rename columns. |
| Matching | Claude scores every scheme; formula is fallback | Stage 1 is a SQL taxonomy intersection. Stage 2 is deterministic rules, then a constrained LLM on evidence clauses | Formula always runs. Claude explains the top results. See “Matching, so the demo stays under five seconds.” |
| Score | `(sector 25) + (stage 25) + (location 15) + (funding 20) + (completeness 15)` | Status labels such as `ELIGIBLE_NOW`, not a single percentage as the primary result | Use the weighted score and the four labels in `04_AI_MATCHING_SPEC.md`. |
| PDF | Client-side jsPDF. One diagram also shows `POST /api/export/pdf` | Not a core service | Shashank generates the PDF in the browser. No PDF route in Hritik’s API. |
| Auth | None | JWT, user and admin | No auth. |
| Cache | Redis optional, one-hour match TTL | Lean TRD: no Redis. Production TRD: Redis | In-memory `Map` with the TTLs from doc 04. Skip Redis unless a second request is visibly slow. |
| Jobs | Request/response | APScheduler, or Celery in the production TRD | No workers. |
| Schemes | 15–20 curated rows | Crawled official documents, staging tables, admin verify | Seed SQL only. |
| Ownership of AI routes | Kirt owns `matches` and `action_plans` | Backend team owns every service | Honor Hritik’s prompt. He does not edit Kirt’s or Shashank’s files. |

The two TRDs also disagree with each other. The file already on `main` (`PS41-TRD-Work-Division (2).md`) drops Celery, Redis, CI, monitoring, and hosting on purpose. The production TRD adds them. When the taxonomy product starts, follow the lean TRD. Treat the production TRD as a later checklist, not as a second stack to stand up in parallel.

## What the demo must do

From the PRD and the pitch deck:

1. Founder submits company name, sector, stage, location, funding needed (lakhs), and founder experience.
2. Schemes come back ranked by compatibility, highest first. Show the top 10.
3. A scheme detail shows met criteria, missing requirements, and the five-part score breakdown.
4. An action plan has at least five steps, each with a title, description, time, documents, and deadline.
5. A PDF downloads.
6. If Claude fails, the same screens still work and the UI says fallback mode is on.
7. A prepared profile can be walked in two to three minutes:

```
Company: HealthTech Solutions
Sector: HealthTech
Stage: Seed
Location: Delhi
Funding needed: 30
Founder experience: First-time
```

P1 (detail modal polish, saved profiles, email export, auth, caching) is optional. P2 (live government APIs, mobile app, multilingual, incubator matching) is out of this build.

## Frozen lists

Docs 02 and 05 require these values and do not publish the full lists. Put them in one shared module, `backend/src/types/shared.types.ts`, before Kirt and Shashank code against the API. JSON stays camelCase. Postgres stays snake_case. Map in the repository layer.

**Sectors:** EdTech, FinTech, HealthTech, ClimaTech, AI/ML, AgriTech, DeepTech, Biotech, Other.

**Stages:** Pre-seed, Seed, Series A, Series B.

**Founder experience:** First-time, Serial, Angel, VC-backed.

**Locations:** Indian states and union territories, plus the scheme-side value `Pan India` (schemes only, not a profile location). Profile location examples in the docs use city names (`Bangalore`, `Delhi`). Accept the city or state strings used in the seed data, and document that list in the same module so validation and seed data cannot drift.

**Optional profile fields** (accepted, not required on `POST /api/profiles`): `incorporationDate`, `gstStatus` (`Registered` | `Pending` | `No`), `dpiitRegistration`, `previousFunding`.

## API Hritik owns

Shapes are in `05_DATABASE_AND_API.md`. Do not invent fields.

| Method | Path | Success |
|---|---|---|
| GET | `/health` | `{ "status": "ok" }` |
| POST | `/api/profiles` | 201 `{ success, profile }` |
| GET | `/api/schemes` | 200 `{ success, schemes, totalCount }` |
| GET | `/api/schemes/:schemeId` | 200 `{ success, scheme }` or 404 |

Validation failures are 400 `{ success: false, error, details }`. Unknown resources are 404 `{ success: false, error }`. Unexpected failures are 500 `{ success: false, error, message }`.

## API Kirt owns

Hritik creates the tables. Kirt writes the services and routes.

| Method | Path | Behavior |
|---|---|---|
| POST | `/api/matches/analyze` | Body `{ profileId }`. Returns the top 10 matches, score descending. Sets `fallbackMode` when Claude is not used. |
| GET | `/api/matches/:profileId/:schemeId` | One match, including `scoreBreakdown`. |
| GET | `/api/action-plans/:profileId/:schemeId` | 5–10 steps. Fallback plan if Claude fails. |

`matches.match_data` stores `matchedCriteria`, `missingRequirements`, `overallReasoning`, `nextSteps`. `action_plans.action_data` stores the action-plan JSON from doc 04. Both tables use `UNIQUE(profile_id, scheme_id)`.

Doc 03’s screen flow sometimes calls `GET /api/matches?profileId=`. The endpoint that actually runs analysis is `POST /api/matches/analyze`. The results page reads that response (or the stored rows). Do not add a second analyze route.

## Matching, so the demo stays under five seconds

FR-11 asks for profile-to-matches in under five seconds. Doc 03 also says one sequential Claude call per scheme. Those two statements cannot both be true for 20 schemes.

Implementation order inside Kirt’s matcher:

1. Score every scheme with the formula in doc 04. This path always works and is what `fallbackMode: true` returns.
2. Call Claude only for the top three scores, in parallel, with a short timeout, using the matching prompt in doc 04.
3. If a Claude call fails or returns non-JSON, keep that scheme’s formula score and set `fallbackMode` on the response.
4. Cache `matches:{profileId}:{schemeId}` for one hour and `actionplan:{profileId}:{schemeId}` for four hours. An in-memory map is enough. Persist the same payload in `matches` and `action_plans` so a refresh still has data.

Eligibility labels, from doc 04:

| Score | Critical gaps | Label |
|---|---|---|
| 75–100 | 0 | `FULLY_ELIGIBLE` |
| 50–74 | 2 or fewer | `PARTIALLY_ELIGIBLE` |
| 25–49 | 5 or fewer | `UNLIKELY_ELIGIBLE` |
| otherwise | | `NOT_ELIGIBLE` |

Component scores are 0–1, then weighted: sector 0.25, stage 0.25, location 0.15, funding range 0.20, eligibility completeness 0.15. Multiply by 100 and round to an integer. `scoreBreakdown` on the detail endpoint is those five weights already multiplied by 100 (the 25 / 25 / 15 / 20 / 15 point budgets).

## Schema Hritik ships

Exactly the four `CREATE TABLE` blocks in `05_DATABASE_AND_API.md`, including indexes:

- `profiles` — UUID pk, required matching fields, optional GST / DPIIT / incorporation / previous funding.
- `schemes` — unique name, `text[]` eligibility arrays, funding min/max in lakhs, `eligibility_criteria` JSONB of `{ id, name, description, required, impact }`.
- `matches` — score, `match_data` JSONB, `fallback_mode`, `expires_at`, unique profile+scheme.
- `action_plans` — `action_data` JSONB, `total_estimated_time`, `expires_at`, unique profile+scheme.

Foreign keys use `ON DELETE CASCADE` as written. One `pg` pool. Database name `fundmatch_ai`.

### Seed set

These ten are required by doc 05. Add at least five more rows in the same JSONB shape so sector, stage, funding band, and state coverage are not identical. Mark non-government programs (accelerators, fellowships) with `scheme_type` so the UI can say they are not a government scheme.

1. STARTUP INDIA Scheme — central, broad sectors, all listed stages, Pan India, ₹0–1000L.
2. NASSCOM Startup Scheme — technology, Seed to Series A, Pan India, ₹25–100L.
3. ICICI Foundation for Entrepreneurship — Seed to Series A, Pan India, ₹10–100L.
4. Google Startup School — mentorship, Seed, Pan India, funding 0–0.
5. Accel Fellowship — technology, Pre-seed and Seed, Bangalore / Mumbai / Delhi, ₹10–50L.
6. YourStory Accelerator — Pre-seed and Seed, Pan India, ₹15–50L.
7. NASSCOM 10000 Startups — technology, Seed and Series A, Pan India, ₹25–200L.
8. Department of Science & Technology (DST) Grant — DeepTech, AI/ML, Biotech, Seed and Series A, Pan India, ₹20–100L.
9. MSME Udyam Scheme — all sectors and stages, Pan India, ₹0–500L.
10. Telangana T-Hub — technology and biotech, Seed and Series A, Telangana, ₹10–100L.

Each criterion needs `id`, `name`, `description`, `required`, and `impact` (`high` | `medium` | `low`). Gap detection in doc 04 keys off names such as `GST Registration`, `DPIIT Recognition`, and `Incorporation Certificate`. Use those names when the scheme actually has that rule.

## Team boundaries

```
frontend/          Shashank
backend/src/routes/profiles.routes.ts
backend/src/routes/schemes.routes.ts
backend/src/services/profile.service.ts
backend/src/services/scheme.service.ts
backend/src/repositories/**
backend/src/db/**
backend/src/middleware/**
backend/src/config/**          Hritik

backend/src/services/matching.service.ts
backend/src/services/actionPlan.service.ts
backend/src/services/claude.service.ts
backend/src/routes/matches.routes.ts
backend/src/routes/actionPlans.routes.ts    Kirt
```

Shared types go in `backend/src/types/shared.types.ts`. Propose a change there instead of editing the other person’s files.

Environment, never committed:

```
DATABASE_URL=postgresql://localhost/fundmatch_ai
PORT=3000
NODE_ENV=development
CLAUDE_API_KEY=
FRONTEND_URL=
```

`CLAUDE_API_KEY` is Kirt’s. Hritik still reserves the name in `.env.example` and in the host’s env dashboard.

## Hritik’s build order

1. **Scaffold.** `backend/` with Express, TypeScript, `cors`, `express.json()`, Zod, `pg`, dotenv. `GET /health` returns `{ status: "ok" }`. Scripts: `npm run dev`, and `npm run build && npm start`.
2. **Schema.** `backend/src/db/schema.sql` copied from doc 05, plus `migrate` that runs it against `DATABASE_URL`.
3. **Seed.** `backend/src/db/seed.sql` with the ten schemes above and at least five more. Re-running migrate against a fresh database succeeds.
4. **Profiles and schemes.** The three endpoints above. Invalid bodies return 400 with `details`. Unknown scheme ids return 404. List and detail use camelCase.
5. **Errors.** `errorHandler.ts` emits the 400 / 404 / 500 shapes from doc 05. One pool, no clustering.
6. **Handoff.** `GET /health`, `GET /api/schemes`, and `POST /api/profiles` work locally. Then deploy the API and Postgres (Railway or Render, as in doc 03) and confirm those three routes on the public URL. Leave `CLAUDE_API_KEY` set on the host for Kirt.

Done when:

- A valid profile returns 201 and a UUID.
- A missing field returns 400 with `details`.
- Scheme list count matches the seed.
- A bogus scheme UUID returns 404.
- Kirt can insert into `matches` and `action_plans` without a migration.

## Shashank’s build order

After the OpenAPI-less contract above is visible (mocked responses are fine on day one):

1. Landing, profile form (React Hook Form + Zod), loading state.
2. Results list of the top 10, ranked, with score and one-line reason.
3. Scheme detail: met, unmet, missing requirements, five-part breakdown.
4. Action plan view and client-side PDF (`jsPDF`). Filename pattern from the flow doc: `FundMatch_ActionPlan_<scheme>_<MonYYYY>.pdf`.
5. Loading, empty, and error copy from doc 02, including the fallback-mode message.
6. Deploy the frontend (Vercel) with `FRONTEND_URL` allowed by backend CORS.

He does not recompute eligibility in the client. He renders `compatibilityScore`, `eligibilityStatus`, and `fallbackMode` from the API.

## Kirt’s build order

Starts once profiles and schemes round-trip:

1. `claude.service.ts` — the two prompts from doc 04, JSON-only parse, timeout.
2. `matching.service.ts` — formula for all schemes, Claude for the top three, labels, persistence.
3. `POST /api/matches/analyze` and `GET /api/matches/:profileId/:schemeId`.
4. `actionPlan.service.ts` and `GET /api/action-plans/:profileId/:schemeId`, with a generic step list when Claude fails.
5. Pre-demo checks from doc 04: a high match, a partial match, a no-match, fallback when the API key is removed, and a second request that hits cache.

## Suggested day plan

The pitch deck’s clock (9:00–19:00) and the README’s phase times overlap. Use this sequence so the three tracks meet once:

| Block | Hritik | Kirt | Shashank |
|---|---|---|---|
| Setup | Express, Postgres, schema, seed | Read docs 04 and 05, prompt fixtures | App shell, form, mocked results |
| Middle | Profile and scheme routes, error handler | Formula scorer against the seed | Wire form to `POST /api/profiles` |
| Integration | Deploy API, freeze shared types | Analyze and action-plan routes | Real results, detail, PDF |
| Close | Fix contract bugs only | Fallback and cache | Jury path on the deployed URL |

## What not to build now

- FastAPI, Qdrant, taxonomy nodes, crawlers, Playwright, admin verification, JWT.
- Celery, Redis, Kubernetes, Prometheus, Sentry.
- A second score formula or a second scheme table.
- Live fetches from startupindia.gov.in or ministry sites.
- Auth, email, and a mobile app.

## Next product, after the demo

When the hackathon path is done, the system design in `fundmatchdocs/PS41-System-Design-Architecture.md` replaces per-request classification of the whole catalog.

Online path:

1. Parse the application into structured fields.
2. Map those fields **up** onto a fixed taxonomy (sector, stage, jurisdiction). Node ids only, never free-text labels.
3. **Stage 1.** SQL intersection of `startup_classifications` with `scheme_taxonomy_map`. This is the candidate set.
4. **Stage 2.** Evaluate `eligibility_rules` in code (`EQUALS`, `LTE`, `GTE`, and the rest). Send only ambiguous text to the LLM, and only with an `evidence_clause` retrieved from Qdrant.
5. Store `recommendations` and `recommendation_basis` (jurisdiction, taxonomy nodes, fields tested, rules satisfied, model confidence).

The example in `fundmatchdocs/examples/two-stage-match.example.json` is a stage-1 hit on `SEC_DEEPTECH` and `STG_EARLY_TRACTION` in Uttar Pradesh, then a stage-2 check of `dpiit_recognized` in code and `innovative_technology` against a cited clause.

Adopt the lean TRD for that build: Next.js 14, FastAPI, PostgreSQL 16, Qdrant, APScheduler inside the API process, JWT, Claude, Docker Compose for local Postgres and Qdrant. Frontend never queries the database or the model. Ingestion writes staging rows and promotes them only after admin verification.

### How today’s tables map later

| Now | Later |
|---|---|
| `profiles` | `users` + `startup_profiles` |
| sector / stage / location strings | `taxonomy_nodes` + `startup_classifications` |
| `schemes.eligible_*` arrays | `schemes` + `scheme_taxonomy_map` + `governing_bodies` + `regions` |
| `eligibility_criteria` JSONB | `eligibility_rules` rows, each optionally pointing at `evidence_clauses` |
| `matches` | `recommendations` + `recommendation_basis` |
| `action_plans` | action-plan records keyed the same way, generated from a deterministic gap list |

Do not migrate the demo schema until the four-table API is finished. The mapping above is the seam, not a task for this build.
