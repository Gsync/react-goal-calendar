import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";

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
  // WCAG 1.4.13: content shown on hover or tap that covers other content must close on Escape.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onDismiss();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onDismiss]);
  // A tap outside the anchor closes it; taps on the anchor toggle it in its own handler.
  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!(event.target instanceof Node) || !anchor.contains(event.target)) onDismiss();
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [anchor, onDismiss]);
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
