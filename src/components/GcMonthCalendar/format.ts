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
