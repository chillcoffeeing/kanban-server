/**
 * Position calc for ordered lists using floats.
 * Insert between two items without renumbering siblings.
 */
export const POSITION_STEP = 1024;

export function positionBetween(prev?: number | null, next?: number | null): number {
  if (prev == null && next == null) return POSITION_STEP;
  if (prev == null) return (next as number) / 2;
  if (next == null) return prev + POSITION_STEP;
  return (prev + next) / 2;
}
