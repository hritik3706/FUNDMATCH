INSERT INTO schemes (
  name,
  description,
  eligible_sectors,
  eligible_stages,
  eligible_locations,
  funding_min,
  funding_max,
  eligibility_criteria,
  source_url,
  scheme_type
) VALUES
(
  'STARTUP INDIA Scheme',
  'DPIIT recognition for Indian startups. It unlocks tax and compliance benefits and is not a capital grant.',
  ARRAY['EdTech', 'FinTech', 'HealthTech', 'ClimaTech', 'AI/ML', 'AgriTech', 'DeepTech', 'Biotech', 'Other'],
  ARRAY['Pre-seed', 'Seed', 'Series A', 'Series B'],
  ARRAY['Pan India'],
  0,
  0,
  '[
    {"id": "registration", "name": "Company Registration", "description": "Must be a private limited company, partnership, or LLP registered in India", "required": true, "impact": "high"},
    {"id": "gst", "name": "GST Registration", "description": "GST registration or a pending application is recommended", "required": false, "impact": "medium"},
    {"id": "dpiit", "name": "DPIIT Recognition", "description": "DPIIT startup recognition is the core of this scheme", "required": true, "impact": "high"}
  ]'::jsonb,
  'https://www.startupindia.gov.in',
  'Central'
),
(
  'NASSCOM Startup Scheme',
  'Technology startup programme focused on product companies from seed through Series A.',
  ARRAY['EdTech', 'FinTech', 'AI/ML', 'DeepTech'],
  ARRAY['Seed', 'Series A'],
  ARRAY['Pan India'],
  25,
  100,
  '[
    {"id": "registration", "name": "Company Registration", "description": "Must be incorporated in India", "required": true, "impact": "high"},
    {"id": "gst", "name": "GST Registration", "description": "GST registration or pending status", "required": true, "impact": "high"},
    {"id": "dpiit", "name": "DPIIT Recognition", "description": "DPIIT recognition is recommended but not mandatory", "required": false, "impact": "medium"}
  ]'::jsonb,
  'https://www.nasscom.in',
  'Private'
),
(
  'ICICI Foundation for Entrepreneurship',
  'Seed and Series A support for early companies that need capital and mentoring.',
  ARRAY['EdTech', 'FinTech', 'HealthTech', 'ClimaTech', 'AI/ML', 'AgriTech', 'DeepTech', 'Biotech', 'Other'],
  ARRAY['Seed', 'Series A'],
  ARRAY['Pan India'],
  10,
  100,
  '[
    {"id": "registration", "name": "Incorporation Certificate", "description": "Company must already be incorporated", "required": true, "impact": "high"},
    {"id": "gst", "name": "GST Registration", "description": "GST registration strengthens the application", "required": false, "impact": "medium"}
  ]'::jsonb,
  'https://www.icicifoundation.org',
  'Private'
),
(
  'Google Startup School',
  'Mentorship programme for seed-stage founders. It does not deploy capital.',
  ARRAY['EdTech', 'FinTech', 'HealthTech', 'ClimaTech', 'AI/ML', 'AgriTech', 'DeepTech', 'Biotech', 'Other'],
  ARRAY['Seed'],
  ARRAY['Pan India'],
  0,
  0,
  '[
    {"id": "registration", "name": "Company Registration", "description": "A registered Indian startup is expected", "required": true, "impact": "high"},
    {"id": "founder", "name": "Founding team available", "description": "At least one founder must attend the programme", "required": true, "impact": "medium"}
  ]'::jsonb,
  'https://startupschool.withgoogle.com',
  'Private'
),
(
  'Accel Fellowship',
  'Pre-seed and seed fellowship for technology founders in Bangalore, Mumbai, and Delhi.',
  ARRAY['EdTech', 'FinTech', 'AI/ML', 'DeepTech'],
  ARRAY['Pre-seed', 'Seed'],
  ARRAY['Bangalore', 'Mumbai', 'Delhi'],
  10,
  50,
  '[
    {"id": "registration", "name": "Company Registration", "description": "Incorporated or in the process of incorporating in India", "required": true, "impact": "high"},
    {"id": "dpiit", "name": "DPIIT Recognition", "description": "DPIIT recognition is preferred", "required": false, "impact": "low"}
  ]'::jsonb,
  'https://www.accel.com',
  'Private'
),
(
  'YourStory Accelerator',
  'Accelerator for pre-seed and seed startups across sectors.',
  ARRAY['EdTech', 'FinTech', 'HealthTech', 'ClimaTech', 'AI/ML', 'AgriTech', 'DeepTech', 'Biotech', 'Other'],
  ARRAY['Pre-seed', 'Seed'],
  ARRAY['Pan India'],
  15,
  50,
  '[
    {"id": "registration", "name": "Incorporation Certificate", "description": "Must hold a certificate of incorporation", "required": true, "impact": "high"},
    {"id": "gst", "name": "GST Registration", "description": "GST registration is recommended before demo day", "required": false, "impact": "medium"}
  ]'::jsonb,
  'https://yourstory.com',
  'Private'
),
(
  'NASSCOM 10000 Startups',
  'Scale support for technology startups from seed to Series A with a wider cheque size.',
  ARRAY['EdTech', 'FinTech', 'AI/ML', 'DeepTech', 'HealthTech'],
  ARRAY['Seed', 'Series A'],
  ARRAY['Pan India'],
  25,
  200,
  '[
    {"id": "registration", "name": "Company Registration", "description": "Must be registered in India", "required": true, "impact": "high"},
    {"id": "dpiit", "name": "DPIIT Recognition", "description": "DPIIT recognition is required", "required": true, "impact": "high"},
    {"id": "gst", "name": "GST Registration", "description": "Active GST registration", "required": true, "impact": "high"}
  ]'::jsonb,
  'https://10000startups.com',
  'Private'
),
(
  'Department of Science & Technology (DST) Grant',
  'Central grant for deep-tech, AI, and biotech companies at seed and Series A.',
  ARRAY['DeepTech', 'AI/ML', 'Biotech'],
  ARRAY['Seed', 'Series A'],
  ARRAY['Pan India'],
  20,
  100,
  '[
    {"id": "registration", "name": "Company Registration", "description": "Indian registered company", "required": true, "impact": "high"},
    {"id": "dpiit", "name": "DPIIT Recognition", "description": "DPIIT recognition is required for the grant", "required": true, "impact": "high"},
    {"id": "ip", "name": "Technical proof", "description": "Must show a technical prototype or research basis", "required": true, "impact": "high"}
  ]'::jsonb,
  'https://dst.gov.in',
  'Central'
),
(
  'MSME Udyam Scheme',
  'Udyam registration for micro, small, and medium enterprises. It is an identity record, not a capital grant.',
  ARRAY['EdTech', 'FinTech', 'HealthTech', 'ClimaTech', 'AI/ML', 'AgriTech', 'DeepTech', 'Biotech', 'Other'],
  ARRAY['Pre-seed', 'Seed'],
  ARRAY['Pan India'],
  0,
  0,
  '[
    {"id": "udyam", "name": "Udyam Registration", "description": "Enterprise should register on the Udyam portal", "required": true, "impact": "high"},
    {"id": "gst", "name": "GST Registration", "description": "GST registration where turnover requires it", "required": false, "impact": "medium"}
  ]'::jsonb,
  'https://udyamregistration.gov.in',
  'Central'
),
(
  'Telangana T-Hub',
  'State incubator for technology and biotech startups based in Telangana.',
  ARRAY['HealthTech', 'Biotech', 'AI/ML', 'DeepTech'],
  ARRAY['Seed', 'Series A'],
  ARRAY['Telangana'],
  10,
  100,
  '[
    {"id": "registration", "name": "Company Registration", "description": "Company should be registered in India, preferably in Telangana", "required": true, "impact": "high"},
    {"id": "dpiit", "name": "DPIIT Recognition", "description": "DPIIT recognition is recommended", "required": false, "impact": "medium"}
  ]'::jsonb,
  'https://t-hub.co',
  'State'
),
(
  'Startup India Seed Fund Scheme',
  'DPIIT seed fund through incubators: up to Rs 20 lakh as a grant for proof of concept, and up to Rs 50 lakh as debt or convertible debentures for market entry.',
  ARRAY['EdTech', 'FinTech', 'HealthTech', 'ClimaTech', 'AI/ML', 'AgriTech', 'DeepTech', 'Biotech', 'Other'],
  ARRAY['Pre-seed', 'Seed'],
  ARRAY['Pan India'],
  0,
  50,
  '[
    {"id": "dpiit", "name": "DPIIT Recognition", "description": "DPIIT recognition is mandatory", "required": true, "impact": "high"},
    {"id": "registration", "name": "Incorporation Certificate", "description": "Company must be incorporated not more than two years before application", "required": true, "impact": "high"},
    {"id": "gst", "name": "GST Registration", "description": "GST registration is recommended", "required": false, "impact": "low"}
  ]'::jsonb,
  'https://seedfund.startupindia.gov.in',
  'Central'
),
(
  'BIRAC Biotechnology Ignition Grant',
  'BIRAC grant-in-aid of up to Rs 50 lakh for 18 months to take a biotech idea to proof of concept.',
  ARRAY['Biotech', 'HealthTech'],
  ARRAY['Pre-seed', 'Seed'],
  ARRAY['Pan India'],
  0,
  50,
  '[
    {"id": "registration", "name": "Company Registration", "description": "Indian registered company, LLP, or academic spinout", "required": true, "impact": "high"},
    {"id": "dpiit", "name": "DPIIT Recognition", "description": "Startup recognition is expected", "required": true, "impact": "high"},
    {"id": "proof", "name": "Technical proof", "description": "Must show a biotech or health proof of concept", "required": true, "impact": "high"}
  ]'::jsonb,
  'https://www.birac.nic.in',
  'Central'
),
(
  'MeitY SAMRIDH',
  'MeitY matching investment of up to Rs 40 lakh for product startups in health, education, agriculture, fintech, software, and sustainability.',
  ARRAY['EdTech', 'FinTech', 'HealthTech', 'ClimaTech', 'AI/ML', 'AgriTech', 'DeepTech'],
  ARRAY['Seed', 'Series A'],
  ARRAY['Pan India'],
  0,
  40,
  '[
    {"id": "dpiit", "name": "DPIIT Recognition", "description": "DPIIT recognition is required", "required": true, "impact": "high"},
    {"id": "registration", "name": "Incorporation Certificate", "description": "Must be incorporated in India", "required": true, "impact": "high"},
    {"id": "gst", "name": "GST Registration", "description": "GST registration is required", "required": true, "impact": "medium"}
  ]'::jsonb,
  'https://www.meity.gov.in',
  'Central'
),
(
  'Karnataka Elevate',
  'State programme for Karnataka startups, including health and deep-tech, at seed and Series A.',
  ARRAY['EdTech', 'AI/ML', 'DeepTech', 'HealthTech'],
  ARRAY['Seed', 'Series A'],
  ARRAY['Karnataka'],
  10,
  50,
  '[
    {"id": "registration", "name": "Company Registration", "description": "Registered in Karnataka or willing to register there", "required": true, "impact": "high"},
    {"id": "dpiit", "name": "DPIIT Recognition", "description": "DPIIT recognition is recommended", "required": false, "impact": "medium"}
  ]'::jsonb,
  'https://elevate.karnataka.gov.in',
  'State'
),
(
  'UP Startup Policy',
  'Uttar Pradesh incentive and seed support for startups operating in the state.',
  ARRAY['EdTech', 'FinTech', 'HealthTech', 'ClimaTech', 'AI/ML', 'AgriTech', 'DeepTech', 'Biotech', 'Other'],
  ARRAY['Pre-seed', 'Seed'],
  ARRAY['Uttar Pradesh'],
  5,
  100,
  '[
    {"id": "registration", "name": "Company Registration", "description": "Unit should be registered in Uttar Pradesh", "required": true, "impact": "high"},
    {"id": "dpiit", "name": "DPIIT Recognition", "description": "DPIIT recognition is required for the incentive", "required": true, "impact": "high"}
  ]'::jsonb,
  'https://startinup.up.gov.in',
  'State'
),
(
  'Gujarat Startup Policy',
  'State sustenance and seed support for startups registered in Gujarat.',
  ARRAY['EdTech', 'FinTech', 'HealthTech', 'ClimaTech', 'AI/ML', 'AgriTech', 'DeepTech', 'Biotech', 'Other'],
  ARRAY['Seed', 'Series A'],
  ARRAY['Gujarat'],
  10,
  100,
  '[
    {"id": "registration", "name": "Company Registration", "description": "Registered office in Gujarat", "required": true, "impact": "high"},
    {"id": "gst", "name": "GST Registration", "description": "GST registration in Gujarat", "required": true, "impact": "medium"}
  ]'::jsonb,
  'https://startupgujarat.in',
  'State'
),
(
  'AIM PRIME',
  'Atal Innovation Mission programme for deep-tech and research-led seed startups.',
  ARRAY['DeepTech', 'AI/ML', 'Biotech'],
  ARRAY['Seed'],
  ARRAY['Pan India'],
  0,
  25,
  '[
    {"id": "dpiit", "name": "DPIIT Recognition", "description": "DPIIT recognition is required", "required": true, "impact": "high"},
    {"id": "registration", "name": "Incorporation Certificate", "description": "Must be incorporated in India", "required": true, "impact": "high"},
    {"id": "research", "name": "Technical proof", "description": "Must show a research-backed prototype", "required": true, "impact": "high"}
  ]'::jsonb,
  'https://aim.gov.in',
  'Central'
),
(
  'Women Entrepreneurship Platform',
  'NITI Aayog platform that connects women-led startups to schemes and mentors. It does not itself write a cheque.',
  ARRAY['EdTech', 'FinTech', 'HealthTech', 'ClimaTech', 'AI/ML', 'AgriTech', 'DeepTech', 'Biotech', 'Other'],
  ARRAY['Pre-seed', 'Seed', 'Series A', 'Series B'],
  ARRAY['Pan India'],
  0,
  0,
  '[
    {"id": "registration", "name": "Company Registration", "description": "Indian registered enterprise", "required": true, "impact": "high"},
    {"id": "women", "name": "Women-led enterprise", "description": "At least one woman founder or a women-majority leadership team", "required": true, "impact": "high"},
    {"id": "dpiit", "name": "DPIIT Recognition", "description": "DPIIT recognition is recommended", "required": false, "impact": "medium"}
  ]'::jsonb,
  'https://wep.gov.in',
  'Central'
);

