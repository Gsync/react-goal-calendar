# react-goal-calendar

## 0.4.0

### Minor Changes

- 9d51701: GcMonthCalendar: the legend now starts with a "Daily goal" caption (change it with `labels.legend`). Pass `onSettingsClick` to show a small settings button at the end of the legend row, or put your own controls there with the new `actions` prop. Their box carries `data-gc-actions`.
- 7467f23: GcMonthSummary: hovering or tapping the donut shows a tooltip with the month and each ring's percentage, like GcMonthCalendar's day tooltip. Customize it with the new `renderTooltip` prop, or pass `renderTooltip={null}` to turn it off.

### Patch Changes

- 50b14c4: GcMonthCalendar and GcMonthSummary announce the month only when their own arrows change it. A calendar and a summary synced through `month` no longer both announce every change, and a `month` set by your app is no longer announced.
- edfcd22: GcMonthSummary: stat labels no longer overlap their values. Labels stay on one line (truncated if needed), the value moves under the label when a tile is too narrow, and in the side-by-side layout the ring and the stats each get half the width.

## 0.3.0

### Minor Changes

- 6e5a244: Add `GcMonthSummary`: a month's goal-hit donut and stat rows, with numbers your app computes per
  month. Adds the `--gc-success`, `--gc-warning`, `--gc-danger`, `--gc-ring-1-text` and
  `--gc-ring-2-text` colour variables.

## 0.2.0

### Minor Changes

- c30c607: Add `GcCard`, the card frame (border, radius, background, padding). **Breaking:** `GcMonthCalendar` no longer draws its own frame; wrap it in `<GcCard>` to keep the old look, or place it in your own card.
- 9896ac3: The stylesheet's classes and theme variables no longer clash with an app's own Tailwind: every class is now prefixed (`gcx:flex`), Tailwind's theme variables are renamed to `--gcx-*` (`--gcx-spacing`), so `--gc-*` names are only the calendar's own, and the file declares Tailwind's full layer order so importing it before the app's CSS can't put the app's reset above its utilities. Class names were never public API; the documented `--gc-*` colour variables and `data-*` attributes are unchanged.
- 2e1db4f: `GcMonthCalendar`: `goals` accepts any `GcGoal[]` (the first two are drawn), and development builds warn about malformed or conflicting props instead of ignoring them silently.
- c3c6975: `GcMonthCalendar`: add `legend` (a key of ring colours, labels and targets), `formatDayLabel` to translate each day's accessible text, and `labels` to translate the month buttons.
- 298c01b: `GcMonthCalendar`: add a controlled `month` prop (pair it with `onMonthChange`) and `weekStartsOn` (0 = Sunday … 6 = Saturday, default Monday).
- bf4a50c: `GcMonthCalendar`: the day tooltip now also opens on tap (touch and pen) and closes on a tap elsewhere, a second tap or Escape.

### Patch Changes

- 3b8fa5b: Add npm keywords so the package is easier to find.

## 0.1.0

### Minor Changes

- 1609f22: Add `GcMonthCalendar`, a month calendar with one or two goal-progress rings per day, and the
  `GcGoal` type. While the mouse is over a day, a tooltip shows its progress; change its content with
  `renderTooltip` (`GcDayInfo` type) or turn it off with `renderTooltip={null}`. New theme variables:
  `--gc-ring-1`, `--gc-ring-2`, `--gc-ring-1-track`, `--gc-ring-2-track`, `--gc-tooltip-bg`,
  `--gc-tooltip-fg`.
