import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

export type Stat = { label: ReactNode; value: ReactNode; tone?: string };

// Full class literals so Tailwind generates them. `muted` uses the muted text colour because the
// narrow tiles' background is --gc-muted.
const TONES = new Map<string, string>([
  ["primary", "gcx:bg-gc-primary"],
  ["success", "gcx:bg-gc-success"],
  ["warning", "gcx:bg-gc-warning"],
  ["danger", "gcx:bg-gc-danger"],
  ["ring-1", "gcx:bg-gc-ring-1"],
  ["ring-2", "gcx:bg-gc-ring-2"],
  ["muted", "gcx:bg-gc-muted-fg"],
]);
const MUTED = "gcx:bg-gc-muted-fg";

// Narrow: a 2-column grid of tiles. @xs: one column flanking the dial. @lg: 2 columns again.
const LIST =
  "gcx:m-0 gcx:grid gcx:min-w-0 gcx:grid-cols-2 gcx:gap-2 gcx:@xs:grid-cols-1 gcx:@xs:gap-3 gcx:@lg:grid-cols-2";
const ITEM =
  "gcx:flex gcx:min-w-0 gcx:flex-col gcx:items-center gcx:gap-0.5 gcx:rounded-lg gcx:bg-gc-muted gcx:p-2 gcx:text-center gcx:@xs:rounded-none gcx:@xs:bg-transparent gcx:@xs:p-0 gcx:@lg:gap-1.5";
// Each side keeps its column without rings and aligns toward the dial; the start side puts its
// dot after the label, next to the dial.
const SIDE = {
  start: {
    list: "gcx:@xs:col-start-1",
    item: "gcx:@xs:items-end gcx:@xs:text-end",
    term: "gcx:@xs:flex-row-reverse",
  },
  end: {
    list: "gcx:@xs:col-start-3",
    item: "gcx:@xs:items-start gcx:@xs:text-start",
    term: "",
  },
} as const;

// The value comes after its label in the DOM (dt before dd) but shows first via `order-first`.
// From @lg the tone shows as a bar under the value instead of a dot.
export function Stats({
  stats,
  side,
}: {
  stats: readonly Stat[];
  side: keyof typeof SIDE;
}) {
  if (stats.length === 0) return null;
  return (
    <dl className={cn(LIST, SIDE[side].list)}>
      {stats.map((stat, i) => {
        const tone = TONES.get(stat.tone ?? "muted") ?? MUTED;
        return (
          <div key={i} className={cn(ITEM, SIDE[side].item)}>
            <dt
              className={cn(
                "gcx:m-0 gcx:flex gcx:min-w-0 gcx:max-w-full gcx:items-center gcx:gap-1.5 gcx:text-xs gcx:text-gc-muted-fg",
                SIDE[side].term,
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "gcx:size-2 gcx:shrink-0 gcx:rounded-xs gcx:@lg:hidden",
                  tone,
                )}
              />
              <span className="gcx:min-w-0 gcx:break-words">{stat.label}</span>
            </dt>
            <dd className="gcx:order-first gcx:m-0 gcx:self-stretch gcx:text-xl/[26px] gcx:font-semibold gcx:whitespace-nowrap gcx:tabular-nums gcx:@lg:text-[22px]/7">
              {stat.value}
              <span
                aria-hidden="true"
                className={cn(
                  "gcx:mt-1.5 gcx:hidden gcx:h-0.5 gcx:rounded-full gcx:@lg:block",
                  tone,
                )}
              />
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
