import type { DayProgress } from "./progress";

// 1 January 2024 was a Monday.
export function weekdayNames(
  locale: string,
): { narrow: string; long: string }[] {
  const narrow = new Intl.DateTimeFormat(locale, { weekday: "narrow" });
  const long = new Intl.DateTimeFormat(locale, { weekday: "long" });
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(2024, 0, 1 + i, 12);
    return { narrow: narrow.format(date), long: long.format(date) };
  });
}

// English sentence frame for v1; a `labels` prop for translation can come later.
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
