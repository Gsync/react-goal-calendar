import type { ComponentPropsWithoutRef } from "react";
import { cn } from "../../lib/cn";
import { Rings } from "../../lib/Rings";

// Percent text per ring, outer ring first. Full class literals so Tailwind generates them.
const TEXT = ["gcx:text-gc-ring-1-text", "gcx:text-gc-ring-2-text"] as const;

// `null` values draw a bare track and a dash: the month or ring has no number.
// The hole inside r 38 / stroke 7 is 69px across: a 12.5px label line + two 22.5px lines fit.
export function Donut({
  values,
  texts,
  centerLabel,
  ...rest
}: {
  values: readonly (number | null)[];
  texts: readonly (string | null)[];
  centerLabel: string;
} & ComponentPropsWithoutRef<"div">) {
  return (
    <div {...rest} className="gcx:relative gcx:size-28 gcx:shrink-0">
      <Rings
        fractions={values.map((value) => value ?? 0)}
        size={112}
        radii={[48, 38]}
        stroke={7}
        className="gcx:block gcx:size-full"
      />
      <div className="gcx:absolute gcx:inset-0 gcx:flex gcx:flex-col gcx:items-center gcx:justify-center gcx:text-center gcx:leading-tight">
        <span className="gcx:max-w-[44px] gcx:truncate gcx:text-[10px] gcx:text-gc-muted-fg">
          {centerLabel}
        </span>
        {texts.map((text, i) => (
          <span
            key={i}
            className={cn(
              "gcx:text-lg/tight gcx:font-bold gcx:tabular-nums gcx:whitespace-nowrap",
              text === null ? "gcx:text-gc-muted-fg" : TEXT[i],
            )}
          >
            {text ?? "—"}
          </span>
        ))}
      </div>
    </div>
  );
}
