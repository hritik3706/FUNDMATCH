# 🚀 FundMatch

### AI-Powered Government Funding Intelligence for Startups

> **Find the schemes you actually qualify for — understand why, identify what you're missing, and know what to do next.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-FundMatch-2563EB?style=for-the-badge&logo=vercel&logoColor=white)](https://fundmatch-web.onrender.com/)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/shashank-4bt/FUNDMATCH)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](#)

---

## 🧠 What is FundMatch?

**FundMatch** is an AI-powered startup funding intelligence platform that helps founders discover and understand **government funding schemes relevant to their startup**.

Government funding information is scattered across:

- Government portals
- Ministry websites
- Startup platforms
- State government portals
- PDFs and policy documents
- Scheme-specific application pages

Even after finding a scheme, founders still need to determine:

> **"Am I actually eligible?"**

FundMatch solves this by transforming a founder's startup information into a structured profile and comparing it against government scheme requirements.

### The core idea

```text
Startup Story
      +
Onboarding Data
      +
Startup Website
      ↓
Unified Startup Profile
      ↓
AI Classification
      ↓
Government Scheme Retrieval
      ↓
Eligibility Analysis
      ↓
Match Scoring
      ↓
Gap Analysis
      ↓
Application Roadmap
```

---

# 🎯 The Problem

Startup founders often struggle to access government funding because the information is **fragmented, complex, and difficult to interpret**.

A founder may have to manually search through dozens of portals and documents to answer simple questions:

- Which schemes are relevant to my startup?
- Does my sector qualify?
- Does my startup stage qualify?
- Is my location eligible?
- What type of funding is available?
- What documents are required?
- What requirements am I currently missing?
- How do I apply?

The problem isn't simply **finding schemes**.

The problem is understanding:

> **Which schemes actually make sense for this particular startup?**

---

# 💡 The Solution

FundMatch converts a startup's story and profile into structured funding intelligence.

The platform:

1. Understands the startup.
2. Extracts information from the startup website when provided.
3. Classifies the startup by relevant attributes.
4. Retrieves government schemes.
5. Determines which schemes are genuinely relevant.
6. Calculates a meaningful match score.
7. Separates **match relevance** from **actual eligibility**.
8. Explains the eligibility requirements.
9. Identifies missing requirements.
10. Generates an actionable application roadmap.

---

# ⚡ What Makes FundMatch Different?

FundMatch isn't designed as a generic chatbot that simply generates a list of schemes.

It is designed as a **source-grounded funding intelligence system**.

### Traditional Search

```text
Search Google
      ↓
Open Government Websites
      ↓
Read PDFs
      ↓
Understand Eligibility
      ↓
Compare Manually
      ↓
Figure Out Application
```

### FundMatch

```text
Tell us about your startup
            ↓
    FundMatch understands it
            ↓
    Retrieves relevant schemes
            ↓
    Compares requirements
            ↓
    Shows Match Score
            ↓
    Explains Eligibility
            ↓
    Identifies Missing Requirements
            ↓
    Generates Application Roadmap
```

---

# 🔥 Core Features

## 1. 🏢 Startup Intelligence

Founders can provide information through:

- Startup story
- Structured onboarding
- Startup website

FundMatch combines these inputs into a **unified startup profile**.

Relevant attributes can include:

- Sector
- Startup stage
- Location
- Business model
- Technology
- Funding requirement
- Target users
- Current business status
- Future plans
- Organization information

---

## 2. 🌐 Website Intelligence with Firecrawl

When a founder provides their startup website, FundMatch can use **Firecrawl** to extract useful information.

```text
Startup Website
      ↓
Firecrawl
      ↓
Relevant Website Content
      ↓
Startup Information Extraction
      ↓
Unified Startup Profile
```

This prevents the founder from having to manually enter every piece of information already available on their website.

---

# 🤖 AI-Powered Startup Classification

FundMatch uses **Google Gemini** to understand unstructured startup information.

For example:

```text
"We are building an AI system that helps hospitals
identify high-risk patients using clinical data."
```

can be transformed into structured information such as:

```json
{
  "sector": "Healthcare",
  "technology": ["Artificial Intelligence"],
  "stage": "Early Stage",
  "location": "Uttar Pradesh",
  "use_case": "Clinical Decision Support"
}
```

This structured profile becomes the foundation for scheme matching.

---

# 🔎 Government Scheme Discovery

