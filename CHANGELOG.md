# react-goal-calendar

## 0.1.0

### Minor Changes

- 1609f22: Add `GcMonthCalendar`, a month calendar with one or two goal-progress rings per day, and the
  `GcGoal` type. While the mouse is over a day, a tooltip shows its progress; change its content with
  `renderTooltip` (`GcDayInfo` type) or turn it off with `renderTooltip={null}`. New theme variables:
  `--gc-ring-1`, `--gc-ring-2`, `--gc-ring-1-track`, `--gc-ring-2-track`, `--gc-tooltip-bg`,
  `--gc-tooltip-fg`.
