import type { ComponentPropsWithoutRef, ReactNode } from "react";

interface GcMonthSummaryOwnProps {
  /**
   * The rings to draw: the first is the outer ring, the second the inner ring. Only the first two
   * are drawn. `GcGoal` objects fit, so you can pass the calendar's `goals`.
   * @example [{ id: "calls", label: "Calls" }, { id: "emails", label: "Emails" }]
   */
  rings: readonly { id: string; label: string }[];
  /**
   * Numbers per month, keyed by `YYYY-MM`. Your app computes them. Recompute in `onMonthChange`
   * or pass several months; a month without an entry shows "—" and no rows.
   * @example { "2026-09": { rings: { calls: 0.78 }, stats: [{ label: "Best streak", value: "8 days" }] } }
   */
  data?: Readonly<
    Record<
      string,
      {
        /** Share of the goal hit per ring id, from 0 to 1 (0.78 shows "78%"). */
        rings?: Readonly<Record<string, number>>;
        /** Rows shown next to the donut, in order. */
        stats?: readonly {
          label: ReactNode;
          value: ReactNode;
          /** Colour of the row's dot. @defaultValue "muted" */
          tone?:
            | "primary"
            | "success"
            | "warning"
            | "danger"
            | "ring-1"
            | "ring-2"
            | "muted";
        }[];
      }
    >
  >;
  /**
   * Today's date as `YYYY-MM-DD`; picks the month shown first. Pass it when rendering on the
   * server, so server and browser agree.
   * @defaultValue the current local date
   */
  today?: string;
  /**
   * Month shown first when `month` isn't set, as `YYYY-MM`.
   * @defaultValue the month of `today`
   */
  defaultMonth?: string;
  /**
   * Month shown, as `YYYY-MM`, when your app controls it: update it from `onMonthChange`. Pass the
   * same state to a `GcMonthCalendar` to keep both on one month.
   */
  month?: string;
  /** Earliest month the user can navigate to, as `YYYY-MM`. */
  minMonth?: string;
  /** Latest month the user can navigate to, as `YYYY-MM`. */
  maxMonth?: string;
  /** Called with the new month (`YYYY-MM`) when the user navigates. */
  onMonthChange?: (month: string) => void;
  /**
   * BCP 47 locale for the month title and percentages.
   * @defaultValue "en-US"
   */
  locale?: string;
  /**
   * Show a key under the donut: each ring's colour and label. It is the only on-screen label of
   * which percentage is which ring.
   * @defaultValue true
   */
  legend?: boolean;
  /** Built-in text, e.g. to translate it. */
  labels?: {
    /** @defaultValue "Previous month" */
    previousMonth?: string;
    /** @defaultValue "Next month" */
    nextMonth?: string;
    /** Shown in the donut centre and read before the percentages. @defaultValue "Goal hit" */
    goalHit?: string;
    /** Read for a ring or month without a value. @defaultValue "no data" */
    noData?: string;
  };
  /** Classes merged last onto the root element. */
  className?: string;
}

// An interface, not an intersection alias, so the emitted .d.ts names it instead of expanding it.
export interface GcMonthSummaryProps
  extends
    GcMonthSummaryOwnProps,
    Omit<ComponentPropsWithoutRef<"div">, keyof GcMonthSummaryOwnProps> {}
