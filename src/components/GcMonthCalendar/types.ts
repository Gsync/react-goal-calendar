import type { ComponentPropsWithoutRef, ReactNode } from "react";

/** A daily goal, drawn as one ring on each day. */
export interface GcGoal {
  /** Key for this goal's daily amounts in `values`. */
  id: string;
  /** Name used in the accessible text, e.g. "Calls". */
  label: string;
  /** Amount to reach each day. 0 means the goal is always met. */
  target: number;
  /** Unit appended to amounts in the accessible text, e.g. "h". */
  unit?: string;
}

/** One day's data, as passed to `renderTooltip`. */
export interface GcDayInfo {
  /** The day as `YYYY-MM-DD`. */
  date: string;
  /** The day is `today`. */
  today: boolean;
  /** The day is after `today`. Its rings draw empty, but `goals` still holds its `values`. */
  future: boolean;
  /** Every goal reached its target, judged from `values` (also for future days). */
  complete: boolean;
  /** Progress per goal, outer ring first. `fraction` is `done / target`, capped at 1. */
  goals: readonly {
    goal: GcGoal;
    done: number;
    target: number;
    fraction: number;
  }[];
}

interface GcMonthCalendarOwnProps {
  /**
   * One or two goals. The first is the outer ring, the second the inner ring.
   * @example [{ id: "calls", label: "Calls", target: 20 }, { id: "emails", label: "Emails", target: 10 }]
   */
  goals: readonly [GcGoal] | readonly [GcGoal, GcGoal];
  /**
   * Amounts per day, keyed by `YYYY-MM-DD` and then by goal `id`. Missing entries count as 0.
   * @example { "2026-09-01": { calls: 20, emails: 10 } }
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
  /** Earliest month the user can navigate to, as `YYYY-MM`. */
  minMonth?: string;
  /** Latest month the user can navigate to, as `YYYY-MM`. */
  maxMonth?: string;
  /** Called with the new month (`YYYY-MM`) when the user navigates. */
  onMonthChange?: (month: string) => void;
  /**
   * BCP 47 locale for the month title, weekday names and numbers.
   * @defaultValue "en-US"
   */
  locale?: string;
  /**
   * Content of the tooltip shown while the mouse is over a day. Return `null` to show none for that
   * day, or pass `null` to turn tooltips off. The tooltip opens for mouse pointers only, closes on
   * Escape and is hidden from assistive tech, so don't put information only there.
   * @example renderTooltip={(day) => (day.future ? null : `${day.goals[0]?.done ?? 0} calls`)}
   * @defaultValue the date and each goal's `done / target`, on past days and today
   */
  renderTooltip?: ((day: GcDayInfo) => ReactNode) | null;
  /** Classes merged last onto the root element. */
  className?: string;
}

// An interface, not an intersection alias, so the emitted .d.ts names it instead of expanding it.
export interface GcMonthCalendarProps
  extends
    GcMonthCalendarOwnProps,
    Omit<ComponentPropsWithoutRef<"div">, keyof GcMonthCalendarOwnProps> {}
