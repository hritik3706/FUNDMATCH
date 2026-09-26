# PS41 — Technical Requirements Document (TRD)
## Work Division: Frontend / Backend / Database + Core Tech Stack

This TRD turns the system design into three clearly-bounded workstreams so teams can build in parallel **without overlapping responsibilities or blocking each other**. The stack below is deliberately lean — only what's needed to make the actual product work (profile → classify → match → eligibility → gap → roadmap). No job-queue infra, no dedicated cache layer, no CI/CD tooling, no monitoring stack, no hosting decisions — those are operational concerns to bolt on later, not things the core system depends on to function.

---

## 1. Core Tech Stack (locked)

| Layer | Technology | Why this, specifically |
|---|---|---|
| Frontend framework | **Next.js 14 (App Router) + TypeScript** | SSR for fast first paint on dashboards, file-based routing matches the 11-page flow, TS prevents contract drift with backend types |
| UI/styling | **Tailwind CSS + shadcn/ui** | No CSS overlap/specificity bugs across pages; shadcn gives accessible primitives instead of hand-rolled components that break at scale |
| Frontend state/data | **TanStack Query (React Query) + Zustand** | React Query owns all server-state (caching, retries, dedupe) so the same scheme data isn't re-fetched inconsistently across pages; Zustand owns only local UI state — clean split prevents state-overlap bugs |
| API contract | **OpenAPI 3.1 spec, generated types on both sides** | Frontend and backend never hand-write matching types; a schema change breaks the build immediately instead of glitching silently in production |
| Backend framework | **Python + FastAPI** | Async-native (handles concurrent LLM/RAG calls without blocking the whole process), same language as the ingestion/classification pipeline so there's no serialization overhead between "AI logic" and "API logic" |
| Scheduled/background work | **FastAPI `BackgroundTasks` for short async jobs + APScheduler (in-process) for the periodic ingestion re-sync** | Ingestion runs on a schedule (e.g., nightly/weekly) inside the backend process itself — no separate broker or worker fleet to operate or debug; simplest thing that still keeps long crawls off the request/response path |
| Structured database | **PostgreSQL 16** | ACID guarantees for eligibility rules, relational integrity for the Scheme↔Taxonomy↔Ministry↔Region joins that are core to this design; mature and predictable |
| Vector database | **Qdrant** (single instance) | Purpose-built vector search for evidence clauses, kept separate from Postgres so semantic search never competes with transactional queries |
| Auth | **FastAPI + JWT (access/refresh)** | One simple auth mechanism for both user and admin roles — no second identity system to keep in sync |
| LLM provider | **Anthropic Claude API**, used consistently for extraction, classification, and eligibility reasoning | One model family everywhere keeps prompt/response formats consistent and avoids cross-model quirks |
| PDF/document processing | **PyMuPDF + pdfplumber**, OCR fallback via **Tesseract** | Handles both text-native and scanned government PDFs in the same pipeline stage |
| Crawler | **Playwright (Python)** | Handles JS-rendered government portals, lives in the same backend codebase/language as everything else |
| Containerization (optional, dev convenience) | **Docker Compose** | Runs Postgres + Qdrant + the API together identically for every developer — not a deployment strategy, just an "it works the same on every machine" guarantee |

**Rule enforced across all three teams:** nobody stands up a second database, a second auth flow, or a second scheduling mechanism "just for their part." This is the full set of moving pieces — anything not listed here isn't needed for the system to work.

---

## 2. Work Division Overview

```
                 ┌─────────────────────────┐
                 │   OpenAPI Contract       │   ← frozen early, versioned,
                 │  (source of truth for    │      changes require sign-off
                 │   all 3 teams)           │      from backend + frontend leads
                 └─────────────────────────┘
        ↑                    ↑                      ↑
   FRONTEND TEAM        BACKEND TEAM           DATABASE/DATA TEAM
   (consumes API        (implements API,       (owns schema, indexes,
    contract only,       orchestrates agents,   ingestion pipeline output,
    never touches DB      talks to DB/vector      vector DB, migrations)
    directly)             DB)
```

