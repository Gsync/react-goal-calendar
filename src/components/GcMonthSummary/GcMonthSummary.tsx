import {
  forwardRef,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { cn } from "../../lib/cn";
import { parseDateKey } from "../../lib/dates";
import { MonthHeader } from "../../lib/MonthHeader";
import { RING_DOTS } from "../../lib/ringDots";
import { hasContent } from "../../lib/hasContent";
import { LiveText } from "../../lib/LiveText";
import { Tooltip, TooltipRows } from "../../lib/Tooltip";
import { useMonth } from "../../lib/useMonth";
import { warn } from "../../lib/warn";
import { Donut } from "./Donut";
import { percentText, ringValue } from "./percent";
import { Stats } from "./Stats";
import type { GcMonthSummaryProps } from "./types";
import { summaryWarnings } from "./warnings";

// No frame: wrap in GcCard for one. A container, so the layout follows this element's width.
// `relative` anchors the tooltip.
const ROOT = "gcx:@container gcx:relative gcx:box-border gcx:text-gc-fg";

export const GcMonthSummary = forwardRef<HTMLDivElement, GcMonthSummaryProps>(
  function GcMonthSummary(
    {
      rings,
      data,
      today,
      defaultMonth,
      month,
      minMonth,
      maxMonth,
      onMonthChange,
      locale = "en-US",
      legend = true,
      renderTooltip,
      labels,
      className,
      ...rest
    },
    ref,
  ) {
    const { shownMonth, announce, canGoBack, canGoForward, goBack, goForward } =
      useMonth({
        today,
        defaultMonth,
        month,
        minMonth,
        maxMonth,
        onMonthChange,
      });
    // Joined so the effect re-runs only when the set of problems changes, not on every render.
    const warnings = summaryWarnings({
      rings,
      data,
      today,
      month,
      defaultMonth,
      minMonth,
      maxMonth,
    }).join("\n");
    useEffect(() => {
      if (warnings) for (const message of warnings.split("\n")) warn(message);
    }, [warnings]);
    const fmt = useMemo(
      () => ({
        title: new Intl.DateTimeFormat(locale, {
          month: "short",
          year: "numeric",
        }),
        longTitle: new Intl.DateTimeFormat(locale, {
          month: "long",
          year: "numeric",
        }),
        percent: new Intl.NumberFormat(locale, {
          style: "percent",
          maximumFractionDigits: 0,
        }),
      }),
      [locale],
    );
    const firstDay = parseDateKey(`${shownMonth}-01`);
    // Plain JS callers may pass anything here; draw at most two rings.
    const shownRings = Array.isArray(rings)
      ? rings
          .filter(
            (ring: unknown): boolean =>
              typeof ring === "object" && ring !== null,
          )
          .slice(0, 2)
      : [];
    const monthData = data?.[shownMonth];
    // Plain JS callers may pass anything here; skip entries that aren't objects.
    const stats =
      monthData && Array.isArray(monthData.stats)
        ? monthData.stats.filter(
            (stat: unknown): boolean =>
              typeof stat === "object" && stat !== null,
          )
        : [];
    // The first half flanks the dial on the start side, the rest on the end side.
    const half = Math.ceil(stats.length / 2);
    const values = shownRings.map((ring) =>
      ringValue(monthData?.rings?.[ring.id]),
    );
    const texts = values.map((value) =>
      value === null ? null : percentText(value, fmt.percent),
    );
    const goalHit = labels?.goalHit || "Goal hit";
    const noData = labels?.noData || "no data";
    // The donut is aria-hidden; this sentence is its text, announced when our buttons change month.
    const monthText = fmt.longTitle.format(firstDay);
    const status =
      shownRings.length === 0
        ? monthText
        : texts.every((text) => text === null)
          ? `${monthText}. ${goalHit}: ${noData}`
          : `${monthText}. ${goalHit}: ${shownRings
              .map((ring, i) => `${ring.label} ${texts[i] ?? noData}`)
              .join(", ")}`;
    // Speak only the sentence our navigation produced; later data for that month stays silent.
    const [spoken, setSpoken] = useState<{ month: string; text: string } | null>(null);
    if (!announce && spoken) setSpoken(null);
    if (announce && spoken?.month !== shownMonth) setSpoken({ month: shownMonth, text: status });
    const live = announce && spoken?.text === status;
    const [donut, setDonut] = useState<HTMLElement | null>(null);
    // Without rings the donut unmounts with no pointerleave; drop the detached anchor.
    if (donut && shownRings.length === 0) setDonut(null);
    // The tooltip shows one month's numbers, so it closes when the month changes from either side.
    const [donutMonth, setDonutMonth] = useState(shownMonth);
    if (donutMonth !== shownMonth) {
      setDonutMonth(shownMonth);
      setDonut(null);
    }
    // A month without values shows dashes, so by default there is nothing to add for it.
    const defaultTooltip = (): ReactNode =>
      values.every((value) => value === null) ? null : (
        <TooltipRows
          title={`${goalHit} (${fmt.title.format(firstDay)})`}
          rows={shownRings.map((ring, i) => ({
            label: ring.label,
            text: texts[i] ?? "—",
            met: values[i] === 1,
          }))}
        />
      );
    const tooltipFor =
      renderTooltip === undefined ? defaultTooltip : renderTooltip;
    const tooltip =
      donut && tooltipFor
        ? tooltipFor({
            month: shownMonth,
            rings: shownRings.map((ring, i) => ({
              ring,
              value: values[i] ?? null,
            })),
          })
        : null;

    return (
      <div
        {...rest}
        ref={ref}
        data-empty={monthData === undefined || undefined}
        className={cn(ROOT, className)}
      >
        <MonthHeader
          title={fmt.title.format(firstDay)}
          canGoBack={canGoBack}
          canGoForward={canGoForward}
          onPrevious={goBack}
          onNext={goForward}
          labels={labels}
        />
        <p className="gcx:sr-only gcx:m-0">
          <LiveText text={status} live={live} />
        </p>
        {(shownRings.length > 0 || stats.length > 0) && (
          // Stacked (dial on top) below 20rem of content (a GcCard of about 350px), else the stats
          // flank the dial. There the legend wraps at 8rem, so long ring labels can't squeeze them.
          <div className="gcx:mt-4 gcx:grid gcx:gap-3 gcx:@xs:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gcx:@xs:items-center gcx:@xs:gap-4 gcx:@lg:gap-6">
            <Stats stats={stats.slice(0, half)} side="start" />
            {shownRings.length > 0 && (
              <div
                aria-hidden="true"
                className="gcx:order-first gcx:mb-1 gcx:flex gcx:flex-col gcx:items-center gcx:gap-2 gcx:@xs:order-none gcx:@xs:col-start-2 gcx:@xs:mb-0"
              >
                <div className="gcx:text-base gcx:font-medium gcx:text-gc-muted-fg">
                  {goalHit}
                </div>
                <Donut
                  values={values}
                  texts={texts}
                  onPointerEnter={(event) => {
                    if (event.pointerType === "mouse") setDonut(event.currentTarget);
                  }}
                  onPointerUp={(event) => {
                    if (event.pointerType === "mouse") return;
                    const element = event.currentTarget;
                    setDonut((current) => (current ? null : element));
                  }}
                  onPointerLeave={(event) => {
                    // Lifting a finger fires pointerleave; only a mouse leaving closes.
                    if (event.pointerType === "mouse") setDonut(null);
                  }}
                />
                {legend && (
                  <ul className="gcx:m-0 gcx:flex gcx:list-none gcx:flex-wrap gcx:justify-center gcx:gap-x-3 gcx:gap-y-1 gcx:p-0 gcx:text-sm gcx:text-gc-muted-fg gcx:@xs:max-w-32">
                    {shownRings.map((ring, i) => (
                      <li
                        key={i}
                        className="gcx:flex gcx:items-center gcx:gap-1.5"
                      >
                        <span
                          className={cn(
                            "gcx:size-2.5 gcx:shrink-0 gcx:rounded-full",
                            RING_DOTS[i],
                          )}
                        />
                        {ring.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            <Stats stats={stats.slice(half)} side="end" />
          </div>
        )}
        {donut && hasContent(tooltip) && (
          <Tooltip anchor={donut} onDismiss={() => setDonut(null)}>
            {tooltip}
          </Tooltip>
        )}
      </div>
    );
  },
);

GcMonthSummary.displayName = "GcMonthSummary";
