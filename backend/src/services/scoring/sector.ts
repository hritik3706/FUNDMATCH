const RELATED_SECTORS: Record<string, string[]> = {
  EdTech: ["AI/ML", "DeepTech"],
  FinTech: ["AI/ML", "DeepTech"],
  HealthTech: ["Biotech", "ClimaTech"],
  ClimaTech: ["HealthTech", "AgriTech"],
  "AI/ML": ["EdTech", "FinTech", "DeepTech"],
  AgriTech: ["ClimaTech"],
  DeepTech: ["AI/ML", "Biotech"],
  Biotech: ["HealthTech", "DeepTech"],
  Other: [],
};

function same(left: string, right: string): boolean {
  return left.trim().toLowerCase() === right.trim().toLowerCase();
}

export function sectorScore(sector: string, eligibleSectors: string[]): number {
  if (eligibleSectors.some((item) => same(item, "all"))) {
    return 1;
  }
  if (eligibleSectors.some((item) => same(item, sector))) {
    return 1;
  }
  const related = RELATED_SECTORS[sector] ?? [];
  if (eligibleSectors.some((item) => related.some((relatedSector) => same(relatedSector, item)))) {
    return 0.7;
  }
  return 0;
}
