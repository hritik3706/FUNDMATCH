# PS41 — Startup Scheme & Funding Agent
## System Design & Architecture Document

**Core design decision this document is built around:**
We do **not** classify government schemes on-the-fly per user request. Instead, we **pre-bifurcate the entire universe of government schemes offline**, once, into a fixed taxonomy — by **Sector → Sub-sector**, by **Ministry/Department**, and by **State/Region** — and store that as a structured, queryable index. At query time, we only classify the *user's* startup profile into the same taxonomy and do a **lookup/intersection join**, not a fresh classification of thousands of schemes. This makes matching fast, cheap, deterministic, and auditable, and keeps the expensive AI work (scheme extraction) as a one-time/offline ingestion cost rather than a per-request cost.

---

## 1. Problem Definition

Indian startups struggle to discover which of the hundreds of central and state government schemes apply to them, because:
- Scheme information is scattered across dozens of ministry/department/state websites, PDFs, and notifications.
- Eligibility rules are written in dense legal/bureaucratic language.
- A startup's eligibility depends on many interacting factors (sector, stage, DPIIT status, founder demographics, revenue, location, etc.).
- Naive keyword search returns irrelevant results and misses schemes that use different terminology for the same sector.

**PS41 solves this by**: (a) building a pre-classified, sector/ministry/region-bifurcated scheme catalog sourced only from official government sources, and (b) classifying each startup into the same taxonomy, then running a deterministic + AI-assisted eligibility match against only the relevant slice of the catalog.

---

## 2. Product Objectives

1. Classify a startup's sector, sub-sector, stage, and future intent from natural language + structured input.
2. Maintain a **pre-built, sector/ministry/region-bifurcated catalog** of official government schemes (not built fresh per query).
3. Match the startup's classification against this catalog via indexed lookup, not full re-classification.
4. Run rule-based + evidence-backed eligibility evaluation on the matched subset.
5. Separate **current eligibility** from **future potential eligibility**.
6. Produce ministry-grouped, cited, gap-annotated, action-planned recommendations.
7. Never let the LLM invent eligibility facts — every claim traces to an official source clause.

---

## 3. Functional Requirements

- FR1: Accept natural-language startup history + structured onboarding fields.
- FR2: Extract structured profile fields; ask targeted follow-ups for missing required fields.
- FR3: Classify startup into the **shared sector/sub-sector/technology taxonomy**.
- FR4: Classify separately: Current State taxonomy path vs. Future Intent taxonomy path.
- FR5: Maintain a pre-bifurcated scheme catalog, indexed by:
  - Sector → Sub-sector
  - Ministry → Department
  - Central vs. State, and State/District
  - Startup stage, funding type
- FR6: Given a startup's taxonomy path(s), retrieve the pre-bucketed candidate scheme set via index lookup (O(1)/O(log n)), not full-corpus re-scan.
- FR7: Run eligibility engine (rules + RAG evidence) only on the retrieved candidate set.
- FR8: Output ministry-grouped, ranked, cited recommendations with status labels: `ELIGIBLE_NOW`, `POTENTIALLY_ELIGIBLE_AFTER_ACTION`, `FUTURE_OPPORTUNITY`, `NOT_ELIGIBLE`, `INSUFFICIENT_DATA`.
- FR9: Produce gap analysis and an action roadmap per scheme.
- FR10: Refresh the pre-built taxonomy/catalog on a schedule (not per user request) via ingestion pipeline.

## 4. Non-Functional Requirements

- **Accuracy over recall**: fewer, correct, cited matches beat many speculative ones.
- **Auditability**: every scheme record and eligibility decision must be traceable to a source document + clause.
- **Low query-time cost**: because classification of the scheme corpus happens offline/once, user-facing queries should be fast (target: match retrieval < 500ms, full eligibility pass < 5–10s including LLM calls on the small candidate set).
- **Freshness**: catalog re-synced on schedule with change detection.
- **Extensibility**: adding a new ministry/state/sector should not require re-architecting.
- **Security**: prompt-injection and RAG-poisoning resistant, since ingestion touches scraped/untrusted government-adjacent pages.

