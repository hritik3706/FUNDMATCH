# FundMatch AI - Database & API Specification

## Database Overview

**Database:** PostgreSQL (local or Railway)
**ORM:** Raw SQL or Simple query builder (no heavy ORM for hackathon)
**Connection:** Single pool, no clustering
**Backup:** Not required for demo

---

## Database Schema

### 1. profiles Table
Stores startup profiles submitted by users.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  sector VARCHAR(100) NOT NULL,
  stage VARCHAR(50) NOT NULL,
  location VARCHAR(100) NOT NULL,
  funding_needed INTEGER NOT NULL,  -- in lakhs
  founder_experience VARCHAR(50) NOT NULL,
  
  -- Optional fields for enhanced matching
  incorporation_date DATE,
  gst_status VARCHAR(50),  -- "Registered", "Pending", "No"
  dpiit_registration BOOLEAN DEFAULT FALSE,
  previous_funding INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_profiles_sector ON profiles(sector);
CREATE INDEX idx_profiles_stage ON profiles(stage);
CREATE INDEX idx_profiles_created_at ON profiles(created_at DESC);
```

### 2. schemes Table
Government startup schemes (pre-seeded demo data).

```sql
CREATE TABLE schemes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  
  -- Eligibility parameters (stored as JSON for flexibility)
  eligible_sectors TEXT[] NOT NULL,  -- Array of sectors
  eligible_stages TEXT[] NOT NULL,   -- Array of stages
  eligible_locations TEXT[] NOT NULL, -- Array of states or "Pan India"
  
  funding_min INTEGER NOT NULL,  -- in lakhs
  funding_max INTEGER NOT NULL,  -- in lakhs
  
  -- Eligibility criteria (stored as JSONB)
  eligibility_criteria JSONB NOT NULL,  -- Array of criteria objects
  
  -- Metadata
  source_url VARCHAR(500),
  scheme_type VARCHAR(100),  -- e.g., "Central", "State", "Private"
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Example eligibility_criteria JSONB:
-- [
--   {
--     "id": "gst_registration",
--     "name": "GST Registration",
--     "description": "Company must have GST registration or pending status",
--     "required": true,
--     "impact": "high"
--   },
--   {
--     "id": "dpiit_recognition",
--     "name": "DPIIT Recognition",
--     "description": "Recommended to have DPIIT startup recognition",
--     "required": false,
--     "impact": "medium"
--   }
-- ]

CREATE INDEX idx_schemes_sectors ON schemes USING GIN(eligible_sectors);
CREATE INDEX idx_schemes_stages ON schemes USING GIN(eligible_stages);
CREATE INDEX idx_schemes_funding ON schemes(funding_min, funding_max);
```

### 3. matches Table (Optional, for Persistence)
Cached matching results between profiles and schemes.

```sql
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  scheme_id UUID NOT NULL REFERENCES schemes(id) ON DELETE CASCADE,
  
  compatibility_score INTEGER NOT NULL,  -- 0-100
  
  -- Full match analysis stored as JSONB
  match_data JSONB NOT NULL,  -- Contains: matched criteria, missing requirements, reasoning
  
  fallback_mode BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,  -- For cache expiration (1 hour TTL)
  
  UNIQUE(profile_id, scheme_id)
);

-- Example match_data JSONB:
-- {
--   "matchedCriteria": [...],
--   "missingRequirements": [...],
--   "overallReasoning": "...",
--   "nextSteps": [...]
-- }

CREATE INDEX idx_matches_profile_id ON matches(profile_id);
CREATE INDEX idx_matches_score ON matches(compatibility_score DESC);
CREATE INDEX idx_matches_expires_at ON matches(expires_at);
```

### 4. action_plans Table (Optional)
Generated action plans.

```sql
CREATE TABLE action_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  scheme_id UUID NOT NULL REFERENCES schemes(id) ON DELETE CASCADE,
  
  -- Action plan stored as JSONB
  action_data JSONB NOT NULL,  -- Array of steps
  
  total_estimated_time VARCHAR(100),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  
  UNIQUE(profile_id, scheme_id)
);

-- Example action_data JSONB:
-- {
--   "actionPlan": [
--     {
--       "stepNumber": 1,
--       "title": "Register DPIIT",
--       "description": "...",
--       "priority": "critical",
--       "estimatedTime": "2 hours",
--       "requiredDocuments": [...]
--     }
--   ],
--   "totalEstimatedTime": "4-5 days"
-- }

