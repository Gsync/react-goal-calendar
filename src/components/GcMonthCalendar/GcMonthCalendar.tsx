import { forwardRef, useId, useMemo, useState, type ReactNode } from "react";
import { cn } from "../../lib/cn";
import {
  addMonths,
  clampMonth,
  isDateKey,
  isMonthKey,
  monthWeeks,
  parseDateKey,
  toDateKey,
} from "./dates";
import { DayRings } from "./DayRings";
import { dayLabel, weekdayNames } from "./format";
import { DayTooltip, DefaultTooltip } from "./DayTooltip";
import { dayInfo, dayProgress } from "./progress";
import type { GcDayInfo, GcGoal, GcMonthCalendarProps } from "./types";

// No frame: wrap in GcCard for one. `relative` anchors the tooltip.
const ROOT = "gcx:relative gcx:box-border gcx:text-gc-fg";

const NAV_BUTTON =
  "gcx:inline-flex gcx:size-8 gcx:cursor-pointer gcx:items-center gcx:justify-center gcx:rounded-md gcx:border-0 gcx:bg-transparent gcx:p-0 gcx:text-gc-muted-fg gcx:hover:bg-gc-muted gcx:hover:text-gc-fg gcx:focus-visible:outline-2 gcx:focus-visible:outline-offset-2 gcx:focus-visible:outline-gc-primary gcx:aria-disabled:cursor-not-allowed gcx:aria-disabled:opacity-40 gcx:aria-disabled:hover:bg-transparent gcx:aria-disabled:hover:text-gc-muted-fg";

// Mirrored under dir="rtl" so "previous" still points toward the start.
function Chevron({ d }: { d: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className="gcx:size-4 gcx:rtl:-scale-x-100"
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

// These render nothing, so they mean "no tooltip" rather than an empty box.
function hasContent(node: ReactNode): boolean {
  if (Array.isArray(node)) return node.length > 0;
  return (
    node !== null &&
    node !== undefined &&
    typeof node !== "boolean" &&
    node !== ""
  );
}

export const GcMonthCalendar = forwardRef<HTMLDivElement, GcMonthCalendarProps>(
  function GcMonthCalendar(
    {
      goals,
      values,
      today,
      defaultMonth,
      minMonth,
      maxMonth,
      onMonthChange,
      locale = "en-US",
      renderTooltip,
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
      clampMonth(
        isMonthKey(defaultMonth) ? defaultMonth : todayKey.slice(0, 7),
        minMonth,
        maxMonth,
      ),
    );
    const canGoBack = !isMonthKey(minMonth) || month > minMonth;
    const canGoForward = !isMonthKey(maxMonth) || month < maxMonth;

    const [hover, setHover] = useState<{
      key: string;
      cell: HTMLElement;
    } | null>(null);

    function showMonth(next: string) {
      // The hovered cell unmounts without a pointerleave when the keyboard changes the month.
      setHover(null);
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
    // Future rings are empty, so by default there is nothing to show for them.
    function defaultTooltip(day: GcDayInfo): ReactNode {
      if (day.future || day.goals.length === 0) return null;
      return (
        <DefaultTooltip
          day={day}
          dateText={fmt.date.format(parseDateKey(day.date))}
          number={fmt.number}
        />
      );
    }
    const tooltipFor =
      renderTooltip === undefined ? defaultTooltip : renderTooltip;
    const tooltip =
      hover && tooltipFor
        ? tooltipFor(
            dayInfo(hover.key, todayKey, shownGoals, values?.[hover.key]),
          )
        : null;
    const tooltipKey = hasContent(tooltip) ? hover?.key : undefined;

    return (
      <div {...rest} ref={ref} className={cn(ROOT, className)}>
        <div className="gcx:flex gcx:items-center gcx:justify-between gcx:gap-2">
          <div id={titleId} role="status" className="gcx:text-lg gcx:font-semibold">
            {fmt.title.format(parseDateKey(`${month}-01`))}
          </div>
          <div className="gcx:flex gcx:gap-1">
            <button
              type="button"
              aria-label="Previous month"
              aria-disabled={!canGoBack || undefined}
              onClick={() => {
                if (canGoBack) showMonth(addMonths(month, -1));
              }}
              className={NAV_BUTTON}
            >
              <Chevron d="M10 3 5 8l5 5" />
            </button>
            <button
              type="button"
              aria-label="Next month"
              aria-disabled={!canGoForward || undefined}
              onClick={() => {
                if (canGoForward) showMonth(addMonths(month, 1));
              }}
              className={NAV_BUTTON}
            >
              <Chevron d="m6 3 5 5-5 5" />
            </button>
          </div>
        </div>
        <table
          aria-labelledby={titleId}
          className="gcx:mt-3 gcx:w-full gcx:table-fixed gcx:border-collapse"
        >
          <thead>
            <tr>
              {fmt.weekdays.map(({ narrow, long }) => (
                <th
                  key={long}
                  scope="col"
                  className="gcx:p-0 gcx:pb-2 gcx:text-center gcx:text-xs gcx:font-medium gcx:text-gc-muted-fg"
                >
                  <span aria-hidden="true">{narrow}</span>
                  <span className="gcx:sr-only">{long}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {monthWeeks(month).map((week, w) => (
              <tr key={w}>
                {week.map((key, i) => {
                  if (key === null)
                    return <td key={`pad-${i}`} className="gcx:p-0" />;
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
                      data-hovered={key === tooltipKey || undefined}
                      aria-current={isToday ? "date" : undefined}
                      onPointerEnter={(event) => {
                        if (event.pointerType === "mouse")
                          setHover({ key, cell: event.currentTarget });
                      }}
                      onPointerLeave={() =>
                        setHover((current) =>
                          current?.key === key ? null : current,
                        )
                      }
                      className="gcx:group gcx:p-0 gcx:text-center gcx:align-top"
                    >
                      <span className="gcx:sr-only">
                        {dayLabel(fmt.date.format(date), progress, fmt.number)}
                      </span>
                      <div
                        aria-hidden="true"
                        className="gcx:flex gcx:flex-col gcx:items-center gcx:gap-1 gcx:rounded-lg gcx:py-1 gcx:group-data-[future]:opacity-50 gcx:group-data-[hovered]:bg-gc-muted"
                      >
                        <span className="gcx:inline-flex gcx:flex-col gcx:items-center gcx:text-sm gcx:tabular-nums gcx:text-gc-muted-fg gcx:group-data-[complete]:font-bold gcx:group-data-[complete]:text-gc-fg gcx:group-data-[today]:font-bold gcx:group-data-[today]:text-gc-fg">
                          {fmt.day.format(date)}
                          <span className="gcx:hidden gcx:h-0.5 gcx:w-full gcx:rounded-full gcx:bg-gc-primary gcx:group-data-[today]:block" />
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
        {hover && tooltipKey !== undefined && (
          <DayTooltip anchor={hover.cell} onDismiss={() => setHover(null)}>
            {tooltip}
          </DayTooltip>
        )}
      </div>
    );
  },
);

GcMonthCalendar.displayName = "GcMonthCalendar";
