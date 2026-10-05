---
"react-goal-calendar": minor
---

The stylesheet's classes and theme variables no longer clash with an app's own Tailwind: every class is now prefixed (`gcx:flex`), Tailwind's theme variables are renamed to `--gcx-*` (`--gcx-spacing`), so `--gc-*` names are only the calendar's own, and the file declares Tailwind's full layer order so importing it before the app's CSS can't put the app's reset above its utilities. Class names were never public API; the documented `--gc-*` colour variables and `data-*` attributes are unchanged.
