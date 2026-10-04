import { useState, type CSSProperties } from "react";
import { GcMonthCalendar, type GcGoal } from "../src";

const GOALS: [GcGoal, GcGoal] = [
  { id: "jobs", label: "Jobs", target: 3 },
  { id: "activity", label: "Activity", target: 2, unit: "h" },
];

// Deterministic sample data for September 2026 up to "today", the 24th.
const VALUES: Record<string, Record<string, number>> = {};
for (let day = 1; day <= 24; day++) {
  VALUES[`2026-09-${String(day).padStart(2, "0")}`] = {
    jobs: day >= 14 && day <= 23 ? 3 : (day * 7) % 5,
    activity: day >= 14 && day <= 23 ? 2.5 : ((day * 3) % 6) / 2,
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

        <h3>Two goals (onMonthChange: {month})</h3>
        <GcMonthCalendar
          goals={GOALS}
          values={VALUES}
          today="2026-09-24"
          onMonthChange={setMonth}
          style={card}
        />

        <h3>Dark, en-GB</h3>
        <div className="dark" style={{ background: "#020617", padding: 16 }}>
          <GcMonthCalendar
            goals={GOALS}
            values={VALUES}
            today="2026-09-24"
            locale="en-GB"
            style={card}
          />
        </div>

        <h3>One goal, limited to Aug–Oct 2026</h3>
        <GcMonthCalendar
          goals={[GOALS[0]]}
          values={VALUES}
          today="2026-09-24"
          minMonth="2026-08"
          maxMonth="2026-10"
          style={card}
        />

        <h3>Right-to-left with custom ring colours</h3>
        <div dir="rtl" style={customRings}>
          <GcMonthCalendar
            goals={GOALS}
            values={VALUES}
            today="2026-09-24"
            style={card}
          />
        </div>
      </section>
    </main>
  );
}