FundMatch searches for government schemes relevant to the startup's profile.

The system considers factors such as:

- Sector
- Startup stage
- Geography
- Founder/startup category
- Funding purpose
- Technology
- Business characteristics
- Scheme requirements

### No artificial result limit

FundMatch does **not** force every startup into an arbitrary "Top 10 Schemes" list.

If:

```text
1 relevant scheme
```

exists → show 1.

If:

```text
20 relevant schemes
```

exist → show 20.

If:

```text
37 relevant schemes
```

exist → show 37.

If:

```text
0 relevant schemes
```

exist → clearly show:

> **No relevant schemes found**

rather than padding the results with unrelated schemes.

---

# 📊 Match Score

Every relevant scheme receives a **Match Score** based on actual startup-to-scheme alignment.

Example:

```text
┌─────────────────────────────────────┐
│ Startup India Seed Fund             │
│                                     │
│ 92% Match                           │
│                                     │
│ Healthcare ✓                        │
│ Early Stage ✓                      │
│ Uttar Pradesh ✓                    │
│ Technology Startup ✓               │
└─────────────────────────────────────┘
```

The match score represents:

> **How closely the startup profile aligns with the scheme.**

It does **not** automatically mean:

> "You are eligible."

---

# ⚠️ Match Score ≠ Eligibility

This distinction is one of the most important parts of FundMatch.

A startup may have:

```text
95% Match
```

but still be:

```text
Not Currently Eligible
```

because it is missing a mandatory requirement.

For example:

```text
Match Score: 95%

Eligibility:
⚠️ Conditional

Missing:
DPIIT recognition
```

This prevents the system from misleading founders.

---

# 🧾 Requirement-by-Requirement Eligibility

Instead of simply displaying:

> "Eligible"

FundMatch can break eligibility into individual requirements.

Example:

| Requirement | Status |
|---|---|
| Healthcare sector | ✅ Met |
| Early-stage startup | ✅ Met |
| Uttar Pradesh | ✅ Met |
| DPIIT recognition | ⚠️ Missing |
| Required incorporation age | ✅ Met |
| Required documents | ⚠️ Partial |

This makes the decision explainable.

---

# 🧩 Gap Analysis

FundMatch identifies what is preventing a startup from becoming eligible.

Example:

```text
CURRENT STARTUP
      ↓
Scheme Requirements
      ↓
┌──────────────────────────────┐
│ ✓ Healthcare Sector          │
│ ✓ Early Stage               │
│ ✓ Uttar Pradesh             │
│ ✗ DPIIT Recognition         │
│ ✗ Required Certificate      │
└──────────────────────────────┘
      ↓
GAP ANALYSIS
      ↓
Actionable Next Steps
```

Instead of saying:

> "You are not eligible."

FundMatch can explain:

> **"You currently meet 4 of 6 major requirements. Obtain DPIIT recognition and the required certificate before applying."**

---

# 🛣️ Application Roadmap

After eligibility analysis, FundMatch can generate an actionable roadmap.

Example:

```text
STEP 01
Obtain DPIIT Recognition

        ↓

STEP 02
Prepare Required Certificates

        ↓

STEP 03
Prepare Business Documents

        ↓

STEP 04
Prepare Technical Proposal

        ↓

STEP 05
Submit Application

        ↓

STEP 06
Track Application Status
```

The goal is to move from:

**Discovery → Understanding → Action**

---

# 📋 Detailed Scheme Information

Each scheme can provide a comprehensive view containing:

- Scheme name
- Ministry
- Geographic scope
- Overview
- Match score
- Why it matches
- Eligibility status
- Eligibility requirements
- Requirement-by-requirement analysis
- Funding/benefits
- Important conditions
- Required documents
- Application process
- Important dates
- Missing requirements
- Recommended next action
- Official source

Important information is emphasized without turning the interface into a wall of bold text.

---

# 🏛️ Ministry & Government Source Awareness

FundMatch is designed around **official government information** rather than relying purely on generated answers.

The system can associate schemes with:

- Ministry
- Department
- Government organization
- State
- Central government
- Official scheme portal

This provides stronger traceability and helps founders verify the original information.

---

# 🧠 Source-Grounded AI Architecture

One of the fundamental design principles of FundMatch is:

> **AI should interpret information — not invent government rules.**

Conceptually:

