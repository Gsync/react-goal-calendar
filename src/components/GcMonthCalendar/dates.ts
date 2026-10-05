const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;
const MONTH_KEY = /^\d{4}-\d{2}$/;

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

// Local noon, so a DST switch at midnight can't move the date.
export function parseDateKey(key: string): Date {
  const [y = 0, m = 1, d = 1] = key.split("-").map(Number);
  return new Date(y, m - 1, d, 12);
}

export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// The round trip rejects impossible dates such as 2026-02-30.
export function isDateKey(value: unknown): value is string {
  return (
    typeof value === "string" &&
    DATE_KEY.test(value) &&
    toDateKey(parseDateKey(value)) === value
  );
}

export function isMonthKey(value: unknown): value is string {
  return (
    typeof value === "string" &&
    MONTH_KEY.test(value) &&
    isDateKey(`${value}-01`)
  );
}

// Weeks of date keys starting on `firstDay` (0 = Sunday); null pads the first and last week.
export function monthWeeks(month: string, firstDay: number): (string | null)[][] {
  const first = parseDateKey(`${month}-01`);
  const lead = (first.getDay() - firstDay + 7) % 7;
  const count = new Date(
    first.getFullYear(),
    first.getMonth() + 1,
    0,
    12,
  ).getDate();
  const cells: (string | null)[] = Array.from({ length: lead }, () => null);
  for (let d = 1; d <= count; d++) cells.push(`${month}-${pad(d)}`);
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (string | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

export function isWeekday(value: unknown): value is 0 | 1 | 2 | 3 | 4 | 5 | 6 {
  return (
    typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 6
  );
}

export function addMonths(month: string, n: number): string {
  const date = parseDateKey(`${month}-01`);
  // Day 1 never overflows into the following month.
  date.setMonth(date.getMonth() + n);
  return toDateKey(date).slice(0, 7);
}

// Malformed bounds are ignored. `YYYY-MM` strings compare correctly as text.
export function clampMonth(
  month: string,
  min: string | undefined,
  max: string | undefined,
): string {
  if (isMonthKey(min) && month < min) return min;
  if (isMonthKey(max) && month > max) return max;
  return month;
}
