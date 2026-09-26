# FundMatch AI - AI Matching & Eligibility Specification

## AI Objective

The AI system determines whether and how well a startup profile matches each government startup scheme's eligibility criteria, producing:
1. **Compatibility Score** (0-100%) - quantitative fit
2. **Gap Analysis** - specific missing requirements
3. **Eligibility Reasoning** - explanation of why/why-not
4. **Action Plan** - step-by-step to fix gaps and apply

---

## Input Data

### Startup Profile
Captured from user form submission:

```typescript
type StartupProfile = {
  id: string
  name: string                    // Company name
  sector: string                  // EdTech | FinTech | HealthTech | ClimaTech | AI/ML | etc.
  stage: string                   // Pre-seed | Seed | Series A | Series B
  location: string                // Indian state (e.g., "Karnataka", "Delhi")
  fundingNeeded: number            // Amount in lakhs
  founderExperience: string       // First-time | Serial | Angel | VC-backed
  
  // Optional fields (for enhanced matching)
  incorporationDate?: Date         // Company incorporation
  gstStatus?: string              // Registered | Pending | No
  dpitRegistration?: boolean      // DPIIT recognized
  previousFunding?: number        // Previous funding raised
}
```

### Scheme Data
Pre-seeded in database:

```typescript
type Scheme = {
  id: string
  name: string                    // "NASSCOM Startup Scheme"
  description: string             // Full description
  sector: string[]               // ["EdTech", "FinTech", "AI/ML"]
  stage: string[]                // ["Seed", "Series A"]
  fundingRange: {
    min: number                  // Minimum in lakhs
    max: number                  // Maximum in lakhs
  }
  location: string[]             // ["Pan India"] or specific states
  eligibilityCriteria: Criterion[]
}

type Criterion = {
  id: string
  name: string                   // "GST Registration"
  description: string
  required: boolean              // Mandatory or nice-to-have
  impact: "high" | "medium" | "low"
  howToFix?: string
}
```

---

## Matching Pipeline

### Pipeline Steps

```
1. INPUT
   ├─ Startup Profile (name, sector, stage, location, funding, experience)
   └─ Scheme Data (requirements, criteria, constraints)

2. BASIC FIELD MATCHING
   ├─ Sector: Does startup sector match scheme sector list?
   ├─ Stage: Is startup stage in scheme's eligible stages?
   ├─ Location: Is startup location in scheme's allowed locations?
   └─ Funding: Is required funding within scheme's min-max range?
   
   → Output: 4 boolean scores (yes/no for each)

3. SEND TO CLAUDE API
   ├─ Pass startup profile
   ├─ Pass scheme requirements
   ├─ Ask Claude to:
   │  ├─ Evaluate clause-level eligibility
   │  ├─ Identify missing requirements
   │  ├─ Generate compatibility score
   │  └─ Provide reasoning
   
   → Output: Claude JSON response

4. PARSE CLAUDE RESPONSE
   ├─ Extract compatibility score
   ├─ Extract matched criteria
   ├─ Extract unmet criteria
   ├─ Extract gaps and fixes
   └─ Extract reasoning explanation
   
   → Output: Structured SchemeMatch object

5. CALCULATE FINAL SCORE
   ├─ Use provided Claude score (primary)
   ├─ Or fall back to formula-based score if needed
   └─ Apply 0-100 normalization
   
   → Output: Final compatibility score

6. RANK & CACHE
   ├─ Store result in Redis cache (1 hour TTL)
   ├─ Rank all schemes by score descending
   └─ Return top 10 to frontend
   
   → Output: Ranked list of SchemeMatch
```

---

## Scoring Formula (Fallback/Hybrid)

**Primary Method:** Claude API generates the score directly.

**Fallback Method (if Claude unavailable):** Use weighted scoring formula.

### Compatibility Score Calculation

```
COMPATIBILITY SCORE = 
  (Sector Match × 0.25) +
  (Stage Match × 0.25) +
  (Location Match × 0.15) +
  (Funding Range Match × 0.20) +
  (Eligibility Completeness × 0.15)

× 100 to get 0-100 scale
```

### Component Breakdown

