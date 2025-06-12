export const tokenSlugMap: Record<string, string> = {
  KLED: "kled",
  DUPE: "dupe",
  PCULE: "pcule",
  GOONC: "goonc",
  FITCOIN: "fitcoin",
  STARTUP: "startup",
  YAPPER: "yapper",
  // add more as needed
};

export function getTokenSlug(symbol: string): string | undefined {
  return tokenSlugMap[(symbol || '').toUpperCase()];
}