```text
Official Government Information
            ↓
      Retrieval Layer
            ↓
   Relevant Scheme Data
            ↓
 Structured Requirements
            ↓
 Deterministic Eligibility Logic
            ↓
       Match Scoring
            ↓
       Gap Analysis
            ↓
      Gemini Explanation
```

This architecture reduces the risk of an LLM simply hallucinating eligibility requirements.

---

# 🛡️ Handling Uncertainty

FundMatch should never pretend to know something it doesn't know.

If information is insufficient:

```text
Insufficient Information
        ↓
Ask Founder for Missing Data
```

instead of:

```text
Missing Information
        ↓
AI Guess
        ↓
Incorrect Eligibility
```

This principle is especially important when dealing with government schemes.

---

# 🧪 Edge Cases

FundMatch is designed with real-world edge cases in mind.

### Outdated Scheme

Government scheme information may change.

**Approach:**

- Show source information
- Track verification/update information
- Encourage verification against the official source

### No Relevant Schemes

```text
0 Relevant Schemes
```

→ Don't fabricate recommendations.

### Too Many Schemes

Don't arbitrarily cut results to 10.

→ Show the genuinely relevant results.

### Missing Information

Don't guess.

→ Ask for additional information.

### Multi-Sector Startup

A startup may operate across:

```text
Healthcare + AI + SaaS
```

→ Match across relevant dimensions.

### Central + State Schemes

A startup may qualify for both:

```text
Central Government
+
State Government
```

→ Surface both where relevant.

### Conditional Eligibility

Some requirements may depend on another condition.

→ Preserve the conditional logic instead of flattening it.

### Missing Documents

Missing documents do not necessarily mean the startup itself is ineligible.

→ Distinguish:

```text
Not Eligible
```

from:

```text
Eligible but Documentation Missing
```

### Contradictory Information

If onboarding says:

```text
Startup Stage = Pre-Revenue
```

but the website suggests:

```text
Revenue Generating
```

→ Flag the discrepancy rather than silently choosing one.

---

# 🔐 Prompt Injection & Untrusted Content

Startup websites and external content should be treated as **data**, not trusted instructions.

A website saying:

```text
Ignore previous instructions...
```

should not alter the application's system behavior.

The architecture separates:

```text
External Content
```

from:

```text
System Instructions
```

---

# 🏗️ System Architecture

```text
                        ┌──────────────────────┐
                        │       Founder        │
                        └──────────┬───────────┘
                                   │
                         Startup Information
                                   │
                                   ▼
                        ┌──────────────────────┐
                        │     Next.js App      │
                        │  React + TypeScript  │
                        └──────────┬───────────┘
                                   │
                              REST APIs
                                   │
                                   ▼
                        ┌──────────────────────┐
                        │   Express Backend    │
                        │      Node.js         │
                        └──────┬───────┬───────┘
                               │       │
                 ┌─────────────┘       └─────────────┐
                 ▼                                   ▼
        ┌─────────────────┐                 ┌─────────────────┐
        │   PostgreSQL    │                 │    Gemini AI    │
        │  Startup Data   │                 │ Classification  │
        │  Scheme Data    │                 │    Analysis     │
        └─────────────────┘                 └─────────────────┘
                                                   │
                                                   ▼
                                          ┌─────────────────┐
                                          │    Firecrawl    │
                                          │ Website Extract │
                                          └─────────────────┘
                                                   │
                                                   ▼
                                          ┌─────────────────┐
                                          │ Matching Engine │
                                          └────────┬────────┘
                                                   │
                                                   ▼
                                          ┌─────────────────┐
                                          │ Eligibility     │
                                          │    Engine       │
                                          └────────┬────────┘
                                                   │
                                                   ▼
                                          ┌─────────────────┐
                                          │  Gap Analysis   │
                                          └────────┬────────┘
                                                   │
                                                   ▼
                                          ┌─────────────────┐
                                          │    Roadmap      │
                                          └─────────────────┘
```

---

# 🛠️ Tech Stack

## Frontend

| Technology | Purpose |
|---|---|
| **Next.js 14** | Web framework, routing and application structure |
| **React 18** | UI components |
| **TypeScript** | Type safety |
| **Tailwind CSS** | Styling and responsive UI |

---

## Backend

| Technology | Purpose |
|---|---|
| **Node.js** | Backend runtime |
| **Express.js** | REST API framework |
| **TypeScript** | Backend type safety |
| **Zod** | Request/data validation |
| **CORS** | Cross-origin API communication |
| **dotenv** | Environment configuration |