CREATE INDEX idx_action_plans_profile_id ON action_plans(profile_id);
```

---

## Demo Data Seeding

### Sample Schemes to Seed

**Seed these 15-20 schemes into the database:**

1. **STARTUP INDIA Scheme**
   - Sectors: All
   - Stages: Pre-seed, Seed, Series A, Series B
   - Funding: ₹0-₹1000L
   - Locations: Pan India

2. **NASSCOM Startup Scheme**
   - Sectors: Technology
   - Stages: Seed, Series A
   - Funding: ₹25L-₹100L
   - Locations: Pan India

3. **ICICI Foundation for Entrepreneurship**
   - Sectors: All
   - Stages: Seed, Series A
   - Funding: ₹10L-₹100L
   - Locations: Pan India

4. **Google Startup School (Free)**
   - Sectors: All
   - Stages: Seed
   - Funding: None (Mentorship)
   - Locations: Pan India

5. **Accel Fellowship**
   - Sectors: Technology
   - Stages: Pre-seed, Seed
   - Funding: ₹10L-₹50L
   - Locations: Bangalore, Mumbai, Delhi

6. **YourStory Accelerator**
   - Sectors: All
   - Stages: Pre-seed, Seed
   - Funding: ₹15L-₹50L
   - Locations: Pan India

7. **NASSCOM 10000 Startups**
   - Sectors: Technology
   - Stages: Seed, Series A
   - Funding: ₹25L-₹200L
   - Locations: Pan India

8. **Department of Science & Technology (DST) Grant**
   - Sectors: DeepTech, AI/ML, Biotech
   - Stages: Seed, Series A
   - Funding: ₹20L-₹100L
   - Locations: Pan India

9. **MSME Udyam Scheme**
   - Sectors: All
   - Stages: All
   - Funding: ₹0-₹500L
   - Locations: Pan India

10. **Telangana T-Hub**
    - Sectors: Technology, Biotech
    - Stages: Seed, Series A
    - Funding: ₹10L-₹100L
    - Locations: Telangana

... (add 5-10 more for variety)

**Seeding Script Example (SQL):**

```sql
INSERT INTO schemes (name, description, eligible_sectors, eligible_stages, eligible_locations, funding_min, funding_max, eligibility_criteria, source_url, scheme_type) VALUES

('STARTUP INDIA Scheme', 
 'Comprehensive scheme by Government of India to support startups with taxation benefits, faster approval, etc.',
 ARRAY['EdTech', 'FinTech', 'HealthTech', 'ClimaTech', 'AI/ML', 'AgriTech'],
 ARRAY['Pre-seed', 'Seed', 'Series A', 'Series B'],
 ARRAY['Pan India'],
 0, 1000,
 '[
   {"id": "registration", "name": "Company Registration", "required": true, "impact": "high"},
   {"id": "gst", "name": "GST Registration or Pending", "required": false, "impact": "medium"}
 ]'::jsonb,
 'https://www.startupindia.gov.in',
 'Central');

-- ... (repeat for each scheme)
```

---

## API Endpoints

### 1. POST /api/profiles
**Create a new startup profile**

```
Request:
{
  "name": "TechStart India",
  "sector": "EdTech",
  "stage": "Seed",
  "location": "Bangalore",
  "fundingNeeded": 50,
  "founderExperience": "First-time"
}

Response (201):
{
  "success": true,
  "profile": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "TechStart India",
    "sector": "EdTech",
    "stage": "Seed",
    "location": "Bangalore",
    "fundingNeeded": 50,
    "founderExperience": "First-time",
    "createdAt": "2026-09-26T10:30:00Z"
  }
}

Response (400):
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "sector": "Invalid sector"
  }
}
```

**Validation:**
- name: required, max 255 chars
- sector: required, must be in predefined list
- stage: required, must be in predefined list
- location: required, must be valid Indian state
- fundingNeeded: required, positive integer
- founderExperience: required, must be in predefined list

---

### 2. GET /api/schemes
**List all available schemes**

```
Request:
GET /api/schemes

Response (200):
{
  "success": true,
  "schemes": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "STARTUP INDIA Scheme",
      "description": "...",
      "eligibleSectors": ["EdTech", "FinTech", ...],
      "eligibleStages": ["Pre-seed", "Seed", ...],
      "eligibleLocations": ["Pan India"],
      "fundingMin": 0,
      "fundingMax": 1000,
      "sourceUrl": "https://...",
      "schemeType": "Central"
    },
    ...
  ],
  "totalCount": 20
}
```

---

### 3. POST /api/matches/analyze
**Analyze profile against all schemes (main matching endpoint)**

```
Request:
{
  "profileId": "550e8400-e29b-41d4-a716-446655440000"
}

