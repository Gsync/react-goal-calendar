import {
  forwardRef,
  useEffect,
  useId,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { cn } from "../../lib/cn";
import { isWeekday, monthWeeks, parseDateKey } from "../../lib/dates";
import { LiveText } from "../../lib/LiveText";
import { MonthHeader } from "../../lib/MonthHeader";
import { useMonth } from "../../lib/useMonth";
import { Rings } from "../../lib/Rings";
import { dayLabel, weekdayNames } from "./format";
import { DefaultTooltip } from "./DayTooltip";
import { hasContent } from "../../lib/hasContent";
import { Tooltip } from "../../lib/Tooltip";
import { dayInfo, dayProgress, type DayProgress } from "./progress";
import { SettingsButton } from "./SettingsButton";
import { RING_DOTS } from "../../lib/ringDots";
import type { GcDayInfo, GcGoal, GcMonthCalendarProps } from "./types";
import { propWarnings } from "./warnings";
import { warn } from "../../lib/warn";

// No frame: wrap in GcCard for one. `relative` anchors the tooltip.
const ROOT = "gcx:relative gcx:box-border gcx:text-gc-fg";

export const GcMonthCalendar = forwardRef<HTMLDivElement, GcMonthCalendarProps>(
  function GcMonthCalendar(
    {
      goals,
      values,
      today,
      defaultMonth,
      month,
      minMonth,
      maxMonth,
      weekStartsOn,
      onMonthChange,
      locale = "en-US",
      renderTooltip,
      legend = false,
      actions,
      onSettingsClick,
      formatDayLabel,
      labels,
      className,
      ...rest
    },
    ref,
  ) {
    const {
      todayKey,
      shownMonth,
      announce,
      canGoBack,
      canGoForward,
      goBack,
      goForward,
    } = useMonth({
      today,
      defaultMonth,
      month,
      minMonth,
      maxMonth,
      onMonthChange,
    });
    const firstDay = isWeekday(weekStartsOn) ? weekStartsOn : 1;
    // Joined so the effect re-runs only when the set of problems changes, not on every render.
    const warnings = propWarnings({
      goals,
      today,
      month,
      defaultMonth,
      minMonth,
      maxMonth,
      weekStartsOn,
    }).join("\n");
    useEffect(() => {
      if (warnings) for (const message of warnings.split("\n")) warn(message);
    }, [warnings]);
    // Plain JS callers may pass anything here; draw at most two rings.
    const shownGoals: readonly GcGoal[] = Array.isArray(goals)
      ? goals
          .filter(
            (goal: unknown): boolean =>
              typeof goal === "object" && goal !== null,
          )
          .slice(0, 2)
      : [];
    const [hover, setHover] = useState<{
      key: string;
      cell: HTMLElement;
    } | null>(null);
    // The hovered cell unmounts without a pointerleave when the month changes, from either side.
    const [hoverMonth, setHoverMonth] = useState(shownMonth);
    if (hoverMonth !== shownMonth) {
      setHoverMonth(shownMonth);
      setHover(null);
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
        weekdays: weekdayNames(locale, firstDay),
        number: new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }),
      }),
      [locale, firstDay],
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
    function dayText(key: string, dateText: string, progress: DayProgress | null): string {
      const custom = formatDayLabel?.(
        dayInfo(key, todayKey, shownGoals, values?.[key]),
        dateText,
      );
      return typeof custom === "string" && custom !== ""
        ? custom
        : dayLabel(dateText, progress, fmt.number);
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
    const showLegend = legend && shownGoals.length > 0;
    // Plain JS callers may pass anything here; only a function gets a button.
    const onSettings = typeof onSettingsClick === "function" ? onSettingsClick : null;
    const showActions = hasContent(actions) || onSettings !== null;

    return (
      <div {...rest} ref={ref} className={cn(ROOT, className)}>
        <MonthHeader
          title={
            <LiveText
              text={fmt.title.format(parseDateKey(`${shownMonth}-01`))}
              live={announce}
            />
          }
          titleId={titleId}
          canGoBack={canGoBack}
          canGoForward={canGoForward}
          onPrevious={goBack}
          onNext={goForward}
          labels={labels}
        />
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
            {monthWeeks(shownMonth, firstDay).map((week, w) => (
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
                      onPointerUp={(event) => {
                        if (event.pointerType === "mouse") return;
                        const cell = event.currentTarget;
                        setHover((current) =>
                          current?.key === key ? null : { key, cell },
                        );
                      }}
                      onPointerLeave={(event) => {
                        // Lifting a finger fires pointerleave; only a mouse leaving closes.
                        if (event.pointerType === "mouse")
                          setHover((current) =>
                            current?.key === key ? null : current,
                          );
                      }}
                      className="gcx:group gcx:p-0 gcx:text-center gcx:align-top"
                    >
                      <span className="gcx:sr-only">
                        {dayText(key, fmt.date.format(date), progress)}
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
                          <Rings
                            fractions={
                              progress
                                ? progress.rings.map((ring) => ring.fraction)
                                : shownGoals.map(() => 0)
                            }
                            size={36}
                            radii={[14.5, 8]}
                            stroke={5}
                            className="gcx:mx-auto gcx:block gcx:aspect-square gcx:w-full gcx:max-w-12"
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
        {(showLegend || showActions) && (
          <div className="gcx:mt-3 gcx:flex gcx:flex-wrap gcx:items-center gcx:gap-x-4 gcx:gap-y-1">
            {showLegend && (
              <>
                <span className="gcx:shrink-0 gcx:text-xs gcx:font-medium gcx:text-gc-muted-fg">
                  {labels?.legend || "Daily goal"}
                </span>
                <ul className="gcx:m-0 gcx:flex gcx:list-none gcx:flex-wrap gcx:gap-x-4 gcx:gap-y-1 gcx:p-0 gcx:text-xs gcx:text-gc-muted-fg">
                  {dayProgress(shownGoals, undefined).rings.map(({ goal, target }, i) => (
                    <li key={i} className="gcx:flex gcx:items-center gcx:gap-1.5">
                      <span
                        aria-hidden="true"
                        className={cn("gcx:size-2 gcx:shrink-0 gcx:rounded-full", RING_DOTS[i])}
                      />
                      <span className="gcx:text-gc-fg">{goal.label}</span>{" "}
                      <span className="gcx:tabular-nums">
                        {`${fmt.number.format(target)}${goal.unit ? ` ${goal.unit}` : ""}`}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}
            {showActions && (
              // The legend wraps inside its own box; the actions keep their size at the row's end.
              <div
                data-gc-actions=""
                className="gcx:ms-auto gcx:flex gcx:shrink-0 gcx:items-center gcx:gap-1"
              >
                {actions}
                {onSettings && (
                  <SettingsButton
                    label={labels?.settings || "Goal settings"}
                    onClick={onSettings}
                  />
                )}
              </div>
            )}
          </div>
        )}
        {hover && tooltipKey !== undefined && (
          <Tooltip anchor={hover.cell} onDismiss={() => setHover(null)}>
            {tooltip}
          </Tooltip>
        )}
      </div>
    );
  },
);

GcMonthCalendar.displayName = "GcMonthCalendar";