---

## Database

### PostgreSQL

Used for structured application data such as:

- Users
- Startup profiles
- Scheme information
- Eligibility information
- Applications
- User activity

---

## AI & Intelligence

### Google Gemini

Used for:

- Startup understanding
- Classification
- Information extraction
- Scheme analysis
- Natural-language explanations

### Firecrawl

Used for:

- Startup website extraction
- Website content enrichment
- Structured information extraction

### Retrieval + Eligibility Engine

Used to connect:

```text
Government Information
        ↓
Relevant Scheme
        ↓
Requirements
        ↓
Startup Profile
        ↓
Eligibility Analysis
```

---

## Deployment

### Render

FundMatch can be deployed using:

- Frontend service
- Backend/API service
- PostgreSQL database

---

## PDF Generation

FundMatch can use:

- `jsPDF`
- `html2canvas`

for report/export functionality.

---

# 📦 Repository Structure

```text
FUNDMATCH/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── services/
│   └── ...
│
├── backend/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── models/
│   └── ...
│
├── README.md
├── package.json
└── ...
```

> Directory names may evolve as the project architecture develops.

---

# 🎬 Demo Flow

A typical FundMatch demonstration:

### 01 — Founder Introduction

Founder enters:

> "We are an early-stage healthcare startup building an AI-powered clinical decision-support platform."

### 02 — Startup Information

The platform collects:

```text
Sector       → Healthcare
Technology   → AI
Stage        → Early Stage
Location     → Uttar Pradesh
Funding Need → ₹25 Lakh
```

### 03 — Website Analysis

Founder optionally provides the startup website.

FundMatch extracts additional information using Firecrawl.

### 04 — AI Classification

Gemini converts the information into a structured startup profile.

### 05 — Scheme Discovery

Relevant government schemes are retrieved.

### 06 — Match Score

Example:

```text
92% Match
```

### 07 — Eligibility

The system checks individual requirements.

### 08 — Gap Analysis

Missing requirements are highlighted.

### 09 — Application Roadmap

The founder receives actionable next steps.

---

# 🧑‍💻 Example Startup

## MediPredict AI

**Location:** Lucknow, Uttar Pradesh  
**Sector:** Healthcare  
**Stage:** Early Stage  
**Technology:** Artificial Intelligence  
**Funding Requirement:** ₹25 Lakh

> MediPredict AI is an early-stage healthcare startup based in Lucknow, Uttar Pradesh, developing an AI-powered clinical decision-support platform that analyzes patient history, clinical parameters, and diagnostic data to help hospitals and doctors identify high-risk patients at an early stage. The startup is currently developing its MVP and conducting pilot testing with small healthcare providers. It is seeking ₹25 lakh in funding for AI model development, product development, data security, pilot deployments, and market expansion. Over the next two years, MediPredict AI plans to expand into remote patient monitoring and preventive healthcare solutions, with the goal of making intelligent healthcare technology more accessible to hospitals and clinics.

FundMatch can then determine which funding opportunities align with this profile.

---

# 💰 Business Model

FundMatch can evolve beyond a scheme discovery tool into a broader **funding intelligence marketplace**.

## 1. Freemium

### Free

- Basic scheme discovery
- Basic startup profile
- Basic matching

### Premium

- Detailed eligibility analysis
- Gap analysis
- Application roadmaps
- Document assistance
- Application tracking
- Funding alerts

---

## 2. Incubators & Accelerators

B2B offering for organizations managing startup portfolios.

Potential features:

```text
Portfolio Dashboard
        ↓
Analyze Multiple Startups
        ↓
Funding Opportunities
        ↓
Eligibility Insights
        ↓
Application Tracking
```

---

## 3. Institutional Partnerships

Potential customers include:

- Universities
- Startup cells
- Incubators
- Innovation centers
- Entrepreneurship programs

---

# 🌐 Future Vision

FundMatch can eventually expand beyond government schemes.

```text
Government Schemes
        ↓
Government Grants
        ↓
Incubators
        ↓
Accelerators
        ↓
Loans
        ↓
Corporate Funding
        ↓
Angel Investors
        ↓
VC Funding
```

### Long-term vision

> **Build a funding intelligence layer that connects startups with the right capital at the right stage.**

---

# 🧭 Product Roadmap

### Phase 1 — Government Funding Discovery

- Startup profiling
- Scheme discovery
- Match scoring
- Eligibility analysis