Response (200):
{
  "success": true,
  "profileId": "550e8400-e29b-41d4-a716-446655440000",
  "matches": [
    {
      "profileId": "550e8400-e29b-41d4-a716-446655440000",
      "schemeId": "550e8400-e29b-41d4-a716-446655440001",
      "schemeName": "STARTUP INDIA Scheme",
      "compatibilityScore": 92,
      "eligibilityStatus": "FULLY_ELIGIBLE",
      "matchedCriteria": [
        {
          "name": "Sector Match",
          "status": "met",
          "explanation": "EdTech is in eligible sectors"
        }
      ],
      "missingRequirements": [
        {
          "name": "GST Registration",
          "status": "missing",
          "impact": "high",
          "howToFix": "Apply on GST portal (1-2 days)"
        }
      ],
      "overallReasoning": "Strong match for your seed-stage EdTech startup",
      "nextSteps": ["Register GST", "Apply to STARTUP INDIA", ...]
    },
    ... (top 10 schemes, ranked by score descending)
  ],
  "totalTime": 3.2,
  "processedSchemes": 20
}

Response (500, Claude API down - fallback mode):
{
  "success": true,
  "profileId": "...",
  "matches": [...],
  "fallbackMode": true,
  "fallbackReason": "Claude API temporarily unavailable. Using formula-based matching."
}
```

**Backend Logic:**
1. Validate profileId exists
2. Fetch all schemes from database
3. For each scheme:
   - Check Redis cache first
   - If cached, use cached result
   - If not cached:
     - Call Claude API with prompt
     - Parse response
     - Store in Redis (1 hour TTL)
4. Sort matches by compatibility_score DESC
5. Return top 10
6. If Claude API fails, use fallback formula

---

### 4. GET /api/schemes/:schemeId
**Get single scheme details**

```
Request:
GET /api/schemes/550e8400-e29b-41d4-a716-446655440001

Response (200):
{
  "success": true,
  "scheme": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "STARTUP INDIA Scheme",
    "description": "Full description...",
    "eligibleSectors": [...],
    "eligibleStages": [...],
    "eligibleLocations": [...],
    "fundingMin": 0,
    "fundingMax": 1000,
    "eligibilityCriteria": [
      {
        "id": "registration",
        "name": "Company Registration",
        "description": "Must be registered in India",
        "required": true,
        "impact": "high"
      }
    ],
    "sourceUrl": "https://...",
    "schemeType": "Central"
  }
}

Response (404):
{
  "success": false,
  "error": "Scheme not found"
}
```

---

### 5. GET /api/matches/:profileId/:schemeId
**Get detailed match analysis for a specific scheme**

```
Request:
GET /api/matches/550e8400-e29b-41d4-a716-446655440000/550e8400-e29b-41d4-a716-446655440001

Response (200):
{
  "success": true,
  "match": {
    "profileId": "...",
    "schemeId": "...",
    "schemeName": "STARTUP INDIA Scheme",
    "compatibilityScore": 92,
    "eligibilityStatus": "FULLY_ELIGIBLE",
    "matchedCriteria": [
      {
        "name": "Sector Match",
        "status": "met",
        "explanation": "EdTech is in eligible sectors"
      },
      {
        "name": "Stage Match",
        "status": "met",
        "explanation": "Seed is an eligible stage"
      },
      ...
    ],
    "missingRequirements": [
      {
        "name": "GST Registration",
        "status": "missing",
        "impact": "high",
        "howToFix": "Apply on GST portal (1-2 days)"
      }
    ],
    "scoreBreakdown": {
      "sectorMatch": 25,
      "stageMatch": 25,
      "locationMatch": 15,
      "fundingRangeMatch": 20,
      "eligibilityCompleteness": 7
    },
    "overallReasoning": "Your startup is 92% compatible with STARTUP INDIA Scheme...",
    "nextSteps": [...]
  }
}
```

---

### 6. GET /api/action-plans/:profileId/:schemeId
**Generate action plan for applying to a scheme**

```
Request:
GET /api/action-plans/550e8400-e29b-41d4-a716-446655440000/550e8400-e29b-41d4-a716-446655440001

