import { forwardRef, useEffect, useMemo } from "react";
import { cn } from "../../lib/cn";
import { parseDateKey } from "../../lib/dates";
import { MonthHeader } from "../../lib/MonthHeader";
import { RING_DOTS } from "../../lib/ringDots";
import { useMonth } from "../../lib/useMonth";
import { warn } from "../../lib/warn";
import { Donut } from "./Donut";
import { percentText, ringValue } from "./percent";
import type { GcMonthSummaryProps } from "./types";
import { summaryWarnings } from "./warnings";

// No frame: wrap in GcCard for one. A container, so the layout follows this element's width.
const ROOT = "gcx:@container gcx:relative gcx:box-border gcx:text-gc-fg";

// Full class literals so Tailwind generates them. `muted` uses the muted text colour because the
// row background is --gc-muted.
const TONE_DOTS = new Map<string, string>([
  ["primary", "gcx:bg-gc-primary"],
  ["success", "gcx:bg-gc-success"],
  ["warning", "gcx:bg-gc-warning"],
  ["danger", "gcx:bg-gc-danger"],
  ["ring-1", "gcx:bg-gc-ring-1"],
  ["ring-2", "gcx:bg-gc-ring-2"],
  ["muted", "gcx:bg-gc-muted-fg"],
]);
const MUTED_DOT = "gcx:bg-gc-muted-fg";

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
      labels,
      className,
      ...rest
    },
    ref,
  ) {
    const { shownMonth, canGoBack, canGoForward, goBack, goForward } = useMonth(
      {
        today,
        defaultMonth,
        month,
        minMonth,
        maxMonth,
        onMonthChange,
      },
    );
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
    const values = shownRings.map((ring) =>
      ringValue(monthData?.rings?.[ring.id]),
    );
    const texts = values.map((value) =>
      value === null ? null : percentText(value, fmt.percent),
    );
    const goalHit = labels?.goalHit || "Goal hit";
    const noData = labels?.noData || "no data";
    // The donut is aria-hidden; this sentence is its text, announced when the month changes.
    const monthText = fmt.longTitle.format(firstDay);
    const status =
      shownRings.length === 0
        ? monthText
        : texts.every((text) => text === null)
          ? `${monthText}. ${goalHit}: ${noData}`
          : `${monthText}. ${goalHit}: ${shownRings
              .map((ring, i) => `${ring.label} ${texts[i] ?? noData}`)
              .join(", ")}`;

    return (
      <div
        {...rest}
        ref={ref}
        data-empty={monthData === undefined || undefined}
        className={cn(ROOT, className)}
      >
        <MonthHeader
          title={fmt.title.format(firstDay)}
          live={false}
          canGoBack={canGoBack}
          canGoForward={canGoForward}
          onPrevious={goBack}
          onNext={goForward}
          labels={labels}
        />
        <p role="status" className="gcx:sr-only gcx:m-0">
          {status}
        </p>
        {(shownRings.length > 0 || stats.length > 0) && (
          // Side by side once the content is 18rem wide (a GcCard of about 320px), else stacked.
          <div className="gcx:mt-3 gcx:grid gcx:gap-4 gcx:@2xs:gap-x-2 gcx:@2xs:grid-cols-2 gcx:@2xs:items-center">
            {shownRings.length > 0 && (
              <div
                aria-hidden="true"
                className="gcx:flex gcx:flex-col gcx:items-center gcx:gap-2"
              >
                <Donut values={values} texts={texts} centerLabel={goalHit} />
                {legend && (
                  <ul className="gcx:m-0 gcx:flex gcx:list-none gcx:flex-wrap gcx:justify-center gcx:gap-x-4 gcx:gap-y-1 gcx:p-0 gcx:text-sm gcx:text-gc-muted-fg">
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
            {stats.length > 0 && (
              <dl
                className={cn(
                  "gcx:m-0 gcx:grid gcx:min-w-0 gcx:grid-cols-2 gcx:gap-2 gcx:@2xs:grid-cols-1",
                  shownRings.length === 0 && "gcx:@2xs:col-span-2",
                )}
              >
                {stats.map((stat, i) => (
                  <div
                    key={i}
                    className="gcx:flex gcx:min-w-0 gcx:flex-wrap gcx:items-center gcx:justify-between gcx:gap-x-3 gcx:gap-y-0.5 gcx:rounded-lg gcx:bg-gc-muted gcx:px-3 gcx:py-2"
                  >
                    <dt className="gcx:m-0 gcx:flex gcx:min-w-0 gcx:items-center gcx:gap-2 gcx:text-sm gcx:text-gc-muted-fg">
                      <span
                        aria-hidden="true"
                        className={cn(
                          "gcx:size-2.5 gcx:shrink-0 gcx:rounded-sm",
                          TONE_DOTS.get(stat.tone ?? "muted") ?? MUTED_DOT,
                        )}
                      />
                      <span className="gcx:truncate">{stat.label}</span>
                    </dt>
                    <dd className="gcx:m-0 gcx:text-sm gcx:font-semibold gcx:whitespace-nowrap gcx:tabular-nums">
                      {stat.value}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        )}
      </div>
    );
  },
);

GcMonthSummary.displayName = "GcMonthSummary";
