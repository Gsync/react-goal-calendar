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
ring for the second. Weeks start on Monday unless `weekStartsOn` says otherwise. Days are
read-only; the only controls are the previous and next month buttons.

The calendar draws no card frame; wrap it in `GcCard` for one, or place it in your own card. In your
own card, set `--gc-card` to the card's background colour: the ring tracks and the tooltip are mixed
with it.

```tsx
import { GcCard, GcMonthCalendar, type GcGoal } from "react-goal-calendar";

const goals: GcGoal[] = [
  { id: "calls", label: "Calls", target: 20 },
  { id: "emails", label: "Emails", target: 10 },
];

<GcCard>
  <GcMonthCalendar
    goals={goals}
    values={{
      "2026-09-01": { calls: 20, emails: 10 },
      "2026-09-02": { calls: 8 },
    }}
    today="2026-09-24"
  />
</GcCard>;
```

| Prop                    | Type                                             | Default                                        |
| ----------------------- | ------------------------------------------------ | ---------------------------------------------- |
| `goals`                 | `GcGoal[]` (first two drawn)                     | required                                       |
| `values`                | `{ [date: "YYYY-MM-DD"]: { [goalId]: number } }` | `{}`                                           |
| `today`                 | `"YYYY-MM-DD"`                                   | current local date                             |
| `month`                 | `"YYYY-MM"` (controlled)                         |                                                |
| `defaultMonth`          | `"YYYY-MM"`                                      | month of `today` (ignored when `month` is set) |
| `minMonth` / `maxMonth` | `"YYYY-MM"`                                      | unbounded                                      |
| `weekStartsOn`          | `0`–`6` (0 = Sunday)                             | `1`                                            |
| `onMonthChange`         | `(month: "YYYY-MM") => void`                     |                                                |
| `locale`                | BCP 47 string                                    | `"en-US"`                                      |
| `renderTooltip`         | `(day: GcDayInfo) => ReactNode`, or `null`       | built-in summary                               |
| `legend`                | `boolean`                                        | `false`                                        |
| `formatDayLabel`        | `(day: GcDayInfo, dateText: string) => string`   | built-in English                               |
| `labels`                | `{ previousMonth?, nextMonth? }`                 | English                                        |
| `className`             | `string`                                         |                                                |

**Controlled month.** Pass `month` and update it from `onMonthChange` to own the month, e.g. to
load data per month or add your own "Today" button:

```tsx
const [month, setMonth] = useState("2026-09");

<button onClick={() => setMonth("2026-09")}>Today</button>
<GcMonthCalendar goals={goals} values={values} month={month} onMonthChange={setMonth} />
```

**Legend.** `legend` shows each goal's ring colour, label and daily target below the grid, so users
can tell the rings apart without hovering.

Other `<div>` props pass through to the root, and `ref` points at it.

`GcGoal` is `{ id: string; label: string; target: number; unit?: string }`.

- A ring shows `done / target` and is full once the target is reached. The accessible text keeps the
  real amount ("Calls 25 of 20").
- A target of 0 is always met. Missing, negative or non-numeric amounts count as 0.
- Days after `today` are dimmed and show empty rings, even if `values` has entries for them. Their
  accessible text ends in ", upcoming".
- Each day's accessible text reads like "Tuesday, September 1: Calls 20 of 20, Emails 10 of 10.
  All goals met." (English by default; pass `formatDayLabel` and `labels` to translate. Dates and
  numbers follow `locale`). `formatDayLabel` gets the date already formatted but raw numbers: format
  them with one `Intl.NumberFormat` created outside the callback, and check `day.future`, since
  future days still carry their `values`.

In development, the calendar logs a `console.warn` for props it has to ignore: a malformed `today`,
`month`, `defaultMonth`, `minMonth` or `maxMonth`, `minMonth` after `maxMonth`, an invalid
`weekStartsOn`, a `goals` that isn't an array, or more than two goals. Each message is logged once
per page load. Production builds log nothing.

Each day `<td>` carries these attributes when they apply, for styling or tests: `data-today` (also
`aria-current="date"`), `data-future`, `data-complete` (every goal met), `data-empty` (nothing
recorded).

**Tooltip.** While the mouse is over a past day or today, a small card shows the date and each
goal's `done / target`, with a ✓ for met goals. Pass `renderTooltip` to change what's inside the
card (it keeps its box and position), return `null` to show nothing for a day, or pass
`renderTooltip={null}` to turn it off:

```tsx
<GcMonthCalendar
  goals={goals}
  values={values}
  renderTooltip={(day) =>
    day.future ? null : `${day.goals[0]?.done ?? 0} calls`
  }
/>
```

`GcDayInfo` is `{ date, today, future, complete, goals: { goal, done, target, fraction }[] }`. For
future days `goals` holds the real `values`, even though their rings draw empty.

The tooltip opens for mouse pointers only, closes on Escape, and is hidden from assistive tech,
because each day's accessible text already has the same numbers. Keyboard, touch and screen-reader
users never see it, so don't put information only there. The hovered day gets `data-hovered` and
the card carries `data-gc-tooltip`, for styling.

**Server rendering:** pass `today`. Otherwise the server's clock (often UTC) and the browser's can
disagree on the date and cause a hydration mismatch.

| Variable            | Used for                                  |
| ------------------- | ----------------------------------------- |
| `--gc-ring-1`       | Outer ring (first goal)                   |
| `--gc-ring-2`       | Inner ring (second goal)                  |
| `--gc-ring-1-track` | Outer ring track (default: faded ring 1)  |
| `--gc-ring-2-track` | Inner ring track (default: faded ring 2)  |
| `--gc-tooltip-bg`   | Tooltip background (default: `--gc-card`) |
| `--gc-tooltip-fg`   | Tooltip text (default: `--gc-fg`)         |

### GcCard

The card frame used in the examples: border, rounded corners, card background and padding. Wrap
any component in it, or skip it and use your own card.

```tsx
<GcCard>
  <GcMonthCalendar goals={goals} values={values} today={today} />
</GcCard>
```

All `<div>` props pass through, `className` is merged last and `ref` points at the `<div>`. Colours
come from `--gc-card`, `--gc-border` and `--gc-fg`.

## Conventions

- Data comes in through props. Components never fetch.
- Dates are `YYYY-MM-DD` strings so time zones never shift a day. "Today" can be passed as a prop.
- Every component accepts `className`. Decorative visuals are `aria-hidden`, and the same information is exposed through an accessible label.

## License

MIT