Response (200):
{
  "success": true,
  "actionPlan": {
    "profileId": "...",
    "schemeId": "...",
    "schemeName": "STARTUP INDIA Scheme",
    "steps": [
      {
        "stepNumber": 1,
        "title": "Register DPIIT Startup",
        "description": "Complete startup recognition on dpiit.gov.in",
        "priority": "critical",
        "estimatedTime": "2 hours",
        "requiredDocuments": ["PAN", "Address Proof", "Board Resolution"],
        "deadline": "Before STARTUP INDIA application",
        "contactDetails": "https://dpiit.gov.in/contact"
      },
      {
        "stepNumber": 2,
        "title": "Apply for GST Registration",
        "description": "Register company on GST portal",
        "priority": "critical",
        "estimatedTime": "1-2 days",
        "requiredDocuments": ["PAN", "Address Proof", "Bank Details"],
        "deadline": "Critical - before application",
        "contactDetails": "https://gst.gov.in"
      },
      ...
    ],
    "totalEstimatedTime": "4-5 days",
    "timeline": [
      {
        "day": 1,
        "activities": ["Register DPIIT", "Apply GST"],
        "expected": "Pending status"
      }
    ],
    "successCriteria": "All required documents obtained"
  }
}

Response (500, Claude API down):
{
  "success": true,
  "actionPlan": {...},
  "fallbackMode": true,
  "fallbackReason": "Using generic action plan (details may be less accurate)"
}
```

**Backend Logic:**
1. Validate profileId and schemeId
2. Check Redis cache
3. If cached, return cached plan
4. If not cached:
   - Call Claude API with action plan prompt
   - Parse response
   - Store in Redis (4 hour TTL)
   - Return to frontend

---

## Error Handling

### Common Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "fundingNeeded": "Must be a positive number"
  }
}
```

**404 Not Found:**
```json
{
  "success": false,
  "error": "Resource not found",
  "message": "Profile with ID xxx not found"
}
```

**500 Internal Error:**
```json
{
  "success": false,
  "error": "Internal server error",
  "message": "Database connection failed"
}
```

**503 Service Unavailable:**
```json
{
  "success": false,
  "error": "Claude API unavailable",
  "fallbackMode": true,
  "message": "Using formula-based matching instead"
}
```

### Error Codes
- 400: Validation failed
- 404: Resource not found
- 500: Server error
- 503: External service unavailable (Claude API)

---

## Request/Response Examples

### Complete Flow Example

**Step 1: Create Profile**
```bash
curl -X POST http://localhost:3000/api/profiles \
  -H "Content-Type: application/json" \
  -d '{
    "name": "HealthTech Solutions",
    "sector": "HealthTech",
    "stage": "Seed",
    "location": "Delhi",
    "fundingNeeded": 30,
    "founderExperience": "First-time"
  }'

# Response:
# {
#   "success": true,
#   "profile": {
#     "id": "abc-123-def-456",
#     ...
#   }
# }
```

**Step 2: Analyze Matches**
```bash
curl http://localhost:3000/api/matches/analyze \
  -H "Content-Type: application/json" \
  -d '{"profileId": "abc-123-def-456"}'

# Response: Top 10 matching schemes ranked by score
```

**Step 3: View Scheme Details**
```bash
curl http://localhost:3000/api/schemes/scheme-id-1

# Response: Full scheme details
```

**Step 4: Get Action Plan**
```bash
curl http://localhost:3000/api/action-plans/abc-123-def-456/scheme-id-1

# Response: 5-10 step action plan
```

---

## Performance Targets

| Operation | Target Time |
|-----------|-------------|
| Create profile | < 100ms |
| List schemes | < 200ms |
| Analyze all schemes | < 5s (with Claude API) |
| Get single match detail | < 500ms |
| Generate action plan | < 3s (with Claude API) |
| List top 10 matches | < 1s |

---

## Database Initialization Script

```bash
# 1. Create database
createdb fundmatch_ai

# 2. Run migrations
psql fundmatch_ai < schemas/01_tables.sql
psql fundmatch_ai < schemas/02_indexes.sql

# 3. Seed demo data
psql fundmatch_ai < data/schemes.sql
```

---

## Environment Variables

```
DATABASE_URL=postgresql://user:password@localhost:5432/fundmatch_ai
REDIS_URL=redis://localhost:6379
CLAUDE_API_KEY=sk-ant-...
NODE_ENV=development
PORT=3000
```
