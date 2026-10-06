import { cn } from "./cn";

// Outer ring first. Full class literals so Tailwind generates them.
const COLOURS = [
  { track: "gcx:stroke-gc-ring-1-track", arc: "gcx:stroke-gc-ring-1" },
  { track: "gcx:stroke-gc-ring-2-track", arc: "gcx:stroke-gc-ring-2" },
] as const;

interface RingsProps {
  fractions: readonly number[];
  // viewBox side; the rings are centred in it.
  size: number;
  radii: readonly number[];
  stroke: number;
  className?: string;
}

export function Rings({
  fractions,
  size,
  radii,
  stroke,
  className,
}: RingsProps) {
  const c = size / 2;
  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
      className={className}
    >
      {COLOURS.slice(0, fractions.length).map((colour, i) => {
        const r = radii[i];
        if (r === undefined) return null;
        const fraction = fractions[i] ?? 0;
        const length = 2 * Math.PI * r;
        return (
          <g key={i}>
            <circle
              cx={c}
              cy={c}
              r={r}
              fill="none"
              strokeWidth={stroke}
              className={colour.track}
            />
            {fraction > 0 && (
              <circle
                cx={c}
                cy={c}
                r={r}
                fill="none"
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={`${fraction * length} ${length}`}
                transform={`rotate(-90 ${c} ${c})`}
                className={cn(
                  colour.arc,
                  "gcx:motion-safe:transition-[stroke-dasharray] gcx:motion-safe:duration-300",
                )}
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}
