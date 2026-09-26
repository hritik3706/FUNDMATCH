# PS41 — Technical Requirements Document (TRD)
## Work Division: Frontend / Backend / Database + Final Tech Stack

This TRD turns the system design into three clearly-bounded workstreams so teams can build in parallel **without overlapping responsibilities or blocking each other**. It also locks in one solid, production-grade tech stack (not "pick from options") chosen specifically to avoid breakpoints at scale.

---

## 1. Why One Locked Stack (not multiple options)

A previous doc gave an MVP-vs-production choice. For actual build-out, mixing stacks creates the exact "overlapping glitches" you want to avoid (two ORMs, two auth systems, two deployment pipelines). So this TRD picks **one stack for everything**, sized for production from day one, with MVP just meaning "fewer sectors/states enabled," not "different technology."

---

## 2. Final Tech Stack (locked)

| Layer | Technology | Why this, specifically |
|---|---|---|
| Frontend framework | **Next.js 14 (App Router) + TypeScript** | SSR for fast first paint on dashboards, file-based routing matches the 11-page flow, TS prevents contract drift with backend types |
| UI/styling | **Tailwind CSS + shadcn/ui** | No CSS overlap/specificity bugs across pages; shadcn gives accessible primitives instead of hand-rolled components that break at scale |
| Frontend state/data | **TanStack Query (React Query) + Zustand** | React Query owns all server-state (caching, retries, dedupe) so the same scheme data isn't re-fetched inconsistently across pages; Zustand owns only local UI state — clean split prevents state-overlap bugs |
| API contract | **OpenAPI 3.1 spec, generated types on both sides** | Frontend and backend never hand-write matching types; a schema change breaks the build immediately instead of glitching silently in production |
| Backend framework | **Python + FastAPI** | Async-native (handles concurrent LLM/RAG calls without blocking), same language as the AI/ingestion pipeline so no serialization overhead between "AI service" and "API service" |
| Background jobs / ingestion | **Celery + Redis (broker)** | Crawling, PDF extraction, taxonomy classification, and re-sync all run as retryable, isolated tasks — a stuck ingestion job can never block user-facing API requests |
| Structured database | **PostgreSQL 16** | ACID guarantees for eligibility rules, relational integrity for the Scheme↔Taxonomy↔Ministry↔Region joins that are core to this design; mature, battle-tested at scale |
| Vector database | **Qdrant** (self-hosted or cloud) | Purpose-built vector DB, not bolted onto Postgres — keeps clause-evidence search scaling independently from transactional load, so a heavy semantic search never slows down normal API traffic |
| Cache | **Redis** (separate instance/namespace from Celery broker) | Caches the hot (sector, stage, state) → candidate-scheme-set lookups; sub-millisecond repeat queries |
| Auth | **Auth via FastAPI + JWT (access/refresh) + OAuth2 for admin SSO** | One auth system for both user and admin portals — no second identity provider to keep in sync |
| LLM provider | **Anthropic Claude API** (Sonnet for extraction/classification, used consistently everywhere) | One model family across ingestion, classification, and eligibility reasoning keeps prompt/response formats consistent, avoids cross-model quirks causing subtle mismatches |
| PDF/document processing | **PyMuPDF + pdfplumber**, OCR fallback via **Tesseract** | Handles both text-native and scanned government PDFs in the same pipeline stage |
| Crawler | **Playwright (Python)** | Handles JS-rendered government portals that plain `requests` can't, avoided as a separate stack from the rest of the backend |
| Containerization | **Docker + Docker Compose (dev) → Kubernetes (prod)** | Every service (API, worker, Postgres, Redis, Qdrant) runs identically in dev and prod — eliminates "works on my machine" breakpoints |
| CI/CD | **GitHub Actions** | Runs contract tests (OpenAPI diff), DB migration checks, and integration tests before merge — catches frontend/backend drift before deployment, not after |
| Monitoring/observability | **Sentry (errors) + Prometheus/Grafana (metrics) + structured logging (JSON logs)** | Every layer reports into the same observability stack, so a glitch anywhere is traceable to a specific service, not a mystery |
| Hosting | **AWS** (ECS/EKS for compute, RDS for Postgres, ElastiCache for Redis, S3 for raw documents) | Single cloud vendor for all pieces avoids cross-cloud latency/consistency issues |

**Rule enforced across all three teams:** nobody hand-builds a second database, a second cache, a second auth flow, or a second job queue "just for their part." Everything above is shared infrastructure with one owner (see §6).

---

## 3. Work Division Overview

