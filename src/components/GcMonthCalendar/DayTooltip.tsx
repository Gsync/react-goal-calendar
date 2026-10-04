import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { cn } from "../../lib/cn";
import type { GcDayInfo } from "./types";

const BOX =
  "pointer-events-none invisible absolute z-10 box-border w-max max-w-56 rounded-lg border border-gc-border bg-gc-tooltip-bg px-3 py-2 text-start text-xs leading-snug text-gc-tooltip-fg shadow-md motion-safe:transition-opacity motion-safe:duration-150 starting:opacity-0";
const GAP = 4;

// Dots match the rings: outer (first goal), inner (second goal).
const DOTS = ["bg-gc-ring-1", "bg-gc-ring-2"] as const;

// Measured and placed before paint; writes `style` directly so placing it costs no second render.
export function DayTooltip({
  anchor,
  onDismiss,
  children,
}: {
  anchor: HTMLElement;
  onDismiss: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // WCAG 1.4.13: hover content that covers other content must close on Escape.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onDismiss();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onDismiss]);
  useLayoutEffect(() => {
    const box = ref.current;
    const root = box?.offsetParent;
    if (!box || !(root instanceof HTMLElement)) return;
    const r = root.getBoundingClientRect();
    const a = anchor.getBoundingClientRect();
    // Absolute offsets start inside the root's border.
    const x = r.left + root.clientLeft;
    const y = r.top + root.clientTop;
    const centred = a.left + a.width / 2 - box.offsetWidth / 2 - x;
    const left = Math.max(
      0,
      Math.min(centred, root.clientWidth - box.offsetWidth),
    );
    const above = a.top - y - box.offsetHeight - GAP;
    box.style.left = `${left}px`;
    box.style.top = `${above >= 0 ? above : a.bottom - y + GAP}px`;
    box.style.visibility = "visible";
  });
  return (
    <div ref={ref} aria-hidden="true" data-gc-tooltip="" className={BOX}>
      {children}
    </div>
  );
}

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
      <div className="font-semibold">{dateText}</div>
      <ul className="m-0 mt-1 flex list-none flex-col gap-0.5 p-0">
        {day.goals.map(({ goal, done, target, fraction }, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className={cn("size-2 shrink-0 rounded-full", DOTS[i])} />
            <span className="flex-1">{goal.label}</span>
            <span className="tabular-nums">
              {`${number.format(done)} / ${number.format(target)}${goal.unit ? ` ${goal.unit}` : ""}`}
            </span>
            <span className="w-3 text-gc-primary">
              {fraction >= 1 ? "✓" : ""}
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}
