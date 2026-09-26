import { Scheme } from "../../types/scheme.types";

const SECTOR_TERMS: Record<string, string[]> = {
  EdTech: ["education", "learning", "school", "student", "teacher", "classroom", "edtech", "course", "tutor"],
  FinTech: ["payment", "finance", "bank", "lending", "credit", "insurance", "fintech", "wallet", "loan"],
  HealthTech: ["health", "hospital", "patient", "clinic", "medical", "doctor", "diagnostic", "healthcare"],
  ClimaTech: ["climate", "carbon", "renewable", "emission", "sustainability", "solar"],
  "AI/ML": ["artificial intelligence", "machine learning", "llm", "neural", "model"],
  AgriTech: ["farm", "farmer", "crop", "agriculture", "agri", "harvest"],
  DeepTech: ["robotics", "semiconductor", "hardware", "quantum", "deep tech"],
  Biotech: ["biotech", "genome", "molecule", "clinical", "laboratory", "pharma"],
  Other: ["startup", "business", "product", "service", "platform"],
};

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function termsFor(sectors: string[]): string[] {
  return sectors.flatMap((sector) => SECTOR_TERMS[sector] ?? [sector.toLowerCase()]);
}

export function inferSector(text: string): string | null {
  const idea = normalize(text);
  if (!idea) {
    return null;
  }

  let best: { sector: string; hits: number } | null = null;
  let tie = false;
  for (const [sector, terms] of Object.entries(SECTOR_TERMS)) {
    if (sector === "Other") {
      continue;
    }
    const hits = terms.filter((term) => idea.includes(term)).length;
    if (hits < 2) {
      continue;
    }
    if (!best || hits > best.hits) {
      best = { sector, hits };
      tie = false;
    } else if (hits === best.hits) {
      tie = true;
    }
  }

  if (!best || tie) {
    return null;
  }
  return best.sector;
}

export function ideaScore(ideaText: string, scheme: Scheme): number {
  const idea = normalize(ideaText);
  if (!idea) {
    return 0;
  }

  const sectorTerms = termsFor(scheme.eligibleSectors);
  const sectorHits = sectorTerms.filter((term) => idea.includes(term)).length;
  const sectorFit = sectorTerms.length === 0 ? 0.5 : Math.min(1, sectorHits / 2);

  const schemeWords = normalize(
    [scheme.name, scheme.description, ...scheme.eligibleSectors, ...scheme.eligibilityCriteria.map((item) => item.name)].join(" "),
  )
    .split(" ")
    .filter((word) => word.length > 4);
  const uniqueSchemeWords = [...new Set(schemeWords)];
  const overlap = uniqueSchemeWords.filter((word) => idea.includes(word)).length;
  const textFit = uniqueSchemeWords.length === 0 ? 0 : Math.min(1, overlap / 6);

  if (sectorHits > 0) {
    return Math.min(1, 0.65 + sectorFit * 0.25 + textFit * 0.1);
  }
  return Math.min(0.45, textFit);
}
