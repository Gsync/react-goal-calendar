import type { GcGoal } from "./types";

export interface RingProgress {
  goal: GcGoal;
  done: number;
  target: number;
  fraction: number;
}

export interface DayProgress {
  rings: RingProgress[];
  complete: boolean;
  empty: boolean;
}

// Values come from untyped consumer data; anything but a positive finite number counts as 0.
function amount(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : 0;
}

// Over-target clamps to a full ring; a target of 0 counts as met.
export function dayProgress(
  goals: readonly GcGoal[],
  day: Readonly<Record<string, number>> | undefined,
): DayProgress {
  const rings = goals.map((goal) => {
    const done = amount(day?.[goal.id]);
    const target = amount(goal.target);
    return {
      goal,
      done,
      target,
      fraction: target === 0 ? 1 : Math.min(1, done / target),
    };
  });
  return {
    rings,
    complete: rings.length > 0 && rings.every((ring) => ring.fraction >= 1),
    empty: rings.length > 0 && rings.every((ring) => ring.done === 0),
  };
}
