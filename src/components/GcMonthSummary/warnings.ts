import { isMonthKey } from "../../lib/dates";
import { isDev, monthPropWarnings, show } from "../../lib/warn";

interface SummaryWarningInput {
  rings: unknown;
  data: unknown;
  today: unknown;
  month: unknown;
  defaultMonth: unknown;
  minMonth: unknown;
  maxMonth: unknown;
}

// Props the summary silently works around, described for the developer who passed them.
export function summaryWarnings(props: SummaryWarningInput): string[] {
  const out: string[] = [];
  // Skipped in production, where nothing is logged and an odd value must not cost a crash.
  if (!isDev()) return out;
  if (!Array.isArray(props.rings)) {
    out.push(
      `GcMonthSummary: \`rings\` must be an array of { id, label }, got ${show(props.rings)}. No donut is drawn.`,
    );
  } else {
    const count = props.rings.filter(
      (ring: unknown) => typeof ring === "object" && ring !== null,
    ).length;
    if (count > 2) {
      out.push(
        `GcMonthSummary: \`rings\` has ${count} entries; only the first two are drawn.`,
      );
    }
  }
  if (typeof props.data === "object" && props.data !== null) {
    for (const [key, entry] of Object.entries(props.data)) {
      if (!isMonthKey(key)) {
        out.push(
          `GcMonthSummary: \`data\` key ${show(key)} is not a YYYY-MM month, so it is never shown.`,
        );
      }
      const rings: unknown = (entry as { rings?: unknown } | null)?.rings;
      if (typeof rings !== "object" || rings === null) continue;
      for (const [id, value] of Object.entries(rings)) {
        if (
          typeof value === "number" &&
          Number.isFinite(value) &&
          (value < 0 || value > 1)
        ) {
          out.push(
            `GcMonthSummary: \`data[${show(key)}].rings.${id}\` is ${value}; ring values are fractions from 0 to 1 (0.78 for 78%). It is clamped.`,
          );
        }
      }
    }
  }
  out.push(...monthPropWarnings(props, "GcMonthSummary: "));
  return out;
}