**1. Sector Match (0-1 scale, weight 25%)**
```
IF startup.sector IN scheme.sectors:
  score = 1.0  (100% match)
ELSE IF startup.sector related to scheme.sectors:
  score = 0.7  (70% related, e.g., ClimaTech → HealthTech)
ELSE:
  score = 0.0  (No match)
```

**2. Stage Match (0-1 scale, weight 25%)**
```
IF startup.stage IN scheme.stages:
  score = 1.0  (Exact match)
ELSE IF startup.stage adjacent to scheme.stages:
  score = 0.8  (e.g., Seed → Series A scheme, still eligible)
ELSE:
  score = 0.0  (Not eligible)
```

**3. Location Match (0-1 scale, weight 15%)**
```
IF "Pan India" IN scheme.locations:
  score = 1.0  (Accepts all locations)
ELSE IF startup.location IN scheme.locations:
  score = 1.0  (Exact location match)
ELSE:
  score = 0.0  (Location mismatch)
```

**4. Funding Range Match (0-1 scale, weight 20%)**
```
IF startup.fundingNeeded < scheme.fundingRange.min:
  score = 0.5  (Below minimum, but might be eligible)
ELSE IF startup.fundingNeeded > scheme.fundingRange.max:
  score = 0.3  (Above maximum, might not qualify)
ELSE:
  score = 1.0  (Within range, perfect match)
```

**5. Eligibility Completeness (0-1 scale, weight 15%)**
```
mandatory_criteria = scheme.criteria WHERE required=true
unmet_mandatory = COUNT(mandatory_criteria WHERE startup missing)
unmet_percentage = unmet_mandatory / total_mandatory

score = 1.0 - unmet_percentage

Examples:
  - 0 gaps: score = 1.0 (100%)
  - 1 gap out of 5: score = 0.8 (80%)
  - 3 gaps out of 5: score = 0.4 (40%)
  - All gaps: score = 0.0 (0%)
```

### Final Score Calculation Example

```
Sector Match:        0.9 × 0.25 = 0.225  (90% sector fit)
Stage Match:         1.0 × 0.25 = 0.250  (Perfect stage fit)
Location Match:      1.0 × 0.15 = 0.150  (Pan India)
Funding Range Match: 1.0 × 0.20 = 0.200  (Within range)
Eligibility:         0.7 × 0.15 = 0.105  (Missing 30% of requirements)
                     ─────────────────────
TOTAL:               0.930 × 100 = 93%
```

---

## Claude API Prompt Template

### Matching Prompt (for each scheme)

```
You are an expert in Indian government startup funding schemes. 
Analyze the following startup profile against scheme requirements 
and provide a detailed compatibility assessment.

STARTUP PROFILE:
- Company Name: {profile.name}
- Sector: {profile.sector}
- Stage: {profile.stage}
- Location: {profile.location}
- Funding Needed: ₹{profile.fundingNeeded} lakhs
- Founder Experience: {profile.founderExperience}
- Previous Funding: ₹{profile.previousFunding || 0} lakhs
- GST Status: {profile.gstStatus || "Unknown"}
- DPIIT Recognition: {profile.dpitRegistration || "No"}

SCHEME DETAILS:
- Name: {scheme.name}
- Description: {scheme.description}
- Eligible Sectors: {scheme.sector.join(", ")}
- Eligible Stages: {scheme.stage.join(", ")}
- Funding Range: ₹{scheme.fundingRange.min}L - ₹{scheme.fundingRange.max}L
- Eligible Locations: {scheme.location.join(", ")}

ELIGIBILITY CRITERIA:
{scheme.eligibilityCriteria.map(c => 
  `- ${c.name} (${c.required ? 'REQUIRED' : 'Optional'}): ${c.description}`
).join('\n')}

ANALYSIS REQUIRED:
1. Calculate a compatibility score (0-100)
2. List which criteria the startup MEETS
3. List which criteria the startup is MISSING
4. For each missing criterion, explain how to fix it
5. Provide overall reasoning for the score

RESPONSE FORMAT (JSON):
{
  "schemeId": "{scheme.id}",
  "schemeName": "{scheme.name}",
  "compatibilityScore": <number 0-100>,
  "matchedCriteria": [
    {
      "name": "string",
      "status": "met",
      "explanation": "why this is met"
    }
  ],
  "missingRequirements": [
    {
      "name": "string",
      "status": "missing",
      "impact": "high|medium|low",
      "howToFix": "specific steps to fix this",
      "estimatedTime": "e.g., 2-3 days"
    }
  ],
  "overallReasoning": "2-3 sentence explanation of why this score",
  "nextSteps": ["step1", "step2", "step3"]
}

Return ONLY valid JSON, no other text.
```

