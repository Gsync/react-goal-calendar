import type { DayProgress } from "./progress";

// 7 January 2024 was a Sunday, so 7 + firstDay is the first column's weekday.
export function weekdayNames(
  locale: string,
  firstDay: number,
): { narrow: string; long: string }[] {
  const narrow = new Intl.DateTimeFormat(locale, { weekday: "narrow" });
  const long = new Intl.DateTimeFormat(locale, { weekday: "long" });
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(2024, 0, 7 + firstDay + i, 12);
    return { narrow: narrow.format(date), long: long.format(date) };
  });
}

// English sentence frame; `formatDayLabel` replaces it.
// `progress` is null for future days, which are dimmed, so the text says "upcoming".
export function dayLabel(
  dateText: string,
  progress: DayProgress | null,
  number: Intl.NumberFormat,
): string {
  if (!progress) return `${dateText}, upcoming`;
  if (progress.rings.length === 0) return dateText;
  const goals = progress.rings
    .map(({ goal, done, target }) => {
      const unit = goal.unit ? ` ${goal.unit}` : "";
      return `${goal.label} ${number.format(done)} of ${number.format(target)}${unit}`;
    })
    .join(", ");
  return `${dateText}: ${goals}${progress.complete ? ". All goals met." : ""}`;
}
