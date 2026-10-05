import { useState, type CSSProperties } from "react";
import { GcCard, GcMonthCalendar, type GcGoal } from "../src";

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
const customRings = {
  "--gc-ring-1": "#e11d48",
  "--gc-ring-2": "#f59e0b",
} as CSSProperties;

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
        <h2>GcCard</h2>
        <GcCard style={card}>
          <p style={{ margin: 0 }}>Any content</p>
        </GcCard>
      </section>
    </main>
  );
}
