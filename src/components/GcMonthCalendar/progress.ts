import type { GcDayInfo, GcGoal } from "./types";

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
// Rounded to the 2 decimals the label shows, so a float sum like 0.7 + 0.2 + 0.1 meets 1.
function amount(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? Math.round(value * 100) / 100
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

// Unlike the rings, uses `values` on future days too; `future` lets the tooltip decide.
export function dayInfo(
  date: string,
  todayKey: string,
  goals: readonly GcGoal[],
  day: Readonly<Record<string, number>> | undefined,
): GcDayInfo {
  const { rings, complete } = dayProgress(goals, day);
  return {
    date,
    today: date === todayKey,
    future: date > todayKey,
    complete,
    goals: rings,
  };
}
