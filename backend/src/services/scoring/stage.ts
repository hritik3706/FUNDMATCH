const STAGE_ORDER = ["Pre-seed", "Seed", "Series A", "Series B"];

function same(left: string, right: string): boolean {
  return left.trim().toLowerCase() === right.trim().toLowerCase();
}

export function stageScore(stage: string, eligibleStages: string[]): number {
  if (eligibleStages.some((item) => same(item, "all"))) {
    return 1;
  }
  if (eligibleStages.some((item) => same(item, stage))) {
    return 1;
  }
  const profileIndex = STAGE_ORDER.findIndex((item) => same(item, stage));
  if (profileIndex === -1) {
    return 0;
  }
  const adjacent = eligibleStages.some((item) => {
    const index = STAGE_ORDER.findIndex((stageName) => same(stageName, item));
    return index !== -1 && Math.abs(index - profileIndex) === 1;
  });
  return adjacent ? 0.8 : 0;
}
