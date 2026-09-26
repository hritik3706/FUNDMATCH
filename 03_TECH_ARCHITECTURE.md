# FundMatch AI - Technical Architecture

## Technology Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Styling:** Tailwind CSS (rapid styling)
- **State Management:** React Context API (simple for MVP)
- **Form Validation:** React Hook Form + Zod
- **PDF Export:** jsPDF + html2canvas
- **HTTP Client:** Axios
- **Deployment:** Vercel

**Why these choices:**
- React 18 + TS = fast development + type safety
- Tailwind = no CSS file writing, pure utility classes
- jsPDF = lightweight PDF generation, no server needed
- Context API = no Redux complexity for small app

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js + TypeScript
- **Database:** PostgreSQL (local or Railway)
- **Cache:** Redis (Upstash for serverless) - optional for MVP
- **Validation:** Zod
- **Logging:** Console (MVP only)
- **Deployment:** Railway or Render

**Why these choices:**
- Express = minimal, fast, perfect for hackathon
- PostgreSQL = robust, schema-driven, predictable
- Redis = caching Claude API responses (optional but fast)
- TypeScript = catch errors early

### AI/ML Layer
- **LLM:** Claude API (Anthropic)
- **Model:** claude-3-5-sonnet-20241022 (fast, capable)
- **Integration:** Direct API calls via node-fetch
- **Fallback:** Deterministic rule-based matching if API fails

### External Services
- **Email/SMS:** None required for MVP
- **Authentication:** None required for MVP
- **Payment:** None required for MVP

### Development Tools
- **Version Control:** Git + GitHub
- **Package Manager:** npm or yarn
- **Build Tool:** Next.js (optional) or plain CRA with Vite
- **Env Management:** dotenv

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                       │
│                                                              │
│  Home Page → Profile Form → Results Dashboard              │
│                                                              │
│  Components: Form, SchemeCard, DetailModal, ActionPlan      │
│  State: Profiles, Matches, SelectedScheme                  │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP (Axios)
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                   BACKEND (Node.js/Express)                │
│                                                              │
│  POST /api/profiles             → Store profile            │
│  GET  /api/schemes              → List all schemes         │
│  POST /api/matches/analyze      → Get all scheme matches   │
│  GET  /api/matches/:id/:schemeId → Single match details    │
│  GET  /api/action-plans/:ids    → Generate action plan    │
│  POST /api/export/pdf           → Generate PDF            │
│                                                              │
│  Business Logic:                                            │
│  - Input validation (Zod)                                 │
│  - Scheme matching orchestration                          │
│  - Claude API integration                                 │
│  - PDF generation                                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
┌───────▼────┐ ┌──────▼──────┐ ┌───▼──────────┐
│ PostgreSQL │ │    Redis    │ │ Claude API   │
│            │ │    (Cache)  │ │  (Reasoning) │
│ Schemes    │ │             │ │              │
│ Profiles   │ │ Match cache │ │ Matching     │
│ Matches    │ │ Results     │ │ Analysis     │
└────────────┘ └─────────────┘ │ Action plans │
                                └──────────────┘
```

---

## Application Layers

### 1. Frontend Layer (React)
**Responsibility:** User interface and interaction

**Components:**
- `HomePage.tsx` - Landing page with CTA
- `ProfileForm.tsx` - 6-field form for startup info
- `LoadingPage.tsx` - Spinner + progress during analysis
- `ResultsDashboard.tsx` - List of matched schemes
- `SchemeDetailModal.tsx` - Expanded scheme details
- `ActionPlan.tsx` - Step-by-step roadmap display
- `PdfExport.tsx` - PDF download button/logic

**State Management:**
```typescript
type AppState = {
  currentProfile: StartupProfile | null
  allMatches: SchemeMatch[] | null
  selectedScheme: SchemeMatch | null
  actionPlan: ActionPlan | null
  loading: boolean
  error: string | null
}
```

**Key Flows:**
- Profile form → POST /api/profiles
- Results load → GET /api/matches?profileId=xxx
- Scheme detail → GET /api/schemes/:id
- Action plan → GET /api/action-plans/:profileId/:schemeId
- PDF export → client-side jsPDF generation

---

### 2. API/Backend Layer (Express.js)
**Responsibility:** Business logic, data validation, API orchestration

**API Endpoints:**

```
POST /api/profiles
  Request: { name, sector, stage, location, fundingNeeded, founderExperience }
  Response: { profileId, message }
  
GET /api/schemes
  Response: { schemes: Scheme[] }
  
POST /api/matches/analyze
  Request: { profileId }
  Response: { profileId, matches: SchemeMatch[], totalTime }
  
GET /api/schemes/:schemeId
  Response: { scheme: Scheme }
  
GET /api/matches/:profileId/:schemeId
  Response: { schemeMatch: SchemeMatch }
  
