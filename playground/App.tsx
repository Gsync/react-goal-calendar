import { useState, type CSSProperties } from "react";
import {
  GcCard,
  GcMonthCalendar,
  GcMonthSummary,
  type GcGoal,
  type GcMonthSummaryProps,
} from "../src";

const GOALS: [GcGoal, GcGoal] = [
  { id: "calls", label: "Calls", target: 20 },
  { id: "emails", label: "Emails", target: 10 },
];

// Deterministic sample data for September 2026 up to "today", the 24th.
const VALUES: Record<string, Record<string, number>> = {};
for (let day = 1; day <= 24; day++) {
  VALUES[`2026-09-${String(day).padStart(2, "0")}`] = {
    calls: day >= 14 && day <= 23 ? 22 : ((day * 7) % 5) * 7,
    emails: day >= 14 && day <= 23 ? 12 : (day % 2) * 8,
  };
}

const card: CSSProperties = { maxWidth: 380 };
const deNumber = new Intl.NumberFormat("de-DE");
const customRings = {
  "--gc-ring-1": "#e11d48",
  "--gc-ring-2": "#f59e0b",
} as CSSProperties;

// Playground-only: what an app would compute. Weekdays count; weekends never break a streak.
function summaryFor(month: string) {
  const days = Object.keys(VALUES)
    .filter((key) => key.startsWith(month))
    .sort();
  if (days.length === 0) return undefined;
  const weekdays = days.filter((key) => {
    const day = new Date(`${key}T12:00`).getDay();
    return day !== 0 && day !== 6;
  });
  const hit = (key: string, goal: GcGoal) =>
    (VALUES[key]?.[goal.id] ?? 0) >= goal.target;
  const both = (key: string) => GOALS.every((goal) => hit(key, goal));
  let current = 0;
  let best = 0;
  for (const key of weekdays) {
    current = both(key) ? current + 1 : 0;
    best = Math.max(best, current);
  }
  const plural = (n: number) => (n === 1 ? "1 day" : `${n} days`);
  return {
    rings: Object.fromEntries(
      GOALS.map((goal) => [
        goal.id,
        weekdays.filter((key) => hit(key, goal)).length / weekdays.length,
      ]),
    ),
    stats: [
      {
        label: "Current streak",
        value: plural(current),
        tone: "primary" as const,
      },
      { label: "Best streak", value: plural(best), tone: "warning" as const },
      {
        label: "Both goals met",
        value: plural(days.filter(both).length),
        tone: "success" as const,
      },
      {
        label: "Nothing logged",
        value: plural(
          weekdays.filter((key) => GOALS.every((g) => !VALUES[key]?.[g.id]))
            .length,
        ),
        tone: "danger" as const,
      },
    ],
  };
}
const SEPT_SUMMARY = summaryFor("2026-09");
const SUMMARY_DATA: GcMonthSummaryProps["data"] = SEPT_SUMMARY
  ? { "2026-09": SEPT_SUMMARY }
  : {};

