import type { ComponentPropsWithoutRef } from "react";

/** A daily goal, drawn as one ring on each day. */
export interface GcGoal {
  /** Key for this goal's daily amounts in `values`. */
  id: string;
  /** Name used in the accessible text, e.g. "Jobs". */
  label: string;
  /** Amount to reach each day. 0 means the goal is always met. */
  target: number;
  /** Unit appended to amounts in the accessible text, e.g. "h". */
  unit?: string;
}

interface GcMonthCalendarOwnProps {
  /**
   * One or two goals. The first is the outer ring, the second the inner ring.
   * @example [{ id: "jobs", label: "Jobs", target: 3 }, { id: "activity", label: "Activity", target: 2, unit: "h" }]
   */
  goals: readonly [GcGoal] | readonly [GcGoal, GcGoal];
  /**
   * Amounts per day, keyed by `YYYY-MM-DD` and then by goal `id`. Missing entries count as 0.
   * @example { "2026-09-01": { jobs: 3, activity: 1.5 } }
   */
  values?: Readonly<Record<string, Readonly<Record<string, number>>>>;
  /**
   * Today's date as `YYYY-MM-DD`. Days after it are dimmed and show no progress.
   * Pass it when rendering on the server, so server and browser agree.
   * @defaultValue the current local date
   */
  today?: string;
  /**
   * Month shown first, as `YYYY-MM`.
   * @defaultValue the month of `today`
   */
  defaultMonth?: string;
  /**
   * BCP 47 locale for the month title, weekday names and numbers.
   * @defaultValue "en-US"
   */
  locale?: string;
  /** Classes merged last onto the root element. */
  className?: string;
}

export type GcMonthCalendarProps = GcMonthCalendarOwnProps &
  Omit<ComponentPropsWithoutRef<"div">, keyof GcMonthCalendarOwnProps>;
