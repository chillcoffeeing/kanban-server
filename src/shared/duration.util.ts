const UNIT_MS: Record<string, number> = {
  ms: 1,
  s: 1000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
};

export function parseDurationToMs(input: string): number {
  const match = /^(\d+)\s*(ms|s|m|h|d)$/.exec(input.trim());
  if (!match) {
    const asNumber = Number(input);
    if (Number.isFinite(asNumber) && asNumber > 0) return asNumber * 1000;
    throw new Error(`Invalid duration: ${input}`);
  }
  const [, amount, unit] = match;
  return Number(amount) * UNIT_MS[unit];
}
