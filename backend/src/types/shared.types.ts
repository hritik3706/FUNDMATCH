export const SECTORS = [
  "EdTech",
  "FinTech",
  "HealthTech",
  "ClimaTech",
  "AI/ML",
  "AgriTech",
  "DeepTech",
  "Biotech",
  "Other",
] as const;

export const STAGES = ["Pre-seed", "Seed", "Series A", "Series B"] as const;

export const FOUNDER_EXPERIENCE = [
  "First-time",
  "Serial",
  "Angel",
  "VC-backed",
] as const;

export const GST_STATUSES = ["Registered", "Pending", "No"] as const;

export const PROFILE_LOCATIONS = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
  "Bangalore",
  "Bengaluru",
  "Mumbai",
  "New Delhi",
] as const;

export type Sector = (typeof SECTORS)[number];
export type Stage = (typeof STAGES)[number];
export type FounderExperience = (typeof FOUNDER_EXPERIENCE)[number];
export type GstStatus = (typeof GST_STATUSES)[number];
export type ProfileLocation = (typeof PROFILE_LOCATIONS)[number];