---

## 5. User Journey

```
User
 ↓
Natural-language startup history + structured onboarding
 ↓
Profile extraction (AI) + follow-up questions (deterministic gap-check)
 ↓
Startup Classification into SHARED TAXONOMY
   (Current-state path AND Future-intent path, separately)
 ↓
Taxonomy Lookup against PRE-BUILT, PRE-BIFURCATED Scheme Catalog
   (Sector index ∩ Ministry index ∩ Region index)
 ↓
Candidate Scheme Set (small, relevant subset — not full corpus)
 ↓
Eligibility Engine (rules-first, RAG-evidence for nuance)
 ↓
Ministry-wise grouping of results
 ↓
Gap Analysis
 ↓
Action Roadmap
 ↓
Personalized, cited, ministry-grouped dashboard
```

---

## 6. The Shared Taxonomy — the Core Design Artifact

Both **schemes** and **startups** are classified into the *same* taxonomy tree, built once and reused everywhere. This is what makes "pre-bifurcated matching" possible instead of ad-hoc comparison.

```
Taxonomy
 ├── Sector (e.g., Healthcare, Agritech, Manufacturing, Deep-Tech, FinTech, CleanTech...)
 │     └── Sub-sector (e.g., Digital Health, Med-Devices, Agri-drones, EV, Biotech...)
 │           └── Technology tags (AI/ML, IoT, Blockchain, Robotics, Drones...)
 ├── Startup Stage (Ideation, Validation, Early Traction, Growth, Scale)
 ├── Funding Type Needed (Grant, Loan, Equity, Credit Guarantee, Subsidy, Incubation)
 ├── Geographic Scope (Pan-India, State-specific, District/Rural/Urban/Aspirational-district)
 ├── Impact Area (Women-led, SC/ST, Rural, Export-oriented, Employment-generation, R&D, Green/Climate)
 └── Ministry / Department (organizational axis, orthogonal to sector)
```

**Key rule:** this taxonomy is versioned and centrally owned. Both the **Scheme Classification Job** (offline) and the **Startup Classification Agent** (online, per user) map their inputs onto the *same enumerated node IDs* — never free-text labels — so matching is a set-intersection on IDs, not a semantic guess at query time.

---

## 7. Pre-Bifurcated Government Scheme Catalog (Offline Build)

### 7.1 Why pre-bifurcation, not per-query classification

- Classifying ~1,000+ schemes against a taxonomy is expensive and slow — doing it once (and re-doing only on change-detection) amortizes that cost.
- It lets us **manually/admin-verify** each scheme's taxonomy placement, which matters for a government-information product.
- It turns "find schemes for this startup" into a **fast indexed lookup**, not an LLM re-classification of the whole scheme corpus every time.
- It naturally produces the Ministry-wise, Sector-wise, State-wise views the frontend needs — they are pre-computed indexes, not runtime joins across raw text.

### 7.2 Offline pipeline (runs on schedule / on change-detection, NOT per user)

```
Official Source Registry (per ministry/state, curated list of URLs/APIs)
        ↓
Crawler / Fetcher  (scheduled, polite, versioned)
        ↓
Document Extraction (HTML/PDF/notification parsing)
        ↓
Chunking + Metadata Extraction
        ↓
Scheme Extraction Agent (LLM-assisted, but output is STRUCTURED + reviewed)
        ↓
Taxonomy Classification Job — tags each scheme with:
   Sector node(s), Sub-sector node(s), Ministry/Dept, Region/State, Stage, Impact tags
        ↓
Admin Verification Queue (human review for new/changed schemes)
        ↓
Structured Scheme Database  +  Vector DB (for clause-level evidence)
        ↓
Pre-built Indexes:
   Sector Index | Ministry Index | Region Index | Stage Index | Combined composite index
```

