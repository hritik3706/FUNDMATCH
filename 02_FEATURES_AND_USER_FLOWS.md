# FundMatch AI - Features & User Flows

## Feature List

### Feature 1: Startup Profile Form
- **Purpose:** Capture founder/startup information needed for scheme matching
- **Priority:** P0 (Critical)
- **User Input:**
  - Company Name (text)
  - Sector (dropdown: EdTech, FinTech, HealthTech, ClimaTech, AI/ML, etc.)
  - Stage (dropdown: Pre-seed, Seed, Series A, Series B)
  - Location (dropdown: Indian states)
  - Funding Needed (number in lakhs)
  - Founder Experience (dropdown: First-time, Serial, Angel, VC-backed)
- **System Processing:** Validate inputs, store in memory/database
- **Output:** Profile ID, redirect to results page

### Feature 2: AI Scheme Matching
- **Purpose:** Analyze startup profile against all schemes using Claude API
- **Priority:** P0 (Critical)
- **User Input:** Profile ID from form
- **System Processing:**
  - Fetch all schemes from database
  - For each scheme, call Claude API with eligibility reasoning prompt
  - Parse Claude response to extract: score, gaps, reasoning
  - Rank results by score descending
  - Cache results for 1 hour
- **Output:** Ranked list of schemes with scores

### Feature 3: Results Dashboard
- **Purpose:** Display matched schemes with compatibility scores
- **Priority:** P0 (Critical)
- **User Input:** Click on scheme card for details
- **System Processing:** Fetch scheme details and match analysis
- **Output:**
  - List of top 10 schemes ranked by score
  - For each: scheme name, score (0-100%), brief description, match rating (⭐⭐⭐⭐⭐)
  - "View Details" button for each scheme

