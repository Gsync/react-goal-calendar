import { cn } from "../../lib/cn";
import { RING_DOTS } from "../../lib/ringDots";
import type { GcDayInfo } from "./types";

export function DefaultTooltip({
  day,
  dateText,
  number,
}: {
  day: GcDayInfo;
  dateText: string;
  number: Intl.NumberFormat;
}) {
  return (
    <>
      <div className="gcx:font-semibold">{dateText}</div>
      <ul className="gcx:m-0 gcx:mt-1 gcx:flex gcx:list-none gcx:flex-col gcx:gap-0.5 gcx:p-0">
        {day.goals.map(({ goal, done, target, fraction }, i) => (
          <li key={i} className="gcx:flex gcx:items-center gcx:gap-2">
            <span className={cn("gcx:size-2 gcx:shrink-0 gcx:rounded-full", RING_DOTS[i])} />
            <span className="gcx:flex-1">{goal.label}</span>
            <span className="gcx:tabular-nums">
              {`${number.format(done)} / ${number.format(target)}${goal.unit ? ` ${goal.unit}` : ""}`}
            </span>
            <span className="gcx:w-3 gcx:text-gc-primary">
              {fraction >= 1 ? "✓" : ""}
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}
