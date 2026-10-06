import { isDateKey, isMonthKey } from "./dates";

// Bundlers replace process.env.NODE_ENV; in an unbundled browser `process` is missing (throws).
declare const process: { env: { NODE_ENV?: string } };

export function isDev(): boolean {
  try {
    return process.env.NODE_ENV !== "production";
  } catch {
    return false;
  }
}

// Once per page load: StrictMode runs effects twice, and a page may show several components.
const logged = new Set<string>();

export function warn(message: string): void {
  if (!isDev() || logged.has(message)) return;
  logged.add(message);
  console.warn(`[react-goal-calendar] ${message}`);
}

// JSON.stringify throws on BigInt and cycles, and prints NaN as null.
export function show(value: unknown): string {
  return typeof value === "string" ? JSON.stringify(value) : String(value);
}

interface MonthPropInput {
  today: unknown;
  month: unknown;
  defaultMonth: unknown;
  minMonth: unknown;
  maxMonth: unknown;
}

const MONTH_PROPS = ["month", "defaultMonth", "minMonth", "maxMonth"] as const;

// Month props every month view shares, described for the developer who passed them.
// `prefix` names the component, since one module-wide log serves every component on the page.
export function monthPropWarnings(
  props: MonthPropInput,
  prefix = "",
): string[] {
  const out: string[] = [];
  // Skipped in production, where nothing is logged and an odd value must not cost a crash.
  if (!isDev()) return out;
  if (props.today !== undefined && !isDateKey(props.today)) {
    out.push(
      `${prefix}\`today\` must be a YYYY-MM-DD date, got ${show(props.today)}. Using the current local date.`,
    );
  }
  for (const name of MONTH_PROPS) {
    const value = props[name];
    if (value !== undefined && !isMonthKey(value)) {
      out.push(
        `${prefix}\`${name}\` must be a YYYY-MM month, got ${show(value)}. It is ignored.`,
      );
    }
  }
  if (
    isMonthKey(props.minMonth) &&
    isMonthKey(props.maxMonth) &&
    props.minMonth > props.maxMonth
  ) {
    out.push(
      `${prefix}\`minMonth\` ("${props.minMonth}") is after \`maxMonth\` ("${props.maxMonth}"), so the month can't change.`,
    );
  }
  return out;
}
