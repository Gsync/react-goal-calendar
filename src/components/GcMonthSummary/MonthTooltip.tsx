import { cn } from "../../lib/cn";
import { RING_DOTS } from "../../lib/ringDots";

export function DefaultTooltip({
  title,
  rings,
}: {
  title: string;
  rings: readonly { label: string; text: string | null; met: boolean }[];
}) {
  return (
    <>
      <div className="gcx:font-semibold">{title}</div>
      <ul className="gcx:m-0 gcx:mt-1 gcx:flex gcx:list-none gcx:flex-col gcx:gap-0.5 gcx:p-0">
        {rings.map(({ label, text, met }, i) => (
          <li key={i} className="gcx:flex gcx:items-center gcx:gap-2">
            <span className={cn("gcx:size-2 gcx:shrink-0 gcx:rounded-full", RING_DOTS[i])} />
            <span className="gcx:flex-1">{label}</span>
            <span className="gcx:tabular-nums">{text ?? "—"}</span>
            <span className="gcx:w-3 gcx:text-gc-primary">{met ? "✓" : ""}</span>
          </li>
        ))}
      </ul>
    </>
  );
}
