import type { Profile, SchemeMatch } from "@/lib/types";
import { formatInr, storedToInr } from "@/lib/extractStory";

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 48;

type DrawLine = { text: string; size: number; bold?: boolean };

function sanitize(value: string): string {
  return value
    .replace(/\u20b9/g, "Rs ")
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/\s+/g, " ")
    .replace(/[^\x20-\x7E]/g, "")
    .trim();
}

function wrap(text: string, size: number): string[] {
  const maxChars = Math.max(24, Math.floor((PAGE_WIDTH - MARGIN * 2) / (size * 0.52)));
  const words = sanitize(text).split(" ").filter(Boolean);
  if (words.length === 0) return [""];
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const pieces = word.length > maxChars ? word.match(new RegExp(`.{1,${maxChars}}`, "g")) ?? [word] : [word];
    for (const piece of pieces) {
      const next = current ? `${current} ${piece}` : piece;
      if (next.length > maxChars && current) {
        lines.push(current);
        current = piece;
      } else {
        current = next;
      }
    }
  }
  if (current) lines.push(current);
  return lines;
}

function escapePdf(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function eligibilityLabel(status: SchemeMatch["eligibilityStatus"]): string {
  switch (status) {
    case "FULLY_ELIGIBLE":
      return "Fully eligible";
    case "PARTIALLY_ELIGIBLE":
      return "Partially eligible";
    case "UNLIKELY_ELIGIBLE":
      return "Unlikely";
    default:
      return "Not eligible";
  }
}

function reportLines(profile: Profile, matches: SchemeMatch[]): DrawLine[] {
  const lines: DrawLine[] = [];
  const add = (text: string, size = 11, bold = false) => {
    for (const line of wrap(text, size)) lines.push({ text: line, size, bold });
  };
  const blank = () => lines.push({ text: "", size: 8 });

  add("FundMatch evaluation", 18, true);
  add(new Date().toLocaleString("en-IN"), 10);
  blank();
  add("Startup", 14, true);
  add(`${profile.name} · ${profile.sector} · ${profile.stage}`);
  add(`${profile.location} · Funding sought ${formatInr(storedToInr(profile.fundingNeeded))}`);
  add(`Website: ${profile.websiteUrl || "Not provided"}`);
  blank();
  add(`${matches.length} scheme${matches.length === 1 ? "" : "s"} ranked`, 14, true);

  matches.forEach((match, index) => {
    blank();
    add(`${index + 1}. ${match.schemeName}`, 13, true);
    add(`Score ${match.compatibilityScore} / 100 · ${eligibilityLabel(match.eligibilityStatus)}`, 11, true);
    add(match.overallReasoning);
    const breakdown = match.scoreBreakdown;
    add(
      `Sector ${breakdown.sectorMatch} · Stage ${breakdown.stageMatch} · Location ${breakdown.locationMatch} · Funding ${breakdown.fundingRangeMatch} · Eligibility ${breakdown.eligibilityCompleteness}${
        breakdown.ideaMatch !== undefined ? ` · Idea ${breakdown.ideaMatch}` : ""
      }`,
    );
    if (match.websiteIdea) add(`Website idea: ${match.websiteIdea}`);
    if (match.matchedCriteria.length > 0) {
      add("Matched:", 11, true);
      match.matchedCriteria.forEach((item) => add(`- ${item.name}: ${item.explanation}`));
    }
    if (match.missingRequirements.length > 0) {
      add("Missing:", 11, true);
      match.missingRequirements.forEach((item) => add(`- ${item.name} (${item.impact}): ${item.howToFix}`));
    }
    if (match.nextSteps.length > 0) {
      add("Next steps:", 11, true);
      match.nextSteps.forEach((step, stepIndex) => add(`${stepIndex + 1}. ${step}`));
    }
  });

  return lines;
}

function renderPage(lines: DrawLine[]): string {
  let y = PAGE_HEIGHT - MARGIN;
  const commands = ["BT"];
  for (const line of lines) {
    commands.push(`${line.bold ? "/F2" : "/F1"} ${line.size} Tf`);
    commands.push(`1 0 0 1 ${MARGIN} ${y.toFixed(2)} Tm`);
    commands.push(`(${escapePdf(line.text)}) Tj`);
    y -= line.size + 5;
  }
  commands.push("ET");
  return commands.join("\n");
}

function paginate(lines: DrawLine[]): string[] {
  const pages: DrawLine[][] = [];
  let page: DrawLine[] = [];
  let y = PAGE_HEIGHT - MARGIN;
  for (const line of lines) {
    const height = line.size + 5;
    if (y - height < MARGIN && page.length > 0) {
      pages.push(page);
      page = [];
      y = PAGE_HEIGHT - MARGIN;
    }
    page.push(line);
    y -= height;
  }
  if (page.length > 0) pages.push(page);
  return (pages.length > 0 ? pages : [[{ text: "FundMatch evaluation", size: 18, bold: true }]]).map(renderPage);
}

export function buildEvaluationPdf(profile: Profile, matches: SchemeMatch[]): Uint8Array {
  const contents = paginate(reportLines(profile, matches));
  const objects: string[] = [];
  const kids = contents.map((_, index) => `${5 + index * 2} 0 R`).join(" ");
  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[2] = `<< /Type /Pages /Kids [${kids}] /Count ${contents.length} >>`;
  objects[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
  objects[4] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>";
  contents.forEach((stream, index) => {
    const pageId = 5 + index * 2;
    objects[pageId] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Contents ${pageId + 1} 0 R /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> >>`;
    objects[pageId + 1] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
  });

  let body = "%PDF-1.4\n";
  const offsets = [0];
  for (let id = 1; id < objects.length; id += 1) {
    offsets[id] = body.length;
    body += `${id} 0 obj\n${objects[id]}\nendobj\n`;
  }
  const xrefStart = body.length;
  let xref = `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  for (let id = 1; id < objects.length; id += 1) {
    xref += `${String(offsets[id]).padStart(10, "0")} 00000 n \n`;
  }
  body += `${xref}trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return new TextEncoder().encode(body);
}

export function downloadEvaluationPdf(profile: Profile, matches: SchemeMatch[]) {
  const bytes = buildEvaluationPdf(profile, matches);
  const pdfBytes = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const slug = sanitize(profile.name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "startup";
  link.href = url;
  link.download = `${slug}-fundmatch-evaluation.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