### Action Plan Prompt

```
You are an expert advisor helping a startup apply for government funding.
Generate a detailed, actionable step-by-step plan for this startup to 
become eligible for and successfully apply to this scheme.

STARTUP:
- Name: {profile.name}
- Sector: {profile.sector}
- Stage: {profile.stage}
- Current Gaps: {gaps.join(", ")}

SCHEME:
- Name: {scheme.name}
- Requirements: {scheme.eligibilityCriteria.map(c => c.name).join(", ")}

GENERATE:
A prioritized list of 5-10 action steps in JSON format.

RESPONSE FORMAT (JSON):
{
  "actionPlan": [
    {
      "stepNumber": 1,
      "title": "Register DPIIT Startup",
      "description": "Complete startup recognition on dpiit.gov.in portal",
      "priority": "critical",
      "estimatedTime": "2 hours",
      "requiredDocuments": ["PAN", "Address Proof", "Board Resolution"],
      "nextStepDependency": false,
      "deadline": "Before scheme application",
      "contactDetails": "https://dpiit.gov.in/contact"
    },
    ...
  ],
  "totalEstimatedTime": "4-5 days",
  "timeline": [
    {
      "day": 1,
      "activities": ["Register DPIIT", "Apply for GST"],
      "expected": "Pending status"
    }
  ],
  "successCriteria": "All required documents obtained, eligibility criteria met"
}

Return ONLY valid JSON, no other text.
```

---

## Eligibility Determination

### Categories

**Fully Eligible (Score 75-100)**
- Meets all mandatory requirements
- No critical gaps
- Can apply immediately or with minimal prep
- Example: 92% compatibility

**Partially Eligible (Score 50-74)**
- Meets most requirements
- Missing 1-2 requirements that can be fixed
- Will need 2-7 days to become fully eligible
- Example: 68% compatibility

**Unlikely Eligible (Score 25-49)**
- Missing multiple critical requirements
- Would require significant changes
- May not be worth pursuing unless willing to invest weeks
- Example: 38% compatibility

**Not Eligible (Score 0-24)**
- Fundamental mismatch (sector, stage, location)
- Would require pivoting business
- Not recommended to pursue
- Example: 12% compatibility

### Determination Logic

```typescript
function determineEligibility(score: number, gaps: Gap[]) {
  const criticalGaps = gaps.filter(g => g.impact === 'high').length;
  
  if (score >= 75 && criticalGaps === 0) {
    return 'FULLY_ELIGIBLE';
  } else if (score >= 50 && criticalGaps <= 2) {
    return 'PARTIALLY_ELIGIBLE';
  } else if (score >= 25 && criticalGaps <= 5) {
    return 'UNLIKELY_ELIGIBLE';
  } else {
    return 'NOT_ELIGIBLE';
  }
}
```

---

## Missing Requirements Detection

### Gap Detection Algorithm

```
FOR each criterion in scheme.eligibilityCriteria:
  
  IF criterion.name == "GST Registration":
    IF startup.gstStatus != "Registered":
      gap = {
        type: "GST_REGISTRATION",
        impact: "high",
        howToFix: "Apply on GST portal",
        estimatedTime: "1-2 days"
      }
  
  ELSE IF criterion.name == "DPIIT Recognition":
    IF startup.dpitRegistration != true:
      gap = {
        type: "DPIIT_REGISTRATION",
        impact: "medium",
        howToFix: "Register on dpiit.gov.in",
        estimatedTime: "2-3 days"
      }
  
  ELSE IF criterion.name == "Incorporation Certificate":
    IF startup.incorporationDate == null:
      gap = {
        type: "INCORPORATION",
        impact: "high",
        howToFix: "Incorporate company at ROC",
        estimatedTime: "15-20 days"
      }
  
  ... (etc for each criterion)
  
RETURN all detected gaps
```

---

## AI Fallback Strategy

### When Claude API is Down

1. **Check Redis Cache**
   - If scheme matching was done recently, return cached results
   - TTL: 1 hour per profile-scheme pair
   - Fallback never shows old data without warning