```
                 ┌─────────────────────────┐
                 │   OpenAPI Contract       │   ← frozen early, versioned,
                 │  (source of truth for    │      changes require sign-off
                 │   all 3 teams)           │      from backend + frontend leads
                 └─────────────────────────┘
        ↑                    ↑                      ↑
   FRONTEND TEAM        BACKEND TEAM           DATABASE/DATA TEAM
   (consumes API        (implements API,       (owns schema, indexes,
    contract only,       orchestrates agents,   ingestion pipeline,
    never touches DB      talks to DB/vector      vector DB, migrations)
    directly)             DB)
```

The single rule that prevents overlap: **Frontend never queries the database directly and never calls the LLM directly — everything goes through the versioned API contract.** Backend never designs UI state. Database/Data team never writes API route logic — they expose data through backend service interfaces only.

---

## 4. Frontend Workstream

### 4.1 Scope
Everything the user/admin sees and interacts with. No business logic, no eligibility rules, no DB access — pure presentation + API consumption.

### 4.2 Deliverables (mapped to the 11-page flow)
1. **Onboarding flow** — NL text input + structured form, client-side validation only (real validation happens backend-side too).
2. **Profile review page** — editable summary of extracted fields, diff view for "AI-filled vs. user-confirmed."
3. **Classification results page** — shows Current-state vs. Future-intent taxonomy paths side-by-side.
4. **Scheme discovery page** — triggers `POST /schemes/match`, shows loading/streaming state while backend runs the pipeline.
5. **Ministry-wise results page** — renders the grouping **exactly as returned by the API** (no client-side re-grouping logic — that would duplicate backend logic and cause the two to drift, which is the "overlap glitch" to avoid).
6. **Scheme detail page** — shows benefits, eligibility rules, and evidence clauses with source links.
7. **Eligibility analysis page** — status badges (`ELIGIBLE_NOW`, etc.), matched/unmatched criteria.
8. **Gap analysis page** — satisfied/missing/unknown, color-coded.
9. **Action roadmap page** — ordered steps with dependencies, links, deadlines.
10. **Saved schemes/applications page** — user's saved list + application status tracking.
11. **Admin verification console** (separate app or role-gated section) — review queue for newly ingested/changed schemes.