GET /api/action-plans/:profileId/:schemeId
  Request query: { useCache?: boolean }
  Response: { actionPlan: ActionPlan }
```

**Business Logic:**
- Validate all inputs using Zod
- For each scheme, call Claude API with context
- Parse Claude response, extract score + gaps + reasoning
- Cache results in Redis for 1 hour
- Generate action plan by calling Claude again
- Format all responses consistently

**Error Handling:**
- Invalid input → 400 Bad Request
- Scheme not found → 404 Not Found
- Claude API error → 500 with fallback flag
- Database error → 500 Internal Error

---

### 3. AI/Matching Layer (Claude API Integration)
**Responsibility:** Eligibility reasoning and matching

**Process:**
1. For each scheme, send profile + scheme requirements to Claude
2. Claude analyzes profile against criteria
3. Claude returns structured JSON: score, gaps, reasoning
4. Backend parses and stores

**Example Claude Prompt:**
```
Analyze this startup profile against scheme requirements:

STARTUP PROFILE:
- Company: TechStart India
- Sector: EdTech
- Stage: Seed
- Location: Bangalore
- Funding Needed: ₹50 lakhs
- Founder Experience: First-time

SCHEME REQUIREMENTS:
- Name: NASSCOM Startup Scheme
- Sector: Tech (includes EdTech)
- Stage: Seed to Series B
- Location: Pan India
- Funding: ₹25L - ₹100L
- Criteria:
  * Must be registered in India
  * Must have GST registration OR pending
  * DPIIT recognition recommended but not mandatory
  * Founder must not have prior exits > $100M

