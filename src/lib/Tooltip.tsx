import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { cn } from "./cn";
import { RING_DOTS } from "./ringDots";

const BOX =
  "gcx:pointer-events-none gcx:invisible gcx:absolute gcx:z-10 gcx:box-border gcx:w-max gcx:max-w-56 gcx:rounded-lg gcx:border gcx:border-gc-border gcx:bg-gc-tooltip-bg gcx:px-3 gcx:py-2 gcx:text-start gcx:text-xs gcx:leading-snug gcx:text-gc-tooltip-fg gcx:shadow-md gcx:motion-safe:transition-opacity gcx:motion-safe:duration-150 gcx:starting:opacity-0";
const GAP = 4;

// Measured and placed before paint; writes `style` directly so placing it costs no second render.
export function Tooltip({
  anchor,
  onDismiss,
  children,
}: {
  anchor: HTMLElement;
  onDismiss: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Callers pass an inline arrow; a ref keeps the document listeners from re-binding every render.
  const dismiss = useRef(onDismiss);
  useLayoutEffect(() => {
    dismiss.current = onDismiss;
  });
  // WCAG 1.4.13: content shown on hover or tap that covers other content must close on Escape.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") dismiss.current();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);
  // A tap outside the anchor closes it; taps on the anchor toggle it in its own handler.
  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!(event.target instanceof Node) || !anchor.contains(event.target)) dismiss.current();
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [anchor]);
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

// The default tooltips' content: a title over one row per ring, a tick on the rings that met it.
export function TooltipRows({
  title,
  rows,
}: {
  title: string;
  rows: readonly { label: string; text: string; met: boolean }[];
}) {
  return (
    <>
      <div className="gcx:font-semibold">{title}</div>
      <ul className="gcx:m-0 gcx:mt-1 gcx:flex gcx:list-none gcx:flex-col gcx:gap-0.5 gcx:p-0">
        {rows.map(({ label, text, met }, i) => (
          <li key={i} className="gcx:flex gcx:items-center gcx:gap-2">
            <span className={cn("gcx:size-2 gcx:shrink-0 gcx:rounded-full", RING_DOTS[i])} />
            <span className="gcx:flex-1">{label}</span>
            <span className="gcx:tabular-nums">{text}</span>
            <span className="gcx:w-3 gcx:text-gc-primary">{met ? "✓" : ""}</span>
          </li>
        ))}
      </ul>
    </>
  );
}