INSERT INTO schemes (
  name,
  description,
  eligible_sectors,
  eligible_stages,
  eligible_locations,
  funding_min,
  funding_max,
  eligibility_criteria,
  source_url,
  scheme_type
) VALUES
(
  'Prime Minister Employment Generation Programme',
  'MSME credit-linked subsidy for new non-farm micro units. Manufacturing projects are admissible up to Rs 50 lakh and service projects up to Rs 20 lakh. The subsidy is 15 percent for the general category in urban areas and up to 35 percent for special categories.',
  ARRAY['EdTech', 'FinTech', 'HealthTech', 'ClimaTech', 'AI/ML', 'AgriTech', 'DeepTech', 'Biotech', 'Other'],
  ARRAY['Pre-seed', 'Seed'],
  ARRAY['Pan India'],
  0,
  50,
  '[
    {"id": "age", "name": "Minimum age 18", "description": "The applicant must be above 18 years of age", "required": true, "impact": "high"},
    {"id": "education", "name": "Class 8 for larger projects", "description": "At least Class 8 is required for manufacturing projects above Rs 10 lakh and service projects above Rs 5 lakh", "required": false, "impact": "medium"},
    {"id": "new_unit", "name": "No earlier subsidy", "description": "Units that already took a Government of India subsidy are not eligible for a new-unit PMEGP loan", "required": true, "impact": "high"}
  ]'::jsonb,
  'https://www.msme.gov.in',
  'Central'
),
(
  'Stand-Up India',
  'Bank loan from Rs 10 lakh to Rs 1 crore for a greenfield enterprise set up by an SC or ST founder or a woman founder.',
  ARRAY['EdTech', 'FinTech', 'HealthTech', 'ClimaTech', 'AI/ML', 'AgriTech', 'DeepTech', 'Biotech', 'Other'],
  ARRAY['Seed'],
  ARRAY['Pan India'],
  10,
  100,
  '[
    {"id": "founder", "name": "SC, ST, or woman founder", "description": "At least one SC or ST borrower, or a woman borrower, must hold the enterprise", "required": true, "impact": "high"},
    {"id": "greenfield", "name": "Greenfield enterprise", "description": "The project must be a new enterprise, not an expansion of an existing one", "required": true, "impact": "high"},
    {"id": "registration", "name": "Company Registration", "description": "The enterprise must be registered in India", "required": true, "impact": "high"}
  ]'::jsonb,
  'https://www.standupmitra.in',
  'Central'
),
(
  'Pradhan Mantri MUDRA Yojana',
  'Collateral-free bank loan for non-corporate small businesses. Shishu is up to Rs 50,000, Kishore up to Rs 5 lakh, and Tarun up to Rs 10 lakh.',
  ARRAY['Other'],
  ARRAY['Pre-seed', 'Seed'],
  ARRAY['Pan India'],
  0,
  10,
  '[
    {"id": "non_corporate", "name": "Non-corporate small business", "description": "The borrower should be a micro or small non-farm enterprise that is not a company", "required": true, "impact": "high"},
    {"id": "age", "name": "Adult borrower", "description": "The applicant must be an adult Indian resident", "required": true, "impact": "medium"}
  ]'::jsonb,
  'https://www.mudra.org.in',
  'Central'
),
(
  'NIDHI-PRAYAS',
  'DST grant of up to Rs 10 lakh to turn a prototype into a proof of concept before a company raises a seed round.',
  ARRAY['DeepTech', 'AI/ML', 'Biotech', 'HealthTech'],
  ARRAY['Pre-seed'],
  ARRAY['Pan India'],
  0,
  10,
  '[
    {"id": "prototype", "name": "Technical proof", "description": "The idea must be a hardware or technology prototype, not a pure service", "required": true, "impact": "high"},
    {"id": "registration", "name": "Innovator or incorporated startup", "description": "An individual innovator or an early Indian startup can apply through a PRAYAS centre", "required": true, "impact": "high"}
  ]'::jsonb,
  'https://dst.gov.in',
  'Central'
),
(
  'RKVY-RAFTAAR Agripreneurship',
  'Ministry of Agriculture seed-stage grant of up to Rs 25 lakh for agri startups.',
  ARRAY['AgriTech'],
  ARRAY['Pre-seed', 'Seed'],
  ARRAY['Pan India'],
  0,
  25,
  '[
    {"id": "sector", "name": "Agriculture innovation", "description": "The product or service must be for agriculture, food processing, or the agri value chain", "required": true, "impact": "high"},
    {"id": "dpiit", "name": "DPIIT Recognition", "description": "DPIIT recognition strengthens the application", "required": false, "impact": "medium"},
    {"id": "registration", "name": "Company Registration", "description": "A registered Indian startup is expected at the seed stage", "required": true, "impact": "high"}
  ]'::jsonb,
  'https://rkvy.da.gov.in',
  'Central'
);
