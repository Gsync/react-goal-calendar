// Smoke-checks the built package. Run after `vite build`; specs only cover src/.
import { readFileSync } from "node:fs";

const failures = [];
const js = readFileSync("dist/index.js", "utf8");
const dts = readFileSync("dist/index.d.ts", "utf8");
const css = readFileSync("dist/style.css", "utf8");

if (!js.startsWith('"use client";')) {
  failures.push('dist/index.js must start with "use client";');
}
// Left for the consumer's bundler, so dev warnings vanish from production builds.
if (!js.includes("process.env.NODE_ENV")) {
  failures.push("dist/index.js must leave process.env.NODE_ENV for the consumer's bundler");
}

const mod = await import(new URL("../dist/index.js", import.meta.url).href);
for (const name of ["GcMonthCalendar", "GcCard"]) {
  if (!mod[name]) failures.push(`dist/index.js does not export ${name}`);
}

for (const name of ["GcMonthCalendarProps", "GcGoal", "GcDayInfo", "GcCardProps"]) {
  if (!new RegExp(`\\b${name}\\b`).test(dts)) {
    failures.push(`dist/index.d.ts does not declare ${name}`);
  }
}

for (const token of [
  "--gc-default-primary",
  "--gc-default-ring-1",
  ".gcx\\:stroke-gc-ring-1",
  ".gcx\\:bg-gc-tooltip-bg",
]) {
  if (!css.includes(token)) failures.push(`dist/style.css is missing ${token}`);
}

// Unprefixed utilities or theme vars would collide with a host app's own Tailwind.
for (const cls of ["hidden", "flex", "block", "p-4", "text-sm", "rounded-lg", "sr-only"]) {
  if (css.includes(`.${cls}{`) || css.includes(`.${cls},`)) {
    failures.push(`dist/style.css has an unprefixed .${cls}`);
  }
}
if (/(^|[{;\s])--(spacing|color-|radius-|text-|font-weight-|leading-)[\w-]*:/m.test(css)) {
  failures.push("dist/style.css declares an unprefixed Tailwind theme variable");
}
if (css.includes("var(--color-")) {
  failures.push("dist/style.css references an unprefixed --color-* variable");
}
// --gc-* is the calendar's own token namespace; Tailwind's theme vars must be --gcx-*.
if (/--gc-(spacing|color-|radius-|text-|font-|shadow-|leading-|ease-|default-(transition|font|mono))/.test(css)) {
  failures.push("dist/style.css has a Tailwind theme variable under --gc-*");
}

// Declared before any layer block, so importing this file first can't reorder the app's layers.
const order =
  /@layer\s*properties\s*,\s*theme\s*,\s*base\s*,\s*components\s*,\s*utilities\s*;/.exec(css);
const firstBlock = /@layer\s+[\w.-]+\s*\{/.exec(css);
if (!order || (firstBlock && firstBlock.index < order.index)) {
  failures.push("dist/style.css must declare the full Tailwind layer order before any layer block");
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("dist OK");