The single rule that prevents overlap: **Frontend never queries the database directly and never calls the LLM directly — everything goes through the versioned API contract.** Backend never designs UI state. Database/Data team never writes API route logic — they expose data through backend service interfaces only.

---

## 3. Frontend Workstream

### 3.1 Scope
Everything the user/admin sees and interacts with. No business logic, no eligibility rules, no DB access — pure presentation + API consumption.

### 3.2 Deliverables (mapped to the 11-page flow)
1. **Onboarding flow** — NL text input + structured form, client-side validation only (real validation happens backend-side too).
2. **Profile review page** — editable summary of extracted fields, diff view for "AI-filled vs. user-confirmed."
3. **Classification results page** — shows Current-state vs. Future-intent taxonomy paths side-by-side.
4. **Scheme discovery page** — triggers `POST /schemes/match`, shows loading state while backend runs the pipeline.
5. **Ministry-wise results page** — renders the grouping **exactly as returned by the API** (no client-side re-grouping logic — that would duplicate backend logic and cause the two to drift).
6. **Scheme detail page** — shows benefits, eligibility rules, and evidence clauses with source links.
7. **Eligibility analysis page** — status badges (`ELIGIBLE_NOW`, etc.), matched/unmatched criteria.
8. **Gap analysis page** — satisfied/missing/unknown, color-coded.
9. **Action roadmap page** — ordered steps with dependencies, links, deadlines.
10. **Saved schemes/applications page** — user's saved list + application status tracking.
11. **Admin verification console** (role-gated section) — review queue for newly ingested/changed schemes.

### 3.3 Frontend engineering rules
- All server data fetched via React Query hooks generated from the OpenAPI spec — never hand-written `fetch` calls with hardcoded shapes.
- No business/eligibility logic duplicated in the frontend — always trust the backend response for match/eligibility status.
- Component library locked to shadcn/ui primitives to avoid style conflicts between pages built by different developers.
- Error/loading/empty states are mandatory for every data-fetching component.

---

## 4. Backend Workstream

### 4.1 Scope
All business logic, orchestration, agent calls, and the only layer allowed to talk to Postgres, Qdrant, and the LLM.

### 4.2 Services & ownership
| Service | Responsibility |
|---|---|
| Auth Service | Login, JWT issue/refresh, role check (user vs. admin) |
| Startup Profile Service | CRUD on profile, validation, missing-field detection |
| Classification Service | Calls LLM to map startup → taxonomy node IDs (current + future) |
| Taxonomy/Matching Service | **Deterministic** lookup: intersects startup's taxonomy path against the pre-built `SchemeTaxonomyMap` |
| Scheme Catalog Service | Read API over the pre-bifurcated catalog (sector/ministry/region browse) |
| Government Data Ingestion Service | Runs on the APScheduler timer: crawl → extract → classify → verify → publish |
| RAG Service | Vector search against Qdrant for evidence clauses only (never for primary matching) |
| Eligibility Engine | Rule evaluation (deterministic) + LLM clause interpretation (narrow, evidence-bound) |
| Recommendation Engine | Ranks matched schemes, builds the "why" explanation |
| Gap Analysis Service | Deterministic diff of satisfied vs. missing criteria |
| Action Planner | LLM-assisted ordering of remediation steps over a deterministic gap list |
| Admin Service | Verification queue CRUD, manual taxonomy overrides |

