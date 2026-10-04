import { cn } from "../../lib/cn";

// Outer ring first. Full class literals so Tailwind generates them.
const RINGS = [
  { r: 14.5, track: "stroke-gc-ring-1-track", arc: "stroke-gc-ring-1" },
  { r: 8, track: "stroke-gc-ring-2-track", arc: "stroke-gc-ring-2" },
] as const;
const STROKE = 5;

export function DayRings({ fractions }: { fractions: readonly number[] }) {
  return (
    <svg
      viewBox="0 0 36 36"
      aria-hidden="true"
      className="mx-auto block aspect-square w-full max-w-12"
    >
      {RINGS.slice(0, fractions.length).map((ring, i) => {
        const fraction = fractions[i] ?? 0;
        const length = 2 * Math.PI * ring.r;
        return (
          <g key={ring.r}>
            <circle
              cx="18"
              cy="18"
              r={ring.r}
              fill="none"
              strokeWidth={STROKE}
              className={ring.track}
            />
            {fraction > 0 && (
              <circle
                cx="18"
                cy="18"
                r={ring.r}
                fill="none"
                strokeWidth={STROKE}
                strokeLinecap="round"
                strokeDasharray={`${fraction * length} ${length}`}
                transform="rotate(-90 18 18)"
                className={cn(
                  ring.arc,
                  "motion-safe:transition-[stroke-dasharray] motion-safe:duration-300",
                )}
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}
