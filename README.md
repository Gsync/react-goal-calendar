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

Dark mode follows a `.dark` class or `[data-theme="dark"]` attribute on any ancestor. Components may add their own `--gc-*` variables; each component's section lists them.

## Components

_None yet._

## Conventions

- Data comes in through props. Components never fetch.
- Dates are `YYYY-MM-DD` strings so time zones never shift a day. "Today" can be passed as a prop.
- Every component accepts `className`. Decorative visuals are `aria-hidden`, and the same information is exposed through an accessible label.

## License

MIT
