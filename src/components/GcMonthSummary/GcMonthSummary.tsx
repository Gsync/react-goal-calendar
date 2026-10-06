import { forwardRef, useMemo } from "react";
import { cn } from "../../lib/cn";
import { parseDateKey } from "../../lib/dates";
import { MonthHeader } from "../../lib/MonthHeader";
import { RING_DOTS } from "../../lib/ringDots";
import { useMonth } from "../../lib/useMonth";
import { Donut } from "./Donut";
import { percentText, ringValue } from "./percent";
import type { GcMonthSummaryProps } from "./types";

// No frame: wrap in GcCard for one. A container, so the layout follows this element's width.
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
        {shownRings.length > 0 && (
          <div className="gcx:mt-3 gcx:grid gcx:gap-4">
            <div
              aria-hidden="true"
              className="gcx:flex gcx:flex-col gcx:items-center gcx:gap-2"
            >
              <Donut values={values} texts={texts} centerLabel={goalHit} />
              <ul className="gcx:m-0 gcx:flex gcx:list-none gcx:flex-wrap gcx:justify-center gcx:gap-x-4 gcx:gap-y-1 gcx:p-0 gcx:text-sm gcx:text-gc-muted-fg">
                {shownRings.map((ring, i) => (
                  <li key={i} className="gcx:flex gcx:items-center gcx:gap-1.5">
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
            </div>
          </div>
        )}
      </div>
    );
  },
);

GcMonthSummary.displayName = "GcMonthSummary";