### 4.3 Frontend engineering rules
- All server data fetched via React Query hooks generated from the OpenAPI spec — never hand-written `fetch` calls with hardcoded shapes.
- No business/eligibility logic duplicated in the frontend (e.g., don't recompute "is this scheme a match" client-side — always trust the backend response).
- Component library locked to shadcn/ui primitives to avoid style conflicts between pages built by different developers.
- Error/loading/empty states are mandatory for every data-fetching component (prevents the "glitchy blank screen" class of bugs).

---

## 5. Backend Workstream

### 5.1 Scope
All business logic, orchestration, agent calls, and the only layer allowed to talk to Postgres, Qdrant, and the LLM.

### 5.2 Services & ownership
| Service | Responsibility |
|---|---|
| Auth Service | Login, JWT issue/refresh, RBAC (user vs. admin) |
| Startup Profile Service | CRUD on profile, validation, missing-field detection |
| Classification Service | Calls LLM to map startup → taxonomy node IDs (current + future) |
| Taxonomy/Matching Service | **Deterministic** lookup: intersects startup's taxonomy path against pre-built `SchemeTaxonomyMap` indexes |
| Scheme Catalog Service | Read API over the pre-bifurcated catalog (sector/ministry/region browse) |
| Government Data Ingestion Service | Orchestrates Celery tasks: crawl → extract → classify → verify → publish |
| RAG Service | Vector search against Qdrant for evidence clauses only (never for primary matching) |
| Eligibility Engine | Rule evaluation (deterministic) + LLM clause interpretation (narrow, evidence-bound) |
| Recommendation Engine | Ranks matched schemes, builds the "why" explanation |
| Gap Analysis Service | Deterministic diff of satisfied vs. missing criteria |
| Action Planner | LLM-assisted ordering of remediation steps over a deterministic gap list |
| Notification Service | Deadline reminders, status changes |
| Admin Service | Verification queue CRUD, manual taxonomy overrides |

### 5.3 Backend engineering rules
- Every service exposes its interface through FastAPI routers registered under the single OpenAPI spec — no service invents its own ad hoc response shape.
- All LLM calls are wrapped with: input sanitization (strip injected instructions from scraped text), structured-output enforcement (JSON schema validation on every LLM response before it's trusted), and a fallback to `INSUFFICIENT_DATA`/`Evidence unavailable` on parse failure — never a silent guess.
- Long-running work (ingestion, re-classification) is **always** a Celery task, never inline in a request handler — this is what prevents a slow crawl from ever becoming a user-facing timeout/glitch.
- Idempotency keys on all write endpoints (`POST /schemes/match`, `POST /eligibility/analyze`) so retried requests from a flaky frontend never double-process.

---

## 6. Database & Data Workstream

### 6.1 Scope
Schema design, migrations, indexing strategy, the ingestion pipeline's data output, and the vector DB — the single source of truth all backend services read/write through.

### 6.2 Ownership boundaries
- **Sole owner of**: Postgres schema/migrations, `SchemeTaxonomyMap` (the pre-bifurcation table), all indexes, Qdrant collections, Redis cache-key conventions.
- **Never owns**: API route logic, LLM prompt design, frontend rendering. (Ingestion *extraction* logic is shared with backend since it runs as backend Celery tasks, but the *schema* those tasks write into is owned here.)

### 6.3 Deliverables
1. Full Postgres schema (from the system design doc: `Users`, `StartupProfiles`, `TaxonomyNode`, `Ministries`, `Departments`, `Regions`, `Schemes`, `SchemeTaxonomyMap`, `EligibilityRules`, `Benefits`, `Documents`, `EvidenceClauses`, `Recommendations`, `EligibilityResults`, `ActionPlans`, `Applications`, `DataSyncLogs`) with migration scripts (Alembic).
2. Composite indexes for the hot path: `(sector_node_id, stage_id, state_id)` on `SchemeTaxonomyMap`, plus `(ministry_id, status)` and `(state_id, status)` on `Schemes`.
3. Qdrant collection schema for `EvidenceClauses` (chunked, with `scheme_id`, `page`, `clause_id` as payload metadata for exact traceability).
4. Redis key convention doc (e.g., `match:{sector}:{stage}:{state} → candidate_scheme_ids`) with TTL rules tied to the ingestion re-sync schedule (cache invalidated automatically on catalog update, never manually).
5. Seed/versioning strategy: every schema change ships with a reversible migration and a data-backfill script if taxonomy nodes are renumbered.

### 6.4 Database engineering rules
- No table is ever queried directly by frontend — enforced at the network/infra level (DB only reachable from backend service subnet).
- Every foreign key has an explicit `ON DELETE` policy defined (no orphaned rows from cascading deletes causing silent data glitches).
- All schema changes go through migration review by both backend and database leads before merge, since backend services depend on the exact column contracts.

---

## 7. Cross-Team Integration Points (where overlap bugs usually happen — locked down explicitly)

| Integration point | Rule to prevent overlap/glitches |
|---|---|
| Frontend ↔ Backend | OpenAPI spec is the only contract; breaking changes require a version bump (`/v1/`, `/v2/`), old version stays live until frontend migrates |
| Backend ↔ Database | Backend uses one ORM (SQLAlchemy) with models mirrored 1:1 to the DB team's schema — no service writes raw SQL that bypasses the shared models |
| Backend ↔ Vector DB | Only the RAG Service talks to Qdrant; other services request evidence through the RAG Service's internal interface, never connect to Qdrant directly |
| Ingestion pipeline ↔ Live catalog | Ingestion writes to a **staging** schema first; promotion to production tables happens only after admin verification — the live catalog is never touched by an in-progress crawl |
| Caching ↔ Freshness | Cache keys are versioned by `catalog_version`; a new ingestion run bumps the version, automatically invalidating stale cache entries instead of relying on manual cache-busting |

---

## 8. Non-Functional Requirements (stack-level)

- **No single point of failure**: Celery workers and FastAPI instances run as multiple replicas behind a load balancer; Postgres has read replicas; Redis runs in cluster mode in production.
- **Graceful degradation**: if Qdrant is unreachable, eligibility falls back to rule-only evaluation with an explicit "evidence temporarily unavailable" flag, rather than failing the whole request.
- **Backpressure**: Celery queues have max-length + dead-letter queues so a burst of ingestion jobs can't starve user-facing API workers (separate queue names/priorities for "ingestion" vs. "user-request" tasks).
- **Schema safety**: all migrations are backward-compatible for at least one deploy cycle (additive-first) so backend and frontend can roll out independently without a hard synchronized deploy.

---

## 9. Suggested Team Split & Sequencing

1. **Week 1**: DB team ships initial schema + `SchemeTaxonomyMap`; Backend team scaffolds FastAPI services + OpenAPI spec skeleton; Frontend team scaffolds Next.js app against a mocked API (using the OpenAPI spec, not real backend) — all three run in parallel with zero blocking.
2. **Week 2–3**: Backend implements Taxonomy/Matching + Eligibility services against real DB; Frontend swaps mocked API for real endpoints page by page; DB team builds ingestion pipeline in parallel (separate Celery queue, doesn't block API work).
3. **Week 4**: Integration testing across all three; contract tests in CI catch any drift automatically before this stage even starts manual QA.

---

*End of TRD.*