// One <section> per component, each with a heading and a few prop variations.
export function App() {
  const [month, setMonth] = useState("2026-09");
  return (
    <main
      style={{
        maxWidth: 960,
        margin: "0 auto",
        padding: 24,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1>react-goal-calendar</h1>

      <section>
        <h2>GcMonthCalendar</h2>

        <h3>Controlled month ({month}) with a Today button</h3>
        <button type="button" onClick={() => setMonth("2026-09")}>
          Today
        </button>
        <GcCard style={card}>
          <GcMonthCalendar
            goals={GOALS}
            values={VALUES}
            today="2026-09-24"
            month={month}
            onMonthChange={setMonth}
            legend
          />
        </GcCard>

        <h3>Weeks start on Sunday</h3>
        <GcCard style={card}>
          <GcMonthCalendar
            goals={GOALS}
            values={VALUES}
            today="2026-09-24"
            weekStartsOn={0}
          />
        </GcCard>

        <h3>German, translated text</h3>
        <GcCard style={card}>
          <GcMonthCalendar
            goals={GOALS}
            values={VALUES}
            today="2026-09-24"
            locale="de-DE"
            legend
            labels={{ previousMonth: "Vorheriger Monat", nextMonth: "Nächster Monat" }}
            formatDayLabel={(day, date) =>
              day.future
                ? `${date}, bevorstehend`
                : `${date}: ${day.goals.map((g) => `${g.goal.label} ${deNumber.format(g.done)} von ${deNumber.format(g.target)}`).join(", ")}`
            }
          />
        </GcCard>

        <h3>Dark, en-GB</h3>
        <div className="dark" style={{ background: "#020617", padding: 16 }}>
          <GcCard style={card}>
            <GcMonthCalendar
              goals={GOALS}
              values={VALUES}
              today="2026-09-24"
              locale="en-GB"
            />
          </GcCard>
        </div>

        <h3>One goal, limited to Aug–Oct 2026</h3>
        <GcCard style={card}>
          <GcMonthCalendar
            goals={[GOALS[0]]}
            values={VALUES}
            today="2026-09-24"
            minMonth="2026-08"
            maxMonth="2026-10"
          />
        </GcCard>

        <h3>Right-to-left with custom ring colours</h3>
        <div dir="rtl" style={customRings}>
          <GcCard style={card}>
            <GcMonthCalendar
              goals={GOALS}
              values={VALUES}
              today="2026-09-24"
            />
          </GcCard>
        </div>

        <h3>Custom tooltip (percent of target)</h3>
        <GcCard style={card}>
          <GcMonthCalendar
            goals={GOALS}
            values={VALUES}
            today="2026-09-24"
            renderTooltip={(day) =>
              day.future
                ? null
                : day.goals
                    .map(
                      ({ goal, fraction }) =>
                        `${goal.label} ${Math.round(fraction * 100)}%`,
                    )
                    .join(" · ")
            }
          />
        </GcCard>

        <h3>Tooltips off</h3>
        <GcCard style={card}>
          <GcMonthCalendar
            goals={GOALS}
            values={VALUES}
            today="2026-09-24"
            renderTooltip={null}
          />
        </GcCard>

        <h3>Without GcCard, inside the app's own box</h3>
        <div style={{ ...card, border: "2px dashed #94a3b8", padding: 8 }}>
          <GcMonthCalendar goals={GOALS} values={VALUES} today="2026-09-24" />
        </div>
      </section>

      <section>
        <h2>GcMonthSummary</h2>

        <h3>Synced with the calendar above ({month}); October has no data</h3>
        <GcCard style={card}>
          <GcMonthSummary
            rings={GOALS}
            data={SUMMARY_DATA}
            today="2026-09-24"
            month={month}
            onMonthChange={setMonth}
          />
        </GcCard>

        <h3>Narrow card (stacked layout)</h3>
        <GcCard style={{ maxWidth: 280 }}>
          <GcMonthSummary
            rings={GOALS}
            data={SUMMARY_DATA}
            today="2026-09-24"
          />
        </GcCard>

        <h3>German</h3>
        <GcCard style={card}>
          <GcMonthSummary
            rings={GOALS}
            data={SUMMARY_DATA}
            today="2026-09-24"
            locale="de-DE"
            labels={{
              previousMonth: "Vorheriger Monat",
              nextMonth: "Nächster Monat",
              goalHit: "Ziel erreicht",
              noData: "keine Daten",
            }}
          />
        </GcCard>

        <h3>One ring, custom ring colour</h3>
        <GcCard style={{ ...card, ...customRings }}>
          <GcMonthSummary
            rings={[GOALS[0]]}
            data={SUMMARY_DATA}
            today="2026-09-24"
          />
        </GcCard>

        <h3>No legend</h3>
        <GcCard style={card}>
          <GcMonthSummary
            rings={GOALS}
            data={SUMMARY_DATA}
            today="2026-09-24"
            legend={false}
          />
        </GcCard>

        <h3>Dark</h3>
        <div className="dark" style={{ background: "#020617", padding: 16 }}>
          <GcCard style={card}>
            <GcMonthSummary
              rings={GOALS}
              data={SUMMARY_DATA}
              today="2026-09-24"
            />
          </GcCard>
        </div>
      </section>

      <section>
        <h2>GcCard</h2>
        <GcCard style={card}>
          <p style={{ margin: 0 }}>Any content</p>
        </GcCard>
      </section>
    </main>
  );
}
