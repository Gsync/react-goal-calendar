import { useState } from "react";
import {
  addMonths,
  clampMonth,
  isDateKey,
  isMonthKey,
  toDateKey,
} from "./dates";

interface MonthOptions {
  today?: string;
  defaultMonth?: string;
  month?: string;
  minMonth?: string;
  maxMonth?: string;
  onMonthChange?: (month: string) => void;
}

// The shown month: a valid `month` prop wins (controlled), else our own; always inside the bounds.
export function useMonth({
  today,
  defaultMonth,
  month,
  minMonth,
  maxMonth,
  onMonthChange,
}: MonthOptions) {
  // Read the clock once, in an initializer (render must stay pure). It can differ between
  // server and browser, so SSR consumers pass `today`.
  const [clockToday] = useState(() => toDateKey(new Date()));
  const todayKey = isDateKey(today) ? today : clockToday;
  const [ownMonth, setOwnMonth] = useState(() =>
    isMonthKey(defaultMonth) ? defaultMonth : todayKey.slice(0, 7),
  );
  const shownMonth = clampMonth(
    isMonthKey(month) ? month : ownMonth,
    minMonth,
    maxMonth,
  );
  // The month our own buttons moved to. Only that change is announced: when a parent syncs two
  // views, the one whose button was pressed speaks, and a parent's own month change stays silent.
  const [navMonth, setNavMonth] = useState<string | null>(null);
  if (navMonth !== null && navMonth !== shownMonth) setNavMonth(null);
  const canGoBack = !isMonthKey(minMonth) || shownMonth > minMonth;
  const canGoForward = !isMonthKey(maxMonth) || shownMonth < maxMonth;

  function showMonth(next: string) {
    setOwnMonth(next);
    setNavMonth(next);
    onMonthChange?.(next);
  }

  return {
    todayKey,
    shownMonth,
    canGoBack,
    canGoForward,
    announce: navMonth === shownMonth,
    goBack: () => {
      if (canGoBack) showMonth(addMonths(shownMonth, -1));
    },
    goForward: () => {
      if (canGoForward) showMonth(addMonths(shownMonth, 1));
    },
  };
}
