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
  'Central recognition programme for Indian startups, covering tax and compliance benefits across sectors.',
  ARRAY['EdTech', 'FinTech', 'HealthTech', 'ClimaTech', 'AI/ML', 'AgriTech', 'DeepTech', 'Biotech', 'Other'],
  ARRAY['Pre-seed', 'Seed', 'Series A', 'Series B'],
  ARRAY['Pan India'],
  0,
  1000,
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
  'Registration and credit-linked support for micro, small, and medium enterprises across India.',
  ARRAY['EdTech', 'FinTech', 'HealthTech', 'ClimaTech', 'AI/ML', 'AgriTech', 'DeepTech', 'Biotech', 'Other'],
  ARRAY['Pre-seed', 'Seed', 'Series A', 'Series B'],
  ARRAY['Pan India'],
  0,
  500,
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
  'Central seed fund routed through incubators for prototype and market-entry grants.',
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
  'Grant for biotech and health startups proving a lab or clinical idea.',
  ARRAY['Biotech', 'HealthTech'],
  ARRAY['Pre-seed', 'Seed'],
  ARRAY['Pan India'],
  10,
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
  'MeitY accelerator support for product startups that already have early traction and a larger cheque.',
  ARRAY['AI/ML', 'DeepTech', 'FinTech'],
  ARRAY['Seed', 'Series A'],
  ARRAY['Pan India'],
  40,
  100,
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
  'NITI Aayog platform that connects women-led startups to schemes, incubators, and mentors.',
  ARRAY['EdTech', 'FinTech', 'HealthTech', 'ClimaTech', 'AI/ML', 'AgriTech', 'DeepTech', 'Biotech', 'Other'],
  ARRAY['Pre-seed', 'Seed', 'Series A', 'Series B'],
  ARRAY['Pan India'],
  0,
  100,
  '[
    {"id": "registration", "name": "Company Registration", "description": "Indian registered enterprise", "required": true, "impact": "high"},
    {"id": "women", "name": "Women-led enterprise", "description": "At least one woman founder or a women-majority leadership team", "required": true, "impact": "high"},
    {"id": "dpiit", "name": "DPIIT Recognition", "description": "DPIIT recognition is recommended", "required": false, "impact": "medium"}
  ]'::jsonb,
  'https://wep.gov.in',
  'Central'
);