### Feature 4: Eligibility Analysis Detail
- **Purpose:** Show detailed why/why-not breakdown for a scheme
- **Priority:** P0 (Critical)
- **User Input:** Click "View Details" on scheme card
- **System Processing:** Display full match analysis
- **Output:**
  - Full scheme description
  - Eligibility reasoning (why it matches/doesn't)
  - Met criteria (checkmarks in green)
  - Unmet criteria (warning icons in red)
  - Missing requirements list (specific documents/conditions)
  - Compatibility score breakdown (sector, stage, location, funding, completeness)

### Feature 5: AI Action Plan Generation
- **Purpose:** Generate step-by-step application roadmap
- **Priority:** P0 (Critical)
- **User Input:** Click "Generate Action Plan" for selected scheme
- **System Processing:**
  - Call Claude API with scheme + startup profile
  - Claude generates 5-10 steps with timelines
  - Parse response into structured steps
- **Output:**
  - Numbered steps (1-10)
  - For each step: title, description, estimated time, required documents, deadline
  - Timeline visualization (total days to complete)

### Feature 6: PDF Export
- **Purpose:** Generate downloadable action plan + scheme details
- **Priority:** P0 (Critical)
- **User Input:** Click "Download PDF"
- **System Processing:**
  - Compile startup profile, scheme details, action plan
  - Generate PDF using jsPDF library
  - Format as professional document
- **Output:** PDF file (FundMatch_ActionPlan.pdf) ready to download

---

## Main User Flow

```
STEP 1: LANDING PAGE
User sees FundMatch AI homepage
- Big heading: "FundMatch AI - Find Your Funding in 5 Minutes"
- Brief problem/solution explanation
- "Get Started" button

STEP 2: PROFILE FORM
User fills in startup profile form:
- Company Name: "TechStart India"
- Sector: "EdTech"
- Stage: "Seed"
- Location: "Bangalore"
- Funding Needed: "50" (lakhs)
- Founder Experience: "First-time"
- Clicks "Analyze My Profile"

STEP 3: LOADING STATE
Show spinner/loading message: "Analyzing your startup against government schemes..."
System calls Claude API for each scheme (15-20 schemes × 1 API call each)
Cached if recently analyzed

STEP 4: RESULTS DASHBOARD
Display top 10 matching schemes ranked by compatibility score:
- #1 NASSCOM Startup Scheme: 92% ⭐⭐⭐⭐⭐
  "Best match for your EdTech startup"
- #2 STARTUP INDIA Scheme: 87% ⭐⭐⭐⭐
  "Strong match - needs DPIIT recognition"
- #3 Department of Science: 76% ⭐⭐⭐
- ... (7 more schemes)

Each scheme card shows:
- Rank badge (#1, #2, etc.)
- Scheme name
- Compatibility %
- Star rating based on %
- 1-line summary
- "View Details" button

STEP 5: VIEW SCHEME DETAILS
User clicks "View Details" on NASSCOM scheme
Modal/new page shows:
- Full scheme description
- Met requirements:
  ✅ Sector matches (EdTech)
  ✅ Stage matches (Seed eligible)
  ✅ Location matches (All India)
- Unmet requirements:
  ⚠️ Missing: GST Registration
  ⚠️ Missing: DPIIT Startup Recognition
- Compatibility score breakdown:
  Sector Match: 25/25
  Stage Match: 25/25
  Location Match: 15/15
  Funding Range: 20/20
  Eligibility Completeness: 7/15
  TOTAL: 92/100

STEP 6: GENERATE ACTION PLAN
User clicks "Generate Action Plan for NASSCOM"
System calls Claude API to create steps
Results show:
Step 1: Register DPIIT Startup (2 hours)
  - Desc: Visit dpiit.gov.in and submit startup details
  - Docs: PAN, Address Proof, Board Resolution
  - Deadline: Before NASSCOM application
Step 2: Apply for GST Registration (1-2 days)
  - Desc: Register on GST portal
  - Docs: PAN, Address Proof, Bank Details
  - Deadline: Critical - before NASSCOM
Step 3: Prepare Incorporation Certificate (1 hour)
  - Desc: Get official CoI from ROC
  - Docs: Company Registration
Step 4: Complete NASSCOM Application Form (2 hours)
  - Desc: Fill out scheme-specific form
  - Docs: All above + business plan
Step 5: Submit Application (30 min)
  - Desc: Upload to NASSCOM portal
  - Docs: All completed docs + bank statements

Timeline: Estimated 4-5 days total

STEP 7: DOWNLOAD PDF
User clicks "Download as PDF"
File generated: FundMatch_ActionPlan_NASSCOM_Sep2026.pdf
Contains:
- Startup profile summary
- NASSCOM scheme overview
- Full action plan with steps
- Document checklist (print-ready)
- Contact details for support
- Timeline visualization

STEP 8: EXIT
User can:
- Compare another scheme (back to results)
- Try different profile (new analysis)
- Download PDF for different scheme
- Exit application
```

---

## Screen-Level Flow

### Screen 1: Home/Landing
- **Entry:** User opens app
- **User Actions:** Read description, click "Get Started" or "Analyze Profile"
- **Data Required:** None
- **API Called:** None
- **Result Displayed:** Route to Profile Form
- **Navigation:** → Profile Form Screen

### Screen 2: Startup Profile Form
- **Entry:** User clicks "Get Started"
- **User Actions:**
  - Fill 6 form fields
  - Click "Analyze My Profile"
- **Data Required:** None
- **API Called:** POST /api/profiles (submit profile)
- **Result Displayed:** Loading spinner
- **Navigation:** → Loading → Results Dashboard

### Screen 3: Loading State
- **Entry:** After form submission
- **User Actions:** Wait (5-10 seconds)
- **Data Required:** Profile ID
- **API Called:**
  - GET /api/schemes (list all schemes)
  - POST /api/matches/analyze (Claude analysis for each)
- **Result Displayed:** Spinner + progress message
- **Navigation:** → Results Dashboard (auto-redirect when done)

### Screen 4: Results Dashboard
- **Entry:** Analysis complete
- **User Actions:**
  - View list of schemes
  - Click "View Details" on any scheme
  - Click "Try Different Profile" to restart
- **Data Required:** Match results with scores
- **API Called:** GET /api/matches?profileId=xxx
- **Result Displayed:** Ranked list of 10 schemes with scores
- **Navigation:** → Scheme Detail OR → Profile Form

### Screen 5: Scheme Detail Modal/Page
- **Entry:** Click "View Details" on scheme card
- **User Actions:**
  - Read eligibility breakdown
  - View missing requirements
  - Click "Generate Action Plan"
  - Close modal to return to results
- **Data Required:** Scheme details, match analysis for this scheme
- **API Called:** GET /api/schemes/:id, GET /api/matches/:profileId/:schemeId
- **Result Displayed:** Full eligibility breakdown with met/unmet criteria
- **Navigation:** → Action Plan OR ← Back to Results

### Screen 6: Action Plan
- **Entry:** Click "Generate Action Plan"
- **User Actions:**
  - Read steps
  - View timeline
  - Click "Download as PDF"
- **Data Required:** Scheme details, startup profile, AI-generated steps
- **API Called:** GET /api/action-plans/:profileId/:schemeId
- **Result Displayed:** Step-by-step roadmap with timelines
- **Navigation:** → PDF Download OR ← Back to Scheme Details

---

## Demo Flow (2-3 minutes for jury)

**Pre-demo setup:** Have this profile ready in form
```
Company Name: "HealthTech Solutions"
Sector: "HealthTech"
Stage: "Seed"
Location: "Delhi"
Funding Needed: "30"
Founder Experience: "First-time"
```

**Demo sequence:**
1. (0:00) Load home page, explain problem in 30 seconds
2. (0:30) Fill form with pre-populated data, click "Analyze"
3. (0:45) Show loading state, explain what AI is doing
4. (1:00) Results load, show top 3 schemes with scores
5. (1:30) Click on top scheme, show "92% match" breakdown
6. (2:00) Click "Generate Action Plan", show 5 steps
7. (2:30) Click "Download PDF", file downloads
8. (2:45) Show downloaded PDF, explain next steps
9. (3:00) End

**Key points to emphasize:**
- From profile → to complete roadmap in < 3 minutes
- AI understands scheme requirements, not just binary matching
- Founder gets specific action steps + timeline
- PDF is ready to share/execute immediately

---

## Loading & Error States

### Loading States
- Profile form submission: "Analyzing your profile..."
- Scheme matching: "Checking eligibility against 20+ schemes..." (with progress bar)
- Action plan generation: "Creating your personalized roadmap..."

### Error States
- Claude API down: Show fallback scoring, offer alternative
- Database error: "Unable to load schemes. Please try again."
- Missing form fields: "Please fill in all required fields."
- No matching schemes: "No schemes matched your profile. Try updating your sector or stage."

### Empty States
- First load: Show hero section with call-to-action
- No schemes found: Offer to relax criteria or contact support
