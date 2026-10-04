# react-goal-calendar

Presentational React components for goal tracking: progress-ring calendars, summary donuts and streak stats. Ships as ESM with TypeScript types and one precompiled stylesheet. Your app doesn't need any Tailwind config.

## Install

```sh
npm install react-goal-calendar
```

Requires `react` and `react-dom` 18.3+ or 19.

Import the stylesheet once, e.g. in your root layout:

```ts
import "react-goal-calendar/style.css";
```

The stylesheet contains no CSS reset (no Tailwind preflight), so your app's base styles are left alone. Components are marked `"use client"` and work in Next.js App Router server components.

## Theming

Every colour is a CSS custom property prefixed `--gc-`, with built-in light and dark defaults.

| Variable        | Used for                      |
| --------------- | ----------------------------- |
| `--gc-fg`       | Main text                     |
| `--gc-muted`    | Subtle backgrounds and tracks |
| `--gc-muted-fg` | Secondary text                |
| `--gc-border`   | Borders and dividers          |
| `--gc-primary`  | Accent and highlights         |
| `--gc-card`     | Card surfaces                 |

Set any of them to override, globally or on a wrapper:

```css
:root {
  --gc-primary: oklch(0.6 0.2 260);
}
```

Dark mode follows a `.dark` class or `[data-theme="dark"]` attribute on any ancestor (works with `next-themes` and hand-rolled toggles). If your app follows the OS setting instead, opt in with `data-gc-theme="system"`:

```html
<html data-gc-theme="system">
```

Components may add their own `--gc-*` variables; each component's section lists them.

## Components

### GcMonthCalendar

A month of days, each with one or two progress rings: the outer ring for the first goal, the inner
ring for the second. Weeks start on Monday. Days are read-only; the only controls are the previous
and next month buttons.

```tsx
import { GcMonthCalendar, type GcGoal } from "react-goal-calendar";

const goals: [GcGoal, GcGoal] = [
  { id: "jobs", label: "Jobs", target: 3 },
  { id: "activity", label: "Activity", target: 2, unit: "h" },
];

<GcMonthCalendar
  goals={goals}
  values={{
    "2026-09-01": { jobs: 3, activity: 1.5 },
    "2026-09-02": { jobs: 1 },
  }}
  today="2026-09-24"
/>;
```

Declare `goals` inline or type it as `[GcGoal]` / `[GcGoal, GcGoal]`. A plain `GcGoal[]` is
rejected because at most two rings are drawn.

| Prop                    | Type                                             | Default            |
| ----------------------- | ------------------------------------------------ | ------------------ |
| `goals`                 | `[GcGoal]` or `[GcGoal, GcGoal]`                 | required           |
| `values`                | `{ [date: "YYYY-MM-DD"]: { [goalId]: number } }` | `{}`               |
| `today`                 | `"YYYY-MM-DD"`                                   | current local date |
| `defaultMonth`          | `"YYYY-MM"`                                      | month of `today`   |
| `minMonth` / `maxMonth` | `"YYYY-MM"`                                      | unbounded          |
| `onMonthChange`         | `(month: "YYYY-MM") => void`                     |                    |
| `locale`                | BCP 47 string                                    | `"en-US"`          |
| `className`             | `string`                                         |                    |

Other `<div>` props pass through to the root, and `ref` points at it.

`GcGoal` is `{ id: string; label: string; target: number; unit?: string }`.

- A ring shows `done / target` and is full once the target is reached. The accessible text keeps the
  real amount ("Jobs 5 of 3").
- A target of 0 is always met. Missing, negative or non-numeric amounts count as 0.
- Days after `today` are dimmed and show empty rings, even if `values` has entries for them. Their
  accessible text ends in ", upcoming".
- Each day's accessible text reads like "Tuesday, September 1: Jobs 3 of 3, Activity 1.5 of 2 h.
  All goals met." (English in this version; dates and numbers follow `locale`).

Each day `<td>` carries these attributes when they apply, for styling or tests: `data-today` (also
`aria-current="date"`), `data-future`, `data-complete` (every goal met), `data-empty` (nothing
recorded).

**Server rendering:** pass `today`. Otherwise the server's clock (often UTC) and the browser's can
disagree on the date and cause a hydration mismatch.

| Variable            | Used for                                 |
| ------------------- | ---------------------------------------- |
| `--gc-ring-1`       | Outer ring (first goal)                  |
| `--gc-ring-2`       | Inner ring (second goal)                 |
| `--gc-ring-1-track` | Outer ring track (default: faded ring 1) |
| `--gc-ring-2-track` | Inner ring track (default: faded ring 2) |

## Conventions

- Data comes in through props. Components never fetch.
- Dates are `YYYY-MM-DD` strings so time zones never shift a day. "Today" can be passed as a prop.
- Every component accepts `className`. Decorative visuals are `aria-hidden`, and the same information is exposed through an accessible label.

## License

MIT
