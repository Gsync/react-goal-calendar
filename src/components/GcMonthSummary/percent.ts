// Consumer data is untyped at runtime: only finite numbers count, clamped to a full ring.
export function ringValue(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return Math.min(1, Math.max(0, value));
}

// Never says 100% before the goal is fully hit, nor 0% once anything counts. (Round arc ends
// can make 99% look full; the text is the exact one.)
export function percentText(value: number, format: Intl.NumberFormat): string {
  let whole = Math.round(value * 100);
  if (whole === 100 && value < 1) whole = 99;
  if (whole === 0 && value > 0) whole = 1;
  return format.format(whole / 100);
}
