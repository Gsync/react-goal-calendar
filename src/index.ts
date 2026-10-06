import "./styles.css";

// Public API. Export each component by name together with its props type.
export { GcMonthCalendar } from "./components/GcMonthCalendar/GcMonthCalendar";
export type {
  GcDayInfo,
  GcGoal,
  GcMonthCalendarProps,
} from "./components/GcMonthCalendar/types";
export { GcCard } from "./components/GcCard/GcCard";
export type { GcCardProps } from "./components/GcCard/types";
export { GcMonthSummary } from "./components/GcMonthSummary/GcMonthSummary";
export type { GcMonthSummaryProps } from "./components/GcMonthSummary/types";