This produces, ahead of any user interaction, structures like:

```
Sector Index
 Healthcare
   ├── Digital Health   → [Scheme_012, Scheme_045, Scheme_101, ...]
   ├── MedTech Devices   → [Scheme_017, Scheme_063, ...]
 Agritech
   ├── Precision Farming → [Scheme_022, ...]
   ├── Agri-Drones       → [Scheme_090, ...]

Ministry Index
 Ministry of MSME        → [Scheme_A, Scheme_B, ...]
 Dept. of Biotechnology  → [Scheme_C, ...]
 MeitY                   → [Scheme_E, ...]

Region Index
 Uttar Pradesh (State)   → [Scheme_F, Scheme_UP_State_1, ...]
 Pan-India (Central)     → [Scheme_A, Scheme_C, Scheme_E, ...]
```

These indexes are the "pre-fetched, pre-bucketed" data structures the user asked for — built once, updated on schedule, queried cheaply at request time.

### 7.3 When to use which ingestion method

| Source type | Method |
|---|---|
| Government scheme listing page (HTML) | Scheduled scraper + structured HTML extraction |
| Official PDF guidelines/notifications | PDF text + layout extraction, page/clause indexing |
| Government API (rare but preferred when it exists) | Direct API ingestion, highest trust tier |
| State portals with inconsistent structure | Semi-manual/admin-assisted extraction, flagged lower-confidence |
| Ambiguous/contradictory scheme text | Route to human/admin verification queue before publishing |

---

## 8. Scheme Knowledge Model (Data Schema)

```
Scheme
 ├── scheme_id (PK)
 ├── name
 ├── ministry_id (FK → Ministry)
 ├── department_id (FK → Department)
 ├── government_level: CENTRAL | STATE
 ├── state_id (nullable, FK → Region)
 ├── official_source_url
 ├── source_document_id (FK → Document)
 ├── last_verified_at / last_updated_at / source_version
 ├── data_confidence: HIGH | MEDIUM | LOW
 ├── status: ACTIVE | EXPIRED | DRAFT | UNVERIFIED
 ├── objective (short text)
 ├── taxonomy_tags: [sector_node_id...], [sub_sector_node_id...], [stage_id...], [impact_tag_id...]
 │
 ├── EligibilityRule (1..n)
 │     ├── field (e.g. dpiit_required, min_incorporation_years, sector, revenue_cap)
 │     ├── operator (=, >=, <=, IN, NOT_IN)
 │     ├── value
 │     ├── clause_reference (page/section in source doc)
 │
 ├── Benefit (1..n): type (grant/loan/subsidy/equity/credit_guarantee/tax/infra/mentorship), amount_min, amount_max
 │
 ├── ApplicationInfo
 │     ├── portal_url, required_documents[], process_steps[], deadline, contact_info
 │
 └── EvidenceClause (1..n)
       ├── requirement_text
       ├── source_document_id, page, clause_id
       ├── official_url
```

Related tables: `Ministry`, `Department`, `Region(State/District)`, `Document`, `TaxonomyNode`, `SchemeTaxonomyMap` (many-to-many join — this join table *is* the pre-bifurcation), `DataSyncLog`.

**Indexes:** `SchemeTaxonomyMap(sector_node_id)`, `Scheme(ministry_id)`, `Scheme(state_id)`, `Scheme(status, data_confidence)`, full-text/vector index on `EvidenceClause`.

---

## 9. Startup Profile & Classification (Online, Per User)

Only the *startup* is classified at request time — against the same `TaxonomyNode` table the schemes were pre-tagged with.

```
Startup Profile
 ├── identity: name, founders, incorporation status/date, DPIIT recognition
 ├── classification: sector_node_id, sub_sector_node_id, technology_tags[], stage_id
 ├── business: business_model, revenue, funding_history, current_funding_need, employee_count
 ├── location: state_id, district_id, rural/urban
 ├── founder attributes (collected only where a scheme legitimately requires it: women-led, SC/ST/minority, etc.)
 ├── impact: R&D, IP, export_plans, employment_generation, environmental/social impact
 ├── CURRENT STATE classification path (sector/sub-sector/stage nodes)
 └── FUTURE INTENT classification path (separate sector/sub-sector/stage nodes)
```