RESPONSE JSON:
{
  "schemeId": "nasscom-startup",
  "schemeName": "NASSCOM Startup Scheme",
  "compatibilityScore": 92,
  "matchedCriteria": [
    "Sector matches (EdTech is in Tech)",
    "Stage matches (Seed eligible)",
    "Funding range matches (₹50L within ₹25L-₹100L)",
    "Location matches (Pan India)"
  ],
  "missingRequirements": [
    {
      "requirement": "GST Registration",
      "status": "missing",
      "impact": "high",
      "howToFix": "Apply on GST portal (1-2 days)"
    },
    {
      "requirement": "DPIIT Recognition",
      "status": "missing",
      "impact": "medium",
      "howToFix": "Register on dpiit.gov.in (2-3 days)"
    }
  ],
  "reasoning": "Your startup is 92% compatible. You meet sector, stage, and funding criteria. However, GST registration and DPIIT recognition will strengthen your application significantly.",
  "nextSteps": ["Register DPIIT", "Apply for GST", "Prepare business plan", "Submit to NASSCOM"]
}
```

---

### 4. Data Layer (PostgreSQL)
**Responsibility:** Persistent data storage

**Schema:**
- `profiles` table - startup profiles submitted
- `schemes` table - available government schemes
- `scheme_details` table - detailed eligibility criteria per scheme
- `matches` table - cached matching results
- `action_plans` table - generated action plans (optional for MVP)

See `05_DATABASE_AND_API.md` for full schema.

---

## Request Flow (End-to-End)

```
USER SUBMITS PROFILE
│
├─ Frontend validates form (Zod)
│
├─ POST /api/profiles
│  └─ Backend validates input
│  └─ Stores profile in DB
│  └─ Returns profileId
│
├─ Frontend stores profileId in state
│
├─ Frontend calls GET /api/matches?profileId=xxx
│  └─ Backend:
│     ├─ Check Redis cache
│     ├─ If found, return cached results
│     └─ If not found:
│        ├─ Fetch all schemes from DB
│        ├─ For each scheme, call Claude API
│        ├─ Parse Claude responses
│        ├─ Calculate scores
│        ├─ Store in Redis cache (1 hour TTL)
│        └─ Return to frontend
│
├─ Frontend displays results dashboard
│  └─ User sees schemes ranked by score
│
├─ User clicks "View Details" on scheme
│  └─ GET /api/matches/:profileId/:schemeId
│     └─ Backend returns detailed match analysis
│
├─ Frontend displays scheme detail modal
│  └─ Shows eligibility breakdown
│
├─ User clicks "Generate Action Plan"
│  └─ GET /api/action-plans/:profileId/:schemeId
│     └─ Backend:
│        ├─ Check Redis cache
│        ├─ If not cached:
│        │  ├─ Call Claude API with action plan prompt
│        │  ├─ Parse steps
│        │  ├─ Store in Redis
│        │  └─ Return to frontend
│
├─ Frontend displays action plan
│  └─ Shows 5-10 numbered steps
│
├─ User clicks "Download PDF"
│  └─ Frontend:
│     ├─ Uses jsPDF to generate PDF
│     ├─ Includes profile, scheme details, action plan
│     └─ Triggers browser download
```

---

## Project Folder Structure

```
fundmatch-ai/
├── frontend/                     # React app
│   ├── src/
│   │   ├── components/
│   │   │   ├── HomePage.tsx
│   │   │   ├── ProfileForm.tsx
│   │   │   ├── LoadingPage.tsx
│   │   │   ├── ResultsDashboard.tsx
│   │   │   ├── SchemeCard.tsx
│   │   │   ├── SchemeDetailModal.tsx
│   │   │   ├── ActionPlan.tsx
│   │   │   └── PdfExport.tsx
│   │   ├── api/
│   │   │   └── client.ts          # Axios instance
│   │   ├── types/
│   │   │   └── index.ts           # TypeScript types
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── backend/                      # Node.js/Express API
│   ├── src/
│   │   ├── routes/
│   │   │   ├── profiles.ts
│   │   │   ├── schemes.ts
│   │   │   ├── matches.ts
│   │   │   └── actionPlans.ts
│   │   ├── services/
│   │   │   ├── db.ts              # Database connection
│   │   │   ├── claude.ts          # Claude API wrapper
│   │   │   ├── matching.ts        # Matching logic
│   │   │   └── pdf.ts             # PDF generation
│   │   ├── middleware/
│   │   │   └── validation.ts      # Zod validation
│   │   ├── types/
│   │   │   └── index.ts           # TypeScript types
│   │   ├── app.ts                 # Express app setup
│   │   └── index.ts               # Server entry point
│   ├── data/
│   │   └── schemes.json           # Demo scheme data
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── data/                         # Demo data
│   └── schemes.json              # 15-20 schemes
│
├── .gitignore
├── README.md
└── docker-compose.yml (optional)
```

---

## 6-Hour Architecture Decisions

### Simplifications Made for Hackathon

1. **No User Authentication**
   - All profiles are stored but no login required
   - Single-session app (one user at a time)
   - Profile ID is temporary (in-memory cache)

2. **Redis is Optional**
   - If time runs out, skip Redis setup
   - In-memory Node cache (simple Map) works as fallback
   - Upgrade to Redis post-hackathon

3. **No Real Government APIs**
   - Schemes are pre-seeded from JSON
   - No live updates or real API calls
   - Clear label: "Demo schemes for demonstration"

4. **Context API Instead of Redux**
   - Simpler state management
   - Fewer files to write
   - Sufficient for single-page flow

5. **Direct jsPDF Instead of Report Server**
   - Client-side PDF generation
   - No extra backend service needed
   - Slightly less polished but works

6. **No Fancy UI Framework**
   - Tailwind CSS only (no Material-UI setup time)
   - Simple, clean, functional UI
   - Jury cares about functionality, not perfection

7. **Single Database Connection**
   - Local PostgreSQL or Railway single instance
   - No replication, no clustering
   - Simple connection pooling

8. **Synchronous Matching (for now)**
   - Claude API calls happen sequentially for each scheme
   - Not ideal for 20 schemes but fast enough for demo
   - Takes ~2-3 seconds total
   - Async/parallel is a P1 optimization

---

## Deployment (By 7 PM)

**Frontend:** Vercel (simplest, one-click deploy)
- GitHub → Vercel → Live URL in 2 minutes

**Backend:** Railway or Render
- GitHub → Railway → Live API in 3 minutes
- Database: Railway PostgreSQL or Render

**Environment Variables:**
```
CLAUDE_API_KEY=sk-ant-...
DATABASE_URL=postgresql://user:pass@host/db
REDIS_URL=redis://... (optional)
FRONTEND_URL=https://fundmatch-frontend.vercel.app
```

---

## Technology Justification

| Decision | Why | Alternative | Why Not |
|----------|-----|-------------|---------|
| React | Fast, component-based, large ecosystem | Vue/Svelte | More learning curve, smaller community |
| Express | Minimal, fast, perfect for hackathon | Next.js | Overkill for API-only backend |
| PostgreSQL | Relational, robust, schema-driven | MongoDB | Overkill for this data model |
| Claude API | State-of-the-art, reasoning, fast | GPT-4 | More expensive, slower |
| Tailwind | No CSS files, all utility classes | Bootstrap | More CSS to write, slower build |
| jsPDF | Lightweight, client-side, no server load | ReportLab | Backend complexity, more time |
| Vercel | One-click deploy, built-in CI/CD | AWS | More setup, more time |

---

## Known Limitations

1. **No horizontal scaling** - Single server, single database
2. **No real-time updates** - Schemes are static demo data
3. **No user persistence** - Profiles cleared on server restart
4. **Synchronous matching** - 20 schemes = 20 sequential API calls (~2-3 sec)
5. **No offline mode** - Requires internet connection
6. **No multi-language** - English only for hackathon

All are acceptable for MVP, upgradeable post-hackathon.
