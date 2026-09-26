export function fundingScore(
  fundingNeeded: number,
  fundingMin: number,
  fundingMax: number,
): number {
  if (fundingNeeded < fundingMin) {
    return 0.5;
  }
  if (fundingNeeded > fundingMax) {
    return 0.3;
  }
  return 1;
}
