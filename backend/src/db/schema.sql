CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  sector VARCHAR(100) NOT NULL,
  stage VARCHAR(50) NOT NULL,
  location VARCHAR(100) NOT NULL,
  funding_needed INTEGER NOT NULL,
  founder_experience VARCHAR(50) NOT NULL,

  incorporation_date DATE,
  gst_status VARCHAR(50),
  dpiit_registration BOOLEAN DEFAULT FALSE,
  previous_funding INTEGER DEFAULT 0,
  website_url VARCHAR(500),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_profiles_sector ON profiles(sector);
CREATE INDEX idx_profiles_stage ON profiles(stage);
CREATE INDEX idx_profiles_created_at ON profiles(created_at DESC);

CREATE TABLE schemes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT NOT NULL,

  eligible_sectors TEXT[] NOT NULL,
  eligible_stages TEXT[] NOT NULL,
  eligible_locations TEXT[] NOT NULL,

  funding_min INTEGER NOT NULL,
  funding_max INTEGER NOT NULL,

  eligibility_criteria JSONB NOT NULL,

  source_url VARCHAR(500),
  scheme_type VARCHAR(100),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_schemes_sectors ON schemes USING GIN(eligible_sectors);
CREATE INDEX idx_schemes_stages ON schemes USING GIN(eligible_stages);
CREATE INDEX idx_schemes_funding ON schemes(funding_min, funding_max);

CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  scheme_id UUID NOT NULL REFERENCES schemes(id) ON DELETE CASCADE,

  compatibility_score INTEGER NOT NULL,
  match_data JSONB NOT NULL,
  fallback_mode BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,

  UNIQUE(profile_id, scheme_id)
);

CREATE INDEX idx_matches_profile_id ON matches(profile_id);
CREATE INDEX idx_matches_score ON matches(compatibility_score DESC);
CREATE INDEX idx_matches_expires_at ON matches(expires_at);

CREATE TABLE action_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  scheme_id UUID NOT NULL REFERENCES schemes(id) ON DELETE CASCADE,

  action_data JSONB NOT NULL,
  total_estimated_time VARCHAR(100),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,

  UNIQUE(profile_id, scheme_id)
);

CREATE INDEX idx_action_plans_profile_id ON action_plans(profile_id);
