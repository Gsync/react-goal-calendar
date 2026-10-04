import type { ComponentPropsWithoutRef } from "react";

interface GcMonthCalendarOwnProps {
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