**Required vs Optional vs Scheme-specific:**
- *Required*: sector, stage, location, incorporation status, funding need — needed for any matching at all.
- *Optional*: revenue, employee count, IP, export plans — improve match precision.
- *Scheme-specific*: founder demographic details, rural certification, women-led status — only requested when a candidate scheme's rule set actually needs it (asked contextually, not upfront, to minimize unnecessary sensitive-data collection).

---

## 10. Matching Flow (the actual "pre-bifurcated lookup")

```
Startup classified into: Sector_X, Sub-sector_Y, Stage_Z, State_UP, Impact_tags[...]
        ↓
Lookup: Sector Index[Sector_X] ∩ Region Index[State_UP or Pan-India] ∩ Stage Index[Stage_Z]
        ↓
Candidate Scheme Set (small, pre-vetted subset — typically tens, not thousands)
        ↓
Run Eligibility Engine only on this candidate set
        ↓
Repeat lookup using FUTURE INTENT path → separate "Future Opportunity" candidate set
```

This is the crux of the design you asked for: **schemes are never classified against a specific user** — they are classified once into the shared taxonomy, and the user's profile is simply looked up against those pre-computed buckets. The eligibility engine (rules + evidence) only runs on the small intersected candidate set, not the whole catalog.

---

## 11. Eligibility Engine

Deterministic-first, LLM-assisted only for nuance:

```
Candidate Scheme's EligibilityRule[] (structured, deterministic)
        +
Startup Profile fields
        ↓
Rule-by-rule structured comparison (code, not LLM, wherever the rule is deterministic)
        ↓
For rules needing textual interpretation → RAG lookup into EvidenceClause vector index (LLM reasons ONLY over retrieved clauses, cites them)
        ↓
Output:
  status: ELIGIBLE_NOW | POTENTIALLY_ELIGIBLE_AFTER_ACTION | FUTURE_OPPORTUNITY | NOT_ELIGIBLE | INSUFFICIENT_DATA
  matched_criteria[], unmatched_criteria[], missing_information[]
  evidence[]: {clause, page, source_url}  — "Evidence unavailable" if none found, never fabricated
```

---

## 12. RAG Architecture — Why Both Structured DB and Vector DB

| Need | Store |
|---|---|
| Ministry, sector, funding amount, stage, state, application URL | **Structured DB** — exact, deterministic, fast filter/join |
| Nuanced eligibility clauses, guideline language, exceptions | **Vector DB** — semantic retrieval over chunked official PDFs/notifications |

The structured DB does the **pre-bifurcated matching** (sector/ministry/region lookup). The vector DB is used **only after** a candidate scheme is already selected, to fetch the exact clause needed to justify or refine an eligibility decision — never to search the whole scheme universe from scratch per query.

---

## 13. Multi-Agent Architecture

| Agent | Role | Runs when | AI or deterministic? |
|---|---|---|---|
| Profile Parser | Extract structured fields from NL history | Online, per user | LLM (extraction) + deterministic validation |
| Startup Classifier | Map startup to shared taxonomy (current + future paths) | Online, per user | LLM-assisted, constrained to enumerated taxonomy IDs |
| Scheme Extraction & Classification Job | Parse official docs, tag schemes into taxonomy | **Offline**, scheduled/on change | LLM-assisted + human verification |
| Taxonomy Lookup Service | Intersect user taxonomy path with pre-built indexes | Online, per user | **Deterministic** (no LLM) |
| Eligibility Analysis Agent | Compare rules to profile | Online, per user | Mostly deterministic; LLM only for clause interpretation |
| Evidence Verification Agent | Confirm every claim has a source clause | Online, per user | Deterministic check + LLM citation formatting |
| Gap Analysis Agent | Diff satisfied vs. missing criteria | Online | Deterministic |
| Action Planner | Convert gaps into ordered roadmap | Online | LLM (planning/ordering) over deterministic gap list |
| Response Generator | Assemble final ministry-grouped, cited output | Online | LLM formatting over structured data only |

