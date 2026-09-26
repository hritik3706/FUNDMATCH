const LOCATION_ALIASES: Record<string, string> = {
  bangalore: "karnataka",
  bengaluru: "karnataka",
  mumbai: "maharashtra",
  delhi: "delhi",
  "new delhi": "delhi",
  hyderabad: "telangana",
};

function key(value: string): string {
  const normalized = value.trim().toLowerCase();
  return LOCATION_ALIASES[normalized] ?? normalized;
}

export function locationScore(location: string, eligibleLocations: string[]): number {
  if (eligibleLocations.some((item) => key(item) === "pan india")) {
    return 1;
  }
  const profileLocation = key(location);
  if (eligibleLocations.some((item) => key(item) === profileLocation || item.trim().toLowerCase() === location.trim().toLowerCase())) {
    return 1;
  }
  return 0;
}