### Phase 2 — Funding Intelligence

- Gap analysis
- Application roadmaps
- Document assistance
- Application tracking
- Notifications

### Phase 3 — Funding Marketplace

- Incubators
- Accelerators
- Grants
- Loans
- Investors
- Corporate programs

---

# 🧠 Engineering Philosophy

FundMatch follows a simple principle:

> **Use AI where interpretation is difficult. Use deterministic logic where correctness matters.**

### AI handles:

- Understanding startup stories
- Extracting information
- Classification
- Natural-language explanations

### Structured systems handle:

- Eligibility rules
- Requirement checking
- Match calculations
- Data validation
- Source tracking

This division creates a system that is both **intelligent and explainable**.

---

# 🏆 Why Not Just Use ChatGPT?

ChatGPT can generate a list of potential government schemes.

FundMatch is designed around a different workflow:

```text
Startup Profile
      ↓
Structured Attributes
      ↓
Official Scheme Data
      ↓
Requirement Extraction
      ↓
Eligibility Comparison
      ↓
Match Score
      ↓
Gap Analysis
      ↓
Application Roadmap
```

The objective isn't simply to answer:

> "Which schemes exist?"

It is to answer:

> **"Which schemes are relevant to my startup, why do they match, what requirements do I satisfy, what am I missing, and what should I do next?"**

---

# ⚙️ Why Multi-Agent / Multi-Stage Intelligence?

Different parts of the problem require different forms of reasoning.

```text
Startup Understanding
        ↓
Information Extraction
        ↓
Scheme Retrieval
        ↓
Eligibility Reasoning
        ↓
Gap Analysis
        ↓
Action Planning
```

Separating these stages makes the system easier to validate, debug and improve than asking one model to perform the entire task in a single prompt.

---

# 📈 Scalability

The architecture is designed to avoid scraping government websites from scratch for every user query.

A scalable approach is:

```text
Government Sources
        ↓
Ingestion
        ↓
Structured Knowledge Layer
        ↓
Indexed Retrieval
        ↓
User Query
        ↓
Relevant Schemes
```

This allows scheme information to be processed independently from user requests.

---

# 🔒 Reliability Principles

FundMatch prioritizes:

### Source Awareness

Government information should remain traceable to its source.

### Explainability

Every major recommendation should have a reason.

### Uncertainty

Unknown information should remain unknown.

### Separation of Concerns

AI interpretation and eligibility logic should not be unnecessarily coupled.

### User Control

The founder should be able to inspect the requirements before taking action.

---

# 🌟 Vision

FundMatch started with a simple question:

> **"What government funding can my startup actually apply for?"**

The larger vision is much bigger:

> **Make funding discovery intelligent, explainable, and actionable for every startup.**

---

# 👥 Team

### Built by

| Member | GitHub | LinkedIn |
|---|---|---|
| **Shashank Kumar Singh** | [@shashank-4bt](https://github.com/shashank-4bt) | [LinkedIn](https://www.linkedin.com/in/shashank-kumar-singh-a8aa9930a/) |
| **Hritik Kumar Srivastava** | [@hritik3706](https://github.com/hritik3706) | [LinkedIn](https://www.linkedin.com/in/hritik-kumar-srivastava-b52b7720b/) |
| **Kirt Raj Dixit** | [@coderkirt](https://github.com/coderkirt) | [LinkedIn](https://www.linkedin.com/in/kirt-raj-dixit-6573b6387/) |

---

# 🔗 Links

### 🌐 Live Application

https://fundmatch-web.onrender.com/

### 💻 GitHub

https://github.com/shashank-4bt/FUNDMATCH

### 👨‍💻 Team

**Shashank Kumar Singh**  
GitHub: https://github.com/shashank-4bt  
LinkedIn: https://www.linkedin.com/in/shashank-kumar-singh-a8aa9930a/

**Hritik Kumar Srivastava**  
GitHub: https://github.com/hritik3706  
LinkedIn: https://www.linkedin.com/in/hritik-kumar-srivastava-b52b7720b/

**Kirt Raj Dixit**  
GitHub: https://github.com/coderkirt  
LinkedIn: https://www.linkedin.com/in/kirt-raj-dixit-6573b6387/

---

# ⭐ FundMatch

### **Discover funding. Understand eligibility. Close the gap. Take action.**

> **FundMatch — Turning startup information into funding intelligence.**