**Design principle applied from the brief:** the *only* heavy, corpus-wide AI classification work (turning raw government documents into taxonomy-tagged scheme records) happens in the **offline Scheme Extraction & Classification Job**, not per user request. Everything in the online path is either a fast deterministic lookup or a narrow, evidence-constrained LLM call on a small candidate set.

---

## 14. Backend Architecture

```
API Gateway → Auth Service
 ├── Startup Profile Service
 ├── Classification Service        (assigns taxonomy nodes to a startup)
 ├── Scheme Catalog Service        (serves the PRE-BUILT taxonomy-tagged catalog; read-heavy)
 ├── Government Data Ingestion Service   (offline job runner: crawl → extract → classify → verify)
 ├── Taxonomy/Matching Service     (indexed lookup: sector ∩ ministry ∩ region)
 ├── RAG Service                   (vector search for evidence clauses only)
 ├── Eligibility Engine
 ├── Recommendation Engine
 ├── Action Planner
 ├── Notification Service
 └── Admin Service (verification queue, catalog management)
```

Example endpoints:
```
POST /startup/profile
POST /startup/classify
GET  /taxonomy                       # sector/ministry/region tree
GET  /schemes?sector=&ministry=&state=   # pre-bucketed catalog browse
POST /schemes/match                  # runs taxonomy lookup for a startup_id
POST /eligibility/analyze
GET  /ministries
GET  /schemes/{id}
POST /application-plan
POST /admin/schemes/{id}/verify
```

---

## 15. Database Architecture (Summary)

Core tables: `Users`, `StartupProfiles`, `StartupClassifications` (current + future paths), `TaxonomyNode`, `Ministries`, `Departments`, `Regions`, `Schemes`, `SchemeTaxonomyMap` (the pre-bifurcation join table), `EligibilityRules`, `Benefits`, `Documents`, `EvidenceClauses`, `Recommendations`, `EligibilityResults`, `ActionPlans`, `Applications`, `DataSyncLogs`.

Key relationships:
- `Scheme` ↔ `TaxonomyNode` via `SchemeTaxonomyMap` (many-to-many) — this table **is** the pre-built sector/ministry/region bifurcation.
- `StartupClassification` references the same `TaxonomyNode` table, twice (current path, future path).
- `Recommendation` links `StartupProfile` + `Scheme` + `EligibilityResult` + `EvidenceClause[]`.

Critical indexes: `SchemeTaxonomyMap(taxonomy_node_id)`, `Scheme(ministry_id, status)`, `Scheme(state_id, status)`, composite `(sector_node_id, stage_id, state_id)` for the primary matching query.

---

## 16. Frontend Architecture (Page Flow)

1. Landing → 2. Onboarding (NL history + structured fields) → 3. Profile review → 4. Classification results (current vs. future, shown separately) → 5. Scheme discovery (auto-run against pre-built catalog) → 6. **Ministry-wise results** (native grouping from `SchemeTaxonomyMap`, not frontend-side sorting) → 7. Scheme detail (with clause-level evidence) → 8. Eligibility analysis → 9. Gap analysis → 10. Application roadmap → 11. Saved schemes/applications.

Every screen answers: *What can I apply for? Why? What's missing? What's next? Where do I apply?*

---

## 17. Data Freshness & Versioning

```
Scheduled crawl (offline, per source registry entry)
   ↓
Change detection (hash/diff against last version)
   ↓
Re-run extraction + taxonomy classification ONLY for changed documents
   ↓
Admin verification for new/changed schemes
   ↓
Update SchemeTaxonomyMap indexes incrementally (not full rebuild)
```
Every scheme carries `last_verified_at`, `last_updated_at`, `source_version`, `data_confidence`.

