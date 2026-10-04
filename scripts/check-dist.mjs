// Smoke-checks the built package. Run after `vite build`; specs only cover src/.
import { readFileSync } from "node:fs";

const failures = [];
const js = readFileSync("dist/index.js", "utf8");
const dts = readFileSync("dist/index.d.ts", "utf8");
const css = readFileSync("dist/style.css", "utf8");

if (!js.startsWith('"use client";')) {
  failures.push('dist/index.js must start with "use client";');
}

const mod = await import(new URL("../dist/index.js", import.meta.url).href);
for (const name of ["GcMonthCalendar"]) {
  if (!mod[name]) failures.push(`dist/index.js does not export ${name}`);
}

for (const name of ["GcMonthCalendarProps", "GcGoal", "GcDayInfo"]) {
  if (!new RegExp(`\\b${name}\\b`).test(dts)) {
    failures.push(`dist/index.d.ts does not declare ${name}`);
  }
}

for (const token of [
  "--gc-default-primary",
  "--gc-default-ring-1",
  ".stroke-gc-ring-1",
  ".bg-gc-tooltip-bg",
]) {
  if (!css.includes(token)) failures.push(`dist/style.css is missing ${token}`);
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("dist OK");