2. **Use Deterministic Formula**
   - Apply weighted scoring formula (see above)
   - Basic field matching only (no clause-level reasoning)
   - Shows "Demo Mode" label to user
   - Clearly states: "Using demo matching (limited accuracy)"

3. **Manual Gaps from Config**
   - Each scheme has pre-configured common gaps
   - Use if Claude completely unavailable
   - Less accurate but keeps demo flowing

4. **Continue Demo Flow**
   - User can still complete demo
   - Still shows top 10 matching schemes
   - Still generates action plan (generic steps)
   - Graceful degradation, not failure

### Fallback Response Example

```json
{
  "schemeId": "nasscom-startup",
  "schemeName": "NASSCOM Startup Scheme",
  "compatibilityScore": 87,
  "fallbackMode": true,
  "fallbackReason": "Claude API temporarily unavailable. Using formula-based matching.",
  "matchedCriteria": [
    { "name": "Sector Match", "status": "met" },
    { "name": "Stage Match", "status": "met" },
    { "name": "Location Match", "status": "met" },
    { "name": "Funding Range", "status": "met" }
  ],
  "missingRequirements": [
    {
      "name": "GST Registration",
      "status": "missing",
      "impact": "high",
      "howToFix": "Apply on GST portal (typical process: 1-2 days)"
    }
  ],
  "overallReasoning": "Strong match based on basic criteria. GST registration needed.",
  "accuracyNote": "Full eligibility analysis unavailable. Please try again in a few minutes."
}
```

---

## Caching Strategy

### What Gets Cached

1. **Scheme Matching Results**
   - Key: `matches:{profileId}:{schemeId}`
   - Value: SchemeMatch object
   - TTL: 1 hour
   - Reason: Same startup profile won't change often in a session

2. **Action Plans**
   - Key: `actionplan:{profileId}:{schemeId}`
   - Value: ActionPlan object
   - TTL: 4 hours
   - Reason: Less likely to change, can regenerate if needed

3. **Scheme List**
   - Key: `schemes:all`
   - Value: Scheme[]
   - TTL: 24 hours
   - Reason: Rarely updated for hackathon

### Cache Invalidation

```
- On new profile creation: Clear all matches for profile
- On scheme update: Clear scheme cache + all matches
- Manual refresh: User can click "Re-analyze" to bypass cache
```

---

## Output Format

### SchemeMatch Object (API Response)

```typescript
type SchemeMatch = {
  profileId: string
  schemeId: string
  schemeName: string
  compatibilityScore: number          // 0-100
  eligibilityStatus: string            // "FULLY_ELIGIBLE" | "PARTIALLY_ELIGIBLE" | "UNLIKELY_ELIGIBLE" | "NOT_ELIGIBLE"
  
  matchedCriteria: {
    name: string
    status: "met"
    explanation: string
  }[]
  
  missingRequirements: {
    name: string
    status: "missing"
    impact: "high" | "medium" | "low"
    howToFix: string
    estimatedTime: string
  }[]
  
  overallReasoning: string
  nextSteps: string[]
  
  fallbackMode?: boolean
  fallbackReason?: string
}
```

---

## Testing the AI Layer (Pre-demo)

### Test Cases

1. **High Match Scenario**
   - Profile: EdTech, Seed, ₹50L, DPIIT + GST registered
   - Scheme: EdTech, Seed, ₹25L-₹100L
   - Expected: 90-100% compatibility

2. **Partial Match Scenario**
   - Profile: EdTech, Series A, ₹200L, No GST
   - Scheme: EdTech, Seed-Series A, ₹25L-₹150L
   - Expected: 60-75% compatibility

3. **No Match Scenario**
   - Profile: HealthTech, Pre-seed, ₹10L
   - Scheme: EdTech, Series A, ₹100L-₹500L
   - Expected: 15-30% compatibility

### Pre-demo Checklist

- [ ] Claude API key is valid
- [ ] Sample profile generates scores for all 15+ schemes
- [ ] Top 3 schemes make sense (correct ranking)
- [ ] Action plan has 5+ realistic steps
- [ ] Fallback mode works if API disabled
- [ ] Caching is working (second request is instant)
- [ ] PDF export includes all data