---

## 18. Hallucination Prevention

- Scheme facts come only from the structured DB + cited evidence clauses.
- Taxonomy tagging of schemes is admin-verifiable before schemes go live.
- The eligibility engine returns `INSUFFICIENT_DATA` rather than guessing.
- The LLM classifier for startups may only output enumerated `taxonomy_node_id`s — never free-text categories — so it can't drift from the schema the scheme catalog was built against.

---

## 19. Security Notes

- Ingestion service treats all scraped/PDF content as **untrusted input** — sanitize before any LLM sees it; strip embedded instructions (prompt-injection/RAG-poisoning defense).
- Only the curated Official Source Registry is crawled — never arbitrary third-party sites.
- Founder demographic/sensitive fields collected and stored with field-level encryption, requested only when a matched scheme's rules require them.

---

## 20. Scalability

Because scheme classification is offline and indexed, scaling to 1,000+ schemes / multiple states mainly means: bigger `SchemeTaxonomyMap`, sharded vector DB by ministry/sector, background workers for ingestion, and caching of the (sector, stage, state) → candidate-set lookup, which is the hot path. The online per-user path stays cheap regardless of catalog size, since it only ever touches a pre-filtered subset.

---

## 21. Technology Stack (two options)

| Layer | Option A — Fast MVP | Option B — Production |
|---|---|---|
| Frontend | Next.js | Next.js + design system |
| Backend | FastAPI/Node | FastAPI/Node microservices |
| Structured DB | PostgreSQL | PostgreSQL (sharded/read-replicas) |
| Vector DB | pgvector | Qdrant/Weaviate/Milvus |
| Crawler | Python + requests/BS4, scheduled cron | Scrapy/Playwright + orchestrated via Airflow/Temporal |
| PDF processing | PyMuPDF/pdfplumber | Same + layout-aware OCR fallback |
| Queue | Redis/RQ | Kafka/SQS |
| Cache | Redis | Redis cluster |
| LLM | Claude (extraction + classification + reasoning) | Same, with cost tiering (cheaper model for extraction, stronger for eligibility reasoning) |
| Auth | JWT/Auth0 | OAuth2 + RBAC |
| Hosting | Single-region VM/containers | Multi-region, containerized, autoscaled |
| Monitoring | Basic logging | Full observability (traces, ingestion pipeline dashboards, data-confidence alerts) |

---

## 22. MVP vs Production Scope

**Phase 1 (Hackathon MVP):** One region (e.g., UP + Central schemes), 3–4 sectors, a manually curated but *already taxonomy-tagged* scheme set (proving the pre-bifurcation concept even with a small hand-built catalog), full pipeline: profile → classify → lookup → eligibility → gap → roadmap.

**Phase 2 (Production):** Automated scheduled crawling across all ministries/states, admin verification workflow, larger vector DB, notifications, application tracking.

**Phase 3 (Advanced):** Incubator/accelerator matching, application drafting, multilingual support, deadline monitoring.

---

## 23. Risks & Mitigations

- **Government sites change structure** → change-detection + admin verification queue, not silent auto-publish.
- **Mis-tagged scheme taxonomy** → human review step before a new/changed scheme enters the live index.
- **LLM hallucination on eligibility** → rules-first engine, evidence-required, `INSUFFICIENT_DATA` fallback.
- **Sensitive founder data** → collect only when a matched scheme's rule requires it, encrypt at rest.

---

## 24. Testing & Deployment (Summary)

- Unit tests on rule-evaluation logic (deterministic, easy to test exhaustively).
- Golden-set tests for taxonomy classification (known startups → expected taxonomy nodes).
- Snapshot tests on scheme ingestion output vs. source documents.
- Staged deployment: ingestion pipeline runs in a staging catalog, promoted to production only after admin verification.

---

*End of document.*
