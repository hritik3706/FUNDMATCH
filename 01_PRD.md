# FundMatch AI - Product Requirements Document

## Product Overview

**FundMatch AI** is an AI-powered eligibility agent that helps early-stage startup founders identify which government startup schemes they qualify for and generates actionable application roadmaps.

**Core Promise:** Transform startup profile → to complete eligibility analysis + action plan in 5 minutes.

**Problem Solved:** Founders waste weeks researching fragmented scheme information scattered across PDFs, portals, and government documents. FundMatch AI consolidates this chaos and surfaces the schemes that actually match their profile.

---

## Problem Statement (PS-41: Startup Scheme & Funding Agent)

Early-stage founders struggle to determine which government startup schemes they qualify for because eligibility requirements are scattered across multiple documents and portals.

### Pain Points
1. **Scattered Information** - Scheme details live across portals, PDFs, and notices (no single source of truth)
2. **Complex Eligibility** - Clause-level criteria are hard to map to a startup profile
3. **Time-Consuming Checks** - Manual comparison takes too long for busy founders
4. **Missing Requirements** - Critical documents are often discovered only after rejection

### Key Insight
The problem isn't lack of schemes — it's knowing which fit, why, and what's needed to apply.

---

## Target Users

**Primary:** Early-stage startup founders (pre-Series A, 0-3 years old)
- Seeking government seed funding
- Limited experience navigating compliance/regulatory schemes
- Need to make fast funding decisions
- Often working without dedicated legal/compliance support

**Secondary:** Startup mentors, accelerator advisors, government scheme administrators

---

## Product Goal

Enable founders to identify all eligible government startup schemes and generate a step-by-step application roadmap without manual research or domain expertise.

---

## Core Value Proposition

**FundMatch AI delivers:**
1. **Automatic Scheme Matching** - Analyzes startup profile against all available schemes instantly
2. **Explainable Compatibility** - Shows compatibility score (0-100%) with clear reasoning why a scheme fits
3. **Gap Identification** - Flags exactly what's missing (documents, criteria, conditions) before application
4. **Actionable Roadmap** - PDF-ready step-by-step plan to meet requirements and apply
5. **Time Savings** - Converts weeks of research into 5 minutes

---

## MVP Scope

### P0 - Must Have (for working demo)

1. **Startup Profile Form**
   - Capture: company name, sector, stage, location, funding needed, founder experience
   - Minimal required fields only
   - Client-side validation

2. **Scheme Database**
   - At least 15-20 demo schemes seeded
   - Must include: NASSCOM, STARTUP INDIA, regional schemes
   - Each scheme has: name, sector, stage, funding range, eligibility criteria

3. **AI Matching Engine**
   - Claude API integration for eligibility reasoning
   - Produces compatibility score (0-100%) for each scheme
   - Identifies gaps/missing requirements
   - Has deterministic fallback for API failures

4. **Results Dashboard**
   - Display matched schemes ranked by compatibility score
   - Show eligibility reasoning for top 3 schemes
   - Display missing requirements for each scheme

5. **Action Plan Generation**
   - AI generates step-by-step application roadmap
   - Outputs as downloadable PDF
   - Includes: steps, timelines, required documents

6. **End-to-End Flow**
   - Profile submission → AI analysis → results display → PDF download
   - All functionality working and testable in demo

### P1 - Should Have (if time allows)

- Eligibility detail modal with full clause-by-clause breakdown
- Save profiles and compare multiple schemes
- Email export of action plan
- User authentication (optional for hackathon)
- Caching/performance optimization

### P2 - Future (post-hackathon)

- Real government scheme API integration
- Multi-language support
- Mobile app
- Investor readiness scoring
- Incubator/accelerator matching
- Real-time scheme updates

---

## Core Product Workflow

```
User enters startup profile (name, sector, stage, location, funding)
↓
System fetches all available schemes from database
↓
For each scheme:
  - Claude AI analyzes startup against eligibility criteria
  - Calculates compatibility score (0-100%)
  - Identifies missing requirements
  - Generates explanation
↓
Results ranked by compatibility score
↓
User selects a scheme to view:
  - Full eligibility breakdown
  - Missing requirements
  - AI-generated action plan
↓
User downloads PDF roadmap
  - Step-by-step application guide
  - Timeline estimates
  - Required documents checklist
```

---

## Functional Requirements

**FR-01:** System shall accept startup profile with: company name, sector, stage, location, funding needed, founder experience.

**FR-02:** System shall store at least 15-20 government schemes with: name, sector, stage, funding range, eligibility criteria.

**FR-03:** System shall use Claude API to analyze startup profile against each scheme's eligibility criteria.

**FR-04:** System shall produce compatibility score 0-100 for each scheme using formula: (Sector Match × 25%) + (Stage Match × 25%) + (Location Match × 15%) + (Funding Range Match × 20%) + (Eligibility Completeness × 15%).

**FR-05:** System shall identify and list specific missing requirements for each scheme (e.g., "GST Registration", "DPIIT Recognition").

**FR-06:** System shall generate AI-powered eligibility reasoning explaining why a scheme matches or doesn't match.

**FR-07:** System shall rank all schemes by compatibility score descending.

**FR-08:** System shall generate a step-by-step action plan using Claude API for any selected scheme.

**FR-09:** System shall export action plan + scheme details as PDF downloadable file.

**FR-10:** System shall have fallback matching if Claude API fails (deterministic rule-based scoring).

**FR-11:** System shall return results in < 5 seconds for profile-to-matches flow.

---

## Non-Functional Requirements

- **Responsiveness:** Works on desktop and mobile (basic support)
- **Performance:** Profile submission → results in < 5 seconds
- **Availability:** No critical crashes during 7-hour demo
- **Usability:** Founders with no tech background can complete flow
- **Error Handling:** Graceful degradation if APIs fail (fallback mode)
- **Maintainability:** Clean code, minimal technical debt, well-structured

---

## Success Criteria (By 7 PM Demo)

✅ Founder can submit startup profile via form
✅ System displays matched schemes ranked by score
✅ Founder can see eligibility reasoning for top schemes
✅ Founder can view missing requirements for each scheme
✅ AI generates action plan (5+ steps) for selected scheme
✅ PDF export downloads successfully
✅ Complete demo flow works end-to-end without crashes
✅ Founder can complete entire flow in 2-3 minutes

---

## Assumptions

1. Scheme data is demo/curated (not live government APIs) for hackathon
2. Claude API is accessible and working
3. PostgreSQL database available locally or remote
4. No user authentication required for MVP
5. Single-user concurrent access (no multi-user concurrency needed)
6. Schemes are pre-seeded, not dynamically fetched from government sources

---

## Out of Scope (Hackathon)

- Real government scheme APIs
- User authentication/accounts
- Multi-language support
- Real-time scheme updates
- Performance monitoring
- Production-grade security
- Mobile app (web only)
- Advanced analytics
