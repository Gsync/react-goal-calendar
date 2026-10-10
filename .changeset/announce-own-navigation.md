---
"react-goal-calendar": patch
---

GcMonthCalendar and GcMonthSummary announce the month only when their own arrows change it. A calendar and a summary synced through `month` no longer both announce every change, and a `month` set by your app is no longer announced.