### 4.3 Backend engineering rules
- Every service exposes its interface through FastAPI routers registered under the single OpenAPI spec — no service invents its own ad hoc response shape.
- All LLM calls are wrapped with: input sanitization (strip injected instructions from scraped text), structured-output enforcement (JSON schema validation on every LLM response before it's trusted), and a fallback to `INSUFFICIENT_DATA`/`Evidence unavailable` on parse failure — never a silent guess.
- The ingestion crawl runs as a scheduled background task, never inline in a user-facing request handler — this is what keeps a slow crawl from ever becoming a request timeout.
- Idempotency checks on write endpoints (`POST /schemes/match`, `POST /eligibility/analyze`) so a repeated/retried request from the frontend never double-processes.

---

## 5. Database & Data Workstream

### 5.1 Scope
Schema design, migrations, indexing strategy, the ingestion pipeline's data output, and the vector DB — the single source of truth all backend services read/write through.

### 5.2 Ownership boundaries
- **Sole owner of**: Postgres schema/migrations, `SchemeTaxonomyMap` (the pre-bifurcation table), all indexes, the Qdrant collection.
- **Never owns**: API route logic, LLM prompt design, frontend rendering.

### 5.3 Deliverables
1. Full Postgres schema: `Users`, `StartupProfiles`, `TaxonomyNode`, `Ministries`, `Departments`, `Regions`, `Schemes`, `SchemeTaxonomyMap`, `EligibilityRules`, `Benefits`, `Documents`, `EvidenceClauses`, `Recommendations`, `EligibilityResults`, `ActionPlans`, `Applications`, `DataSyncLogs` — with migration scripts (Alembic).
2. Composite indexes for the hot matching path: `(sector_node_id, stage_id, state_id)` on `SchemeTaxonomyMap`, plus `(ministry_id, status)` and `(state_id, status)` on `Schemes`.
3. Qdrant collection schema for `EvidenceClauses` (chunked, with `scheme_id`, `page`, `clause_id` as payload metadata for exact traceability).
4. A `catalog_version` field bumped on every successful ingestion run, so any downstream consumer can tell whether the data it's looking at is current.
5. Seed/versioning strategy: every schema change ships with a reversible migration and a backfill script if taxonomy nodes are renumbered.

### 5.4 Database engineering rules
- No table is ever queried directly by the frontend — only the backend has DB credentials.
- Every foreign key has an explicit `ON DELETE` policy defined (no orphaned rows from cascading deletes).
- Schema changes go through review by both backend and database leads before merge, since backend services depend on the exact column contracts.
- Ingestion writes to a **staging** set of tables first; promotion to the live tables happens only after admin verification — the live catalog is never touched mid-crawl.

---

## 6. Cross-Team Integration Points (where overlap bugs usually happen — locked down explicitly)

| Integration point | Rule to prevent overlap/glitches |
|---|---|
| Frontend ↔ Backend | OpenAPI spec is the only contract; breaking changes require a version bump (`/v1/`, `/v2/`), old version stays live until frontend migrates |
| Backend ↔ Database | Backend uses one ORM (SQLAlchemy) with models mirrored 1:1 to the DB team's schema — no service writes raw SQL that bypasses the shared models |
| Backend ↔ Vector DB | Only the RAG Service talks to Qdrant; other services request evidence through the RAG Service's internal interface |
| Ingestion pipeline ↔ Live catalog | Ingestion writes to staging tables first; promotion to production happens only after admin verification |
| Frontend data freshness | Frontend reads `catalog_version` from the API response and shows a subtle "last updated" indicator — no separate cache-invalidation system needed since Postgres is always the live source of truth |

---

## 7. What Was Intentionally Left Out (and why it's safe to skip for now)

- **No Celery/Redis broker**: ingestion runs infrequently (scheduled, not per-request), so an in-process scheduler is enough; a distributed queue adds an extra moving part with nothing to justify it yet.
- **No dedicated cache layer**: Postgres with the composite indexes above answers the matching query fast enough on its own at this scale; add a cache only if a specific query proves slow under real load.
- **No CI/CD pipeline spec**: not a system-functionality concern — use whatever the team already runs tests and deploys with; it doesn't change how the product works.
- **No monitoring/observability stack**: useful operationally, but not required for the system to function correctly; add logging/alerting once the core flow is live and stable.
- **No hosting decision**: the stack above runs the same regardless of where it's deployed — defer this choice until the team is ready to ship.

---

## 8. Suggested Sequencing

1. DB team ships the initial schema + `SchemeTaxonomyMap`; Backend team scaffolds FastAPI services + the OpenAPI spec skeleton; Frontend team scaffolds Next.js against a mocked API from that same spec — all three run in parallel with zero blocking.
2. Backend implements Taxonomy/Matching + Eligibility services against the real DB; Frontend swaps the mocked API for real endpoints page by page; DB team builds the ingestion job in parallel (it's just a scheduled function, so it doesn't block API work).
3. Integration pass across all three once every endpoint in the spec is implemented on both ends.

---

*End of TRD.*
