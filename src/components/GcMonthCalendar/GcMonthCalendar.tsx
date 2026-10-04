import { forwardRef, useId, useMemo, useState } from "react";
import { cn } from "../../lib/cn";
import {
  addMonths,
  isDateKey,
  isMonthKey,
  monthWeeks,
  parseDateKey,
  toDateKey,
} from "./dates";
import { DayRings } from "./DayRings";
import { dayLabel, weekdayNames } from "./format";
import { dayProgress } from "./progress";
import type { GcGoal, GcMonthCalendarProps } from "./types";

const ROOT =
  "box-border rounded-xl border border-gc-border bg-gc-card p-4 text-gc-fg";

const NAV_BUTTON =
  "inline-flex size-8 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent p-0 text-gc-muted-fg hover:bg-gc-muted hover:text-gc-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gc-primary";

// Mirrored under dir="rtl" so "previous" still points toward the start.
function Chevron({ d }: { d: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className="size-4 rtl:-scale-x-100"
    >
      <path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export const GcMonthCalendar = forwardRef<HTMLDivElement, GcMonthCalendarProps>(
  function GcMonthCalendar(
    {
      goals,
      values,
      today,
      defaultMonth,
      onMonthChange,
      locale = "en-US",
      className,
      ...rest
    },
    ref,
  ) {
    // Read the clock once, in an initializer (render must stay pure). It can differ between
    // server and browser, so SSR consumers pass `today`.
    const [clockToday] = useState(() => toDateKey(new Date()));
    const todayKey = isDateKey(today) ? today : clockToday;
    // Plain JS callers may pass anything here; draw at most two rings.
    const shownGoals: readonly GcGoal[] = Array.isArray(goals)
      ? goals
          .filter((goal: unknown) => typeof goal === "object" && goal !== null)
          .slice(0, 2)
      : [];
    const [month, setMonth] = useState(() =>
      isMonthKey(defaultMonth) ? defaultMonth : todayKey.slice(0, 7),
    );

    function showMonth(next: string) {
      setMonth(next);
      onMonthChange?.(next);
    }
    const titleId = useId();
    const fmt = useMemo(
      () => ({
        title: new Intl.DateTimeFormat(locale, {
          month: "short",
          year: "numeric",
        }),
        day: new Intl.DateTimeFormat(locale, { day: "numeric" }),
        date: new Intl.DateTimeFormat(locale, {
          weekday: "long",
          month: "long",
          day: "numeric",
        }),
        weekdays: weekdayNames(locale),
        number: new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }),
      }),
      [locale],
    );

    return (
      <div {...rest} ref={ref} className={cn(ROOT, className)}>
        <div className="flex items-center justify-between gap-2">
          <div id={titleId} role="status" className="text-lg font-semibold">
            {fmt.title.format(parseDateKey(`${month}-01`))}
          </div>
          <div className="flex gap-1">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => showMonth(addMonths(month, -1))}
              className={NAV_BUTTON}
            >
              <Chevron d="M10 3 5 8l5 5" />
            </button>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => showMonth(addMonths(month, 1))}
              className={NAV_BUTTON}
            >
              <Chevron d="m6 3 5 5-5 5" />
            </button>
          </div>
        </div>
        <table
          aria-labelledby={titleId}
          className="mt-3 w-full table-fixed border-collapse"
        >
          <thead>
            <tr>
              {fmt.weekdays.map(({ narrow, long }) => (
                <th
                  key={long}
                  scope="col"
                  className="p-0 pb-2 text-center text-xs font-medium text-gc-muted-fg"
                >
                  <span aria-hidden="true">{narrow}</span>
                  <span className="sr-only">{long}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {monthWeeks(month).map((week, w) => (
              <tr key={w}>
                {week.map((key, i) => {
                  if (key === null)
                    return <td key={`pad-${i}`} className="p-0" />;
                  const date = parseDateKey(key);
                  const isToday = key === todayKey;
                  const isFuture = key > todayKey;
                  // Future days show empty tracks whatever `values` says.
                  const progress = isFuture
                    ? null
                    : dayProgress(shownGoals, values?.[key]);
                  return (
                    <td
                      key={key}
                      data-today={isToday || undefined}
                      data-future={isFuture || undefined}
                      data-complete={progress?.complete || undefined}
                      data-empty={progress?.empty || undefined}
                      aria-current={isToday ? "date" : undefined}
                      className="group p-0 pb-2 text-center align-top"
                    >
                      <span className="sr-only">
                        {dayLabel(fmt.date.format(date), progress, fmt.number)}
                      </span>
                      <div
                        aria-hidden="true"
                        className="flex flex-col items-center gap-1 group-data-[future]:opacity-50"
                      >
                        <span className="inline-flex flex-col items-center text-sm tabular-nums text-gc-muted-fg group-data-[complete]:font-bold group-data-[complete]:text-gc-fg group-data-[today]:font-bold group-data-[today]:text-gc-fg">
                          {fmt.day.format(date)}
                          <span className="hidden h-0.5 w-full rounded-full bg-gc-primary group-data-[today]:block" />
                        </span>
                        {shownGoals.length > 0 && (
                          <DayRings
                            fractions={
                              progress
                                ? progress.rings.map((ring) => ring.fraction)
                                : shownGoals.map(() => 0)
                            }
                          />
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  },
);

GcMonthCalendar.displayName = "GcMonthCalendar";
