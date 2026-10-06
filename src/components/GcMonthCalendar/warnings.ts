import { isWeekday } from "../../lib/dates";
import { isDev, monthPropWarnings, show } from "../../lib/warn";

interface PropWarningInput {
  goals: unknown;
  today: unknown;
  month: unknown;
  defaultMonth: unknown;
  minMonth: unknown;
  maxMonth: unknown;
  weekStartsOn: unknown;
}

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
  out.push(...monthPropWarnings(props));
  if (props.weekStartsOn !== undefined && !isWeekday(props.weekStartsOn)) {
    out.push(
      `\`weekStartsOn\` must be an integer from 0 (Sunday) to 6 (Saturday), got ${show(props.weekStartsOn)}. Using 1 (Monday).`,
    );
  }
  return out;
}
