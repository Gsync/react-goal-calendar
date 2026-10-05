import { isDateKey, isMonthKey, isWeekday } from "./dates";

// Bundlers replace process.env.NODE_ENV; in an unbundled browser `process` is missing (throws).
declare const process: { env: { NODE_ENV?: string } };

function isDev(): boolean {
  try {
    return process.env.NODE_ENV !== "production";
  } catch {
    return false;
  }
}

// Once per page load: StrictMode runs effects twice, and a page may show several calendars.
const logged = new Set<string>();

export function warn(message: string): void {
  if (!isDev() || logged.has(message)) return;
  logged.add(message);
  console.warn(`[react-goal-calendar] ${message}`);
}

interface PropWarningInput {
  goals: unknown;
  today: unknown;
  month: unknown;
  defaultMonth: unknown;
  minMonth: unknown;
  maxMonth: unknown;
  weekStartsOn: unknown;
}

// JSON.stringify throws on BigInt and cycles, and prints NaN as null.
function show(value: unknown): string {
  return typeof value === "string" ? JSON.stringify(value) : String(value);
}

const MONTH_PROPS = ["month", "defaultMonth", "minMonth", "maxMonth"] as const;

// Props the calendar silently works around, described for the developer who passed them.
export function propWarnings(props: PropWarningInput): string[] {
  const out: string[] = [];
  // Skipped in production, where nothing is logged and an odd value must not cost a crash.
  if (!isDev()) return out;
  if (!Array.isArray(props.goals)) {
    out.push(
      `\`goals\` must be an array of goals, got ${show(props.goals)}. No rings are drawn.`,
    );
  } else {
    const count = props.goals.filter(
      (goal: unknown) => typeof goal === "object" && goal !== null,
    ).length;
    if (count > 2) out.push(`\`goals\` has ${count} entries; only the first two are drawn.`);
  }
  if (props.today !== undefined && !isDateKey(props.today)) {
    out.push(
      `\`today\` must be a YYYY-MM-DD date, got ${show(props.today)}. Using the current local date.`,
    );
  }
  for (const name of MONTH_PROPS) {
    const value = props[name];
    if (value !== undefined && !isMonthKey(value)) {
      out.push(`\`${name}\` must be a YYYY-MM month, got ${show(value)}. It is ignored.`);
    }
  }
  if (isMonthKey(props.minMonth) && isMonthKey(props.maxMonth) && props.minMonth > props.maxMonth) {
    out.push(
      `\`minMonth\` ("${props.minMonth}") is after \`maxMonth\` ("${props.maxMonth}"), so the month can't change.`,
    );
  }
  if (props.weekStartsOn !== undefined && !isWeekday(props.weekStartsOn)) {
    out.push(
      `\`weekStartsOn\` must be an integer from 0 (Sunday) to 6 (Saturday), got ${show(props.weekStartsOn)}. Using 1 (Monday).`,
    );
  }
  return out;
}
