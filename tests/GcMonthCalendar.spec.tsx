import { createRef, type ReactNode, type Ref } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  GcMonthCalendar,
  type GcDayInfo,
  type GcGoal,
  type GcMonthCalendarProps,
} from "../src";

const GOALS: [GcGoal, GcGoal] = [
  { id: "jobs", label: "Jobs", target: 3 },
  { id: "activity", label: "Activity", target: 2, unit: "h" },
];

function renderCalendar(
  props: Partial<GcMonthCalendarProps> & { ref?: Ref<HTMLDivElement> } = {},
) {
  return render(
    <GcMonthCalendar
      goals={GOALS}
      today="2026-09-24"
      locale="en-US"
      {...props}
    />,
  );
}

// Visible day numbers per week row; "" for padding cells.
function weekRows(): string[][] {
  const [, ...weeks] = screen.getAllByRole("row");
  return weeks.map((row) =>
    within(row)
      .getAllByRole("cell")
      .map((cell) => cell.querySelector("[aria-hidden]")?.textContent ?? ""),
  );
}

function days(from: number, to: number): string[] {
  return Array.from({ length: to - from + 1 }, (_, i) => String(from + i));
}

// A day cell by the start of its accessible name, e.g. "Tuesday, September 1".
function dayCell(date: string): HTMLElement {
  return screen.getByRole("cell", { name: new RegExp(`^${date}(:|,|$)`) });
}

describe("GcMonthCalendar month grid", () => {
  it("lays out September 2026 in Monday-first weeks with empty padding", () => {
    renderCalendar({ defaultMonth: "2026-09" });
    expect(weekRows()).toEqual([
      ["", ...days(1, 6)],
      days(7, 13),
      days(14, 20),
      days(21, 27),
      [...days(28, 30), "", "", "", ""],
    ]);
  });

  it("renders a four-week February that starts on Monday", () => {
    renderCalendar({ defaultMonth: "2027-02" });
    expect(weekRows()).toEqual([
      days(1, 7),
      days(8, 14),
      days(15, 21),
      days(22, 28),
    ]);
  });

  it("renders a six-week month that starts on Saturday", () => {
    renderCalendar({ defaultMonth: "2026-08" });
    const rows = weekRows();
    expect(rows).toHaveLength(6);
    expect(rows[0]).toEqual(["", "", "", "", "", "1", "2"]);
    expect(rows[5]).toEqual(["31", "", "", "", "", "", ""]);
  });

  it("includes 29 February in a leap year", () => {
    renderCalendar({ defaultMonth: "2028-02" });
    expect(weekRows().at(-1)).toEqual(["28", "29", "", "", "", "", ""]);
  });

  it("titles the month and labels the table with it", () => {
    renderCalendar({ defaultMonth: "2026-09" });
    expect(screen.getByRole("status")).toHaveTextContent("Sep 2026");
    expect(screen.getByRole("table", { name: "Sep 2026" })).toBeInTheDocument();
  });

  it("formats the title with the locale", () => {
    renderCalendar({ defaultMonth: "2026-09", locale: "en-GB" });
    expect(screen.getByRole("status")).toHaveTextContent("Sept 2026");
  });

  it("shows the month of today by default", () => {
    renderCalendar({ today: "2027-02-10" });
    expect(screen.getByRole("status")).toHaveTextContent("Feb 2027");
  });

  it("falls back to today's month when defaultMonth is malformed", () => {
    renderCalendar({ today: "2026-09-24", defaultMonth: "2026-9" });
    expect(screen.getByRole("status")).toHaveTextContent("Sep 2026");
  });

  it("shows single-letter weekdays with full names for assistive tech", () => {
    renderCalendar();
    const letters = screen
      .getAllByRole("columnheader")
      .map((th) => th.querySelector("[aria-hidden]")?.textContent);
    expect(letters).toEqual(["M", "T", "W", "T", "F", "S", "S"]);
    for (const name of [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ]) {
      expect(screen.getByRole("columnheader", { name })).toBeInTheDocument();
    }
  });

  it("names weekdays in the given locale", () => {
    renderCalendar({ locale: "de-DE" });
    expect(
      screen.getByRole("columnheader", { name: "Montag" }),
    ).toBeInTheDocument();
  });

  it("names each day cell with its full date", () => {
    renderCalendar({ defaultMonth: "2026-09" });
    expect(dayCell("Tuesday, September 1")).toBeInTheDocument();
  });

  it("has no focusable elements inside the grid", () => {
    renderCalendar();
    const table = screen.getByRole("table");
    expect(table.querySelectorAll("button, [tabindex]")).toHaveLength(0);
  });

  it("forwards the ref, merges className and passes native props to the root", () => {
    const ref = createRef<HTMLDivElement>();
    renderCalendar({
      ref,
      className: "custom",
      id: "cal",
      "data-testid": "cal",
    } as never);
    const root = screen.getByTestId("cal");
    expect(ref.current).toBe(root);
    expect(root).toHaveClass("custom");
    expect(root).toHaveAttribute("id", "cal");
  });
});

describe("GcMonthCalendar today and future", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("marks only today with aria-current and data-today", () => {
    renderCalendar({ today: "2026-09-24" });
    const today = dayCell("Thursday, September 24");
    expect(today).toHaveAttribute("aria-current", "date");
    expect(today).toHaveAttribute("data-today");
    expect(document.querySelectorAll("[aria-current]")).toHaveLength(1);
    expect(document.querySelectorAll("[data-today]")).toHaveLength(1);
  });

  it("marks days after today as future", () => {
    renderCalendar({ today: "2026-09-24" });
    expect(dayCell("Friday, September 25")).toHaveAttribute("data-future");
    // The dimming is visual only, so it is also in the text.
    expect(
      screen.getByRole("cell", { name: "Friday, September 25, upcoming" }),
    ).toBeInTheDocument();
    expect(dayCell("Thursday, September 24")).not.toHaveAttribute(
      "data-future",
    );
    expect(dayCell("Wednesday, September 23")).not.toHaveAttribute(
      "data-future",
    );
  });

  it("marks a whole later month as future and an earlier one as past", () => {
    const { unmount } = renderCalendar({
      today: "2026-09-24",
      defaultMonth: "2026-10",
    });
    expect(document.querySelectorAll("td[data-future]")).toHaveLength(31);
    expect(document.querySelector("[aria-current]")).toBeNull();
    unmount();
    renderCalendar({ today: "2026-09-24", defaultMonth: "2026-08" });
    expect(document.querySelectorAll("td[data-future]")).toHaveLength(0);
    expect(document.querySelector("[aria-current]")).toBeNull();
  });

  it("falls back to the local clock when today is missing or malformed", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    // 22:00 local in America/Santiago is already the 6th in UTC; a UTC-based "today" fails here.
    vi.setSystemTime(new Date(2026, 8, 5, 22, 0));
    const { unmount } = renderCalendar({ today: undefined });
    expect(dayCell("Saturday, September 5")).toHaveAttribute(
      "aria-current",
      "date",
    );
    unmount();
    renderCalendar({ today: "2026-9-5" });
    expect(dayCell("Saturday, September 5")).toHaveAttribute(
      "aria-current",
      "date",
    );
  });
});

describe("GcMonthCalendar goal progress", () => {
  it("describes each goal's progress in the day's accessible name", () => {
    renderCalendar({ values: { "2026-09-01": { jobs: 2, activity: 1.5 } } });
    const cell = screen.getByRole("cell", {
      name: "Tuesday, September 1: Jobs 2 of 3, Activity 1.5 of 2 h",
    });
    expect(cell).not.toHaveAttribute("data-complete");
  });

  it("marks a day complete when every goal reaches its target", () => {
    renderCalendar({ values: { "2026-09-03": { jobs: 3, activity: 2 } } });
    const cell = screen.getByRole("cell", {
      name: "Thursday, September 3: Jobs 3 of 3, Activity 2 of 2 h. All goals met.",
    });
    expect(cell).toHaveAttribute("data-complete");
    expect(cell).not.toHaveAttribute("data-empty");
  });

  it("counts values above target as met and reports the real amount", () => {
    renderCalendar({ values: { "2026-09-03": { jobs: 5, activity: 2.5 } } });
    const cell = screen.getByRole("cell", {
      name: "Thursday, September 3: Jobs 5 of 3, Activity 2.5 of 2 h. All goals met.",
    });
    expect(cell).toHaveAttribute("data-complete");
  });

  it("treats days and goals without values as zero progress", () => {
    renderCalendar({ values: { "2026-09-02": { jobs: 1 } } });
    const partial = screen.getByRole("cell", {
      name: "Wednesday, September 2: Jobs 1 of 3, Activity 0 of 2 h",
    });
    expect(partial).not.toHaveAttribute("data-empty");
    const empty = screen.getByRole("cell", {
      name: "Monday, September 7: Jobs 0 of 3, Activity 0 of 2 h",
    });
    expect(empty).toHaveAttribute("data-empty");
    expect(empty).not.toHaveAttribute("data-complete");
  });

  it("treats negative and non-finite values as zero", () => {
    renderCalendar({
      values: { "2026-09-02": { jobs: -2, activity: Number.NaN } },
    });
    const cell = screen.getByRole("cell", {
      name: "Wednesday, September 2: Jobs 0 of 3, Activity 0 of 2 h",
    });
    expect(cell).toHaveAttribute("data-empty");
  });

  it("counts a goal with target 0 as met", () => {
    renderCalendar({ goals: [{ id: "rest", label: "Rest", target: 0 }] });
    const cell = screen.getByRole("cell", {
      name: "Wednesday, September 2: Rest 0 of 0. All goals met.",
    });
    expect(cell).toHaveAttribute("data-complete");
  });

  it("ignores values after today", () => {
    renderCalendar({ values: { "2026-09-25": { jobs: 3, activity: 2 } } });
    const future = screen.getByRole("cell", {
      name: "Friday, September 25, upcoming",
    });
    expect(future).not.toHaveAttribute("data-complete");
    expect(future).not.toHaveAttribute("data-empty");
  });

  it("can be today and complete at once", () => {
    renderCalendar({ values: { "2026-09-24": { jobs: 3, activity: 2 } } });
    const today = dayCell("Thursday, September 24");
    expect(today).toHaveAttribute("data-today");
    expect(today).toHaveAttribute("data-complete");
  });

  it("works with a single goal", () => {
    renderCalendar({
      goals: [GOALS[0]],
      values: { "2026-09-01": { jobs: 3, activity: 0 } },
    });
    const cell = screen.getByRole("cell", {
      name: "Tuesday, September 1: Jobs 3 of 3. All goals met.",
    });
    expect(cell).toHaveAttribute("data-complete");
  });

  it("ignores goals beyond the second and survives an empty goal list", () => {
    const three = [
      ...GOALS,
      { id: "extra", label: "Extra", target: 1 },
    ] as unknown as GcMonthCalendarProps["goals"];
    const { unmount } = renderCalendar({ goals: three });
    expect(
      screen.getByRole("cell", {
        name: "Tuesday, September 1: Jobs 0 of 3, Activity 0 of 2 h",
      }),
    ).toBeInTheDocument();
    unmount();
    renderCalendar({ goals: [] as unknown as GcMonthCalendarProps["goals"] });
    const cell = screen.getByRole("cell", { name: "Tuesday, September 1" });
    expect(cell).not.toHaveAttribute("data-complete");
    expect(cell).not.toHaveAttribute("data-empty");
  });

  it("ignores malformed date keys and unknown goal ids", () => {
    renderCalendar({
      values: { "2026-9-2": { jobs: 3 }, "2026-09-02": { other: 9 } },
    });
    expect(
      screen.getByRole("cell", {
        name: "Wednesday, September 2: Jobs 0 of 3, Activity 0 of 2 h",
      }),
    ).toBeInTheDocument();
  });

  it("formats numbers with the locale", () => {
    renderCalendar({
      locale: "de-DE",
      values: { "2026-09-01": { activity: 1.5 } },
    });
    expect(
      screen.getByRole("cell", { name: /Activity 1,5 of 2 h$/ }),
    ).toBeInTheDocument();
  });

  it("counts a float sum that rounds to the target as met", () => {
    renderCalendar({
      goals: [{ id: "activity", label: "Activity", target: 1, unit: "h" }],
      values: { "2026-09-01": { activity: 0.7 + 0.2 + 0.1 } },
    });
    const cell = screen.getByRole("cell", {
      name: "Tuesday, September 1: Activity 1 of 1 h. All goals met.",
    });
    expect(cell).toHaveAttribute("data-complete");
  });

  it("skips goal entries that are not goal objects", () => {
    renderCalendar({
      goals: [null, GOALS[0]] as unknown as GcMonthCalendarProps["goals"],
    });
    expect(
      screen.getByRole("cell", {
        name: "Tuesday, September 1: Jobs 0 of 3",
      }),
    ).toBeInTheDocument();
  });

  it("updates when values change after mount", () => {
    const { rerender } = renderCalendar({ values: {} });
    rerender(
      <GcMonthCalendar
        goals={GOALS}
        today="2026-09-24"
        locale="en-US"
        values={{ "2026-09-01": { jobs: 3, activity: 2 } }}
      />,
    );
    expect(dayCell("Tuesday, September 1")).toHaveAttribute("data-complete");
  });
});

describe("GcMonthCalendar rings", () => {
  const svg = (date: string) => dayCell(date).querySelector("svg");
  const circles = (date: string) => dayCell(date).querySelectorAll("circle");
  // Tracks have no dash array; only progress arcs do.
  const arcs = (date: string) => [
    ...dayCell(date).querySelectorAll("circle[stroke-dasharray]"),
  ];

  it("draws decorative rings hidden from assistive tech", () => {
    renderCalendar();
    expect(svg("Tuesday, September 1")).toHaveAttribute("aria-hidden", "true");
  });

  it("draws a track per goal and an arc only for goals with progress", () => {
    renderCalendar({ values: { "2026-09-01": { jobs: 2 } } });
    expect(circles("Tuesday, September 1")).toHaveLength(3);
    expect(arcs("Tuesday, September 1")).toHaveLength(1);
    expect(arcs("Monday, September 7")).toHaveLength(0);
  });

  it("draws a full arc for values above target", () => {
    renderCalendar({
      values: { "2026-09-01": { jobs: 3 }, "2026-09-02": { jobs: 6 } },
    });
    const [full] = arcs("Tuesday, September 1");
    const [over] = arcs("Wednesday, September 2");
    expect(full).toBeDefined();
    expect(over?.getAttribute("stroke-dasharray")).toBe(
      full?.getAttribute("stroke-dasharray"),
    );
  });

  it("draws empty tracks on future days whatever the values say", () => {
    renderCalendar({ values: { "2026-09-25": { jobs: 3, activity: 2 } } });
    expect(circles("Friday, September 25")).toHaveLength(2);
    expect(arcs("Friday, September 25")).toHaveLength(0);
  });

  it("draws one ring for one goal and none without goals", () => {
    const { unmount } = renderCalendar({ goals: [GOALS[0]] });
    expect(circles("Tuesday, September 1")).toHaveLength(1);
    unmount();
    renderCalendar({ goals: [] as unknown as GcMonthCalendarProps["goals"] });
    expect(svg("Tuesday, September 1")).toBeNull();
  });
});

describe("GcMonthCalendar navigation", () => {
  it("moves to the next and previous month and reports it", async () => {
    const user = userEvent.setup();
    const onMonthChange = vi.fn();
    renderCalendar({ onMonthChange });
    await user.click(screen.getByRole("button", { name: "Next month" }));
    expect(screen.getByRole("status")).toHaveTextContent("Oct 2026");
    expect(weekRows()[0]).toEqual(["", "", "", "1", "2", "3", "4"]);
    expect(onMonthChange).toHaveBeenLastCalledWith("2026-10");
    await user.click(screen.getByRole("button", { name: "Previous month" }));
    await user.click(screen.getByRole("button", { name: "Previous month" }));
    expect(screen.getByRole("status")).toHaveTextContent("Aug 2026");
    expect(onMonthChange).toHaveBeenLastCalledWith("2026-08");
    expect(onMonthChange).toHaveBeenCalledTimes(3);
  });

  it("crosses year boundaries", async () => {
    const user = userEvent.setup();
    const onMonthChange = vi.fn();
    renderCalendar({ defaultMonth: "2026-12", onMonthChange });
    await user.click(screen.getByRole("button", { name: "Next month" }));
    expect(screen.getByRole("status")).toHaveTextContent("Jan 2027");
    expect(onMonthChange).toHaveBeenLastCalledWith("2027-01");
    await user.click(screen.getByRole("button", { name: "Previous month" }));
    await user.click(screen.getByRole("button", { name: "Previous month" }));
    expect(screen.getByRole("status")).toHaveTextContent("Nov 2026");
    expect(onMonthChange).toHaveBeenLastCalledWith("2026-11");
  });

  it("keeps today marked after navigating away and back", async () => {
    const user = userEvent.setup();
    renderCalendar();
    await user.click(screen.getByRole("button", { name: "Next month" }));
    expect(document.querySelector("[aria-current]")).toBeNull();
    await user.click(screen.getByRole("button", { name: "Previous month" }));
    expect(dayCell("Thursday, September 24")).toHaveAttribute(
      "aria-current",
      "date",
    );
  });

  it("has only the two arrows as tab stops", async () => {
    const user = userEvent.setup();
    renderCalendar();
    await user.tab();
    expect(
      screen.getByRole("button", { name: "Previous month" }),
    ).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Next month" })).toHaveFocus();
    await user.tab();
    expect(document.body).toHaveFocus();
  });

  // Already true since Phase 1 (uncontrolled); pinned so a refactor can't break it.
  it("keeps the shown month when defaultMonth changes after mount", () => {
    const { rerender } = renderCalendar({ defaultMonth: "2026-09" });
    rerender(
      <GcMonthCalendar
        goals={GOALS}
        today="2026-09-24"
        locale="en-US"
        defaultMonth="2027-01"
      />,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Sep 2026");
  });
});

describe("GcMonthCalendar month bounds", () => {
  // aria-disabled, not disabled: a disabled button drops keyboard focus to <body>.
  it("turns off Previous at minMonth and Next at maxMonth", async () => {
    const user = userEvent.setup();
    const onMonthChange = vi.fn();
    renderCalendar({ minMonth: "2026-09", maxMonth: "2026-10", onMonthChange });
    const previous = screen.getByRole("button", { name: "Previous month" });
    const next = screen.getByRole("button", { name: "Next month" });
    expect(previous).toHaveAttribute("aria-disabled", "true");
    expect(next).not.toHaveAttribute("aria-disabled");
    await user.click(next);
    expect(next).toHaveAttribute("aria-disabled", "true");
    expect(next).toBeEnabled();
    expect(previous).not.toHaveAttribute("aria-disabled");
    await user.click(next);
    expect(onMonthChange).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("status")).toHaveTextContent("Oct 2026");
  });

  it("starts inside the bounds when defaultMonth is outside them", () => {
    const { unmount } = renderCalendar({
      defaultMonth: "2026-01",
      minMonth: "2026-06",
    });
    expect(screen.getByRole("status")).toHaveTextContent("Jun 2026");
    unmount();
    renderCalendar({ defaultMonth: "2027-05", maxMonth: "2026-12" });
    expect(screen.getByRole("status")).toHaveTextContent("Dec 2026");
  });

  it("ignores malformed bounds", () => {
    renderCalendar({ minMonth: "2026-9", maxMonth: "soon" });
    expect(
      screen.getByRole("button", { name: "Previous month" }),
    ).not.toHaveAttribute("aria-disabled");
    expect(
      screen.getByRole("button", { name: "Next month" }),
    ).not.toHaveAttribute("aria-disabled");
  });
});

describe("GcMonthCalendar tooltip", () => {
  // The box is aria-hidden, so it has no role; data-gc-tooltip is its documented hook.
  const tooltip = () =>
    document.querySelector<HTMLElement>("[data-gc-tooltip]");
  const rows = () =>
    within(tooltip() as HTMLElement).getAllByRole("listitem", {
      hidden: true,
    });
  const VALUES = {
    "2026-09-01": { jobs: 2, activity: 1.5 },
    "2026-09-02": { jobs: 3, activity: 1 },
  };

  it("shows the date and each goal's progress while the mouse is over a day", async () => {
    const user = userEvent.setup();
    renderCalendar({ values: VALUES });
    expect(tooltip()).toBeNull();
    await user.hover(dayCell("Tuesday, September 1"));
    expect(tooltip()).toHaveAttribute("aria-hidden", "true");
    expect(tooltip()).toHaveTextContent("Tuesday, September 1");
    expect(rows()).toHaveLength(2);
    expect(rows()[0]).toHaveTextContent("Jobs2 / 3");
    expect(rows()[1]).toHaveTextContent("Activity1.5 / 2 h");
    expect(tooltip()).not.toHaveTextContent("✓");
  });

  it("ticks goals that reached their target", async () => {
    const user = userEvent.setup();
    renderCalendar({ values: VALUES });
    await user.hover(dayCell("Wednesday, September 2"));
    expect(rows()[0]).toHaveTextContent("✓");
    expect(rows()[1]).not.toHaveTextContent("✓");
  });

  it("marks the hovered day, follows the mouse and hides when it leaves", async () => {
    const user = userEvent.setup();
    renderCalendar({ values: VALUES });
    await user.hover(dayCell("Tuesday, September 1"));
    expect(dayCell("Tuesday, September 1")).toHaveAttribute("data-hovered");
    await user.hover(dayCell("Wednesday, September 2"));
    expect(document.querySelectorAll("[data-gc-tooltip]")).toHaveLength(1);
    expect(tooltip()).toHaveTextContent("Wednesday, September 2");
    expect(dayCell("Tuesday, September 1")).not.toHaveAttribute("data-hovered");
    expect(dayCell("Wednesday, September 2")).toHaveAttribute("data-hovered");
    await user.unhover(dayCell("Wednesday, September 2"));
    expect(tooltip()).toBeNull();
    expect(dayCell("Wednesday, September 2")).not.toHaveAttribute(
      "data-hovered",
    );
  });

  it("shows today but not future days or padding cells", async () => {
    const user = userEvent.setup();
    renderCalendar({ values: { "2026-09-25": { jobs: 3 } } });
    await user.hover(dayCell("Thursday, September 24"));
    expect(tooltip()).toHaveTextContent("Thursday, September 24");
    await user.hover(dayCell("Friday, September 25"));
    expect(tooltip()).toBeNull();
    expect(dayCell("Friday, September 25")).not.toHaveAttribute("data-hovered");
    const [, firstWeek] = screen.getAllByRole("row");
    const [padding] = within(firstWeek as HTMLElement).getAllByRole("cell");
    await user.hover(padding as HTMLElement);
    expect(tooltip()).toBeNull();
  });

  it("shows nothing without goals", async () => {
    const user = userEvent.setup();
    renderCalendar({ goals: [] as unknown as GcMonthCalendarProps["goals"] });
    await user.hover(dayCell("Tuesday, September 1"));
    expect(tooltip()).toBeNull();
  });

  it("ignores touch pointers", async () => {
    const user = userEvent.setup();
    renderCalendar({ values: VALUES });
    await user.pointer({
      keys: "[TouchA>]",
      target: dayCell("Tuesday, September 1"),
    });
    expect(tooltip()).toBeNull();
  });

  it("hides on Escape while the mouse stays on the day", async () => {
    const user = userEvent.setup();
    renderCalendar({ values: VALUES });
    await user.hover(dayCell("Tuesday, September 1"));
    await user.keyboard("{Escape}");
    expect(tooltip()).toBeNull();
    expect(dayCell("Tuesday, September 1")).not.toHaveAttribute("data-hovered");
  });

  it("closes when the month changes under the mouse", async () => {
    const user = userEvent.setup();
    renderCalendar({ values: VALUES });
    await user.hover(dayCell("Tuesday, September 1"));
    screen.getByRole("button", { name: "Next month" }).focus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("status")).toHaveTextContent("Oct 2026");
    expect(tooltip()).toBeNull();
  });

  it("updates the open tooltip when values change", async () => {
    const user = userEvent.setup();
    const { rerender } = renderCalendar({
      values: { "2026-09-01": { jobs: 1 } },
    });
    await user.hover(dayCell("Tuesday, September 1"));
    expect(rows()[0]).toHaveTextContent("Jobs1 / 3");
    rerender(
      <GcMonthCalendar
        goals={GOALS}
        values={{ "2026-09-01": { jobs: 3 } }}
        today="2026-09-24"
        locale="en-US"
      />,
    );
    expect(rows()[0]).toHaveTextContent("Jobs3 / 3✓");
  });

  it("shows renderTooltip's content and passes it the day's data", async () => {
    const user = userEvent.setup();
    const renderTooltip = vi.fn((day: GcDayInfo) => `Tip for ${day.date}`);
    renderCalendar({ values: VALUES, renderTooltip });
    await user.hover(dayCell("Tuesday, September 1"));
    expect(tooltip()).toHaveTextContent(/^Tip for 2026-09-01$/);
    expect(tooltip()).toHaveAttribute("aria-hidden", "true");
    expect(dayCell("Tuesday, September 1")).toHaveAttribute("data-hovered");
    expect(renderTooltip).toHaveBeenLastCalledWith({
      date: "2026-09-01",
      today: false,
      future: false,
      complete: false,
      goals: [
        { goal: GOALS[0], done: 2, target: 3, fraction: 2 / 3 },
        { goal: GOALS[1], done: 1.5, target: 2, fraction: 0.75 },
      ],
    });
  });

  it("passes today and future days with their real values", async () => {
    const user = userEvent.setup();
    const renderTooltip = vi.fn((day: GcDayInfo) => `Tip for ${day.date}`);
    renderCalendar({
      values: {
        "2026-09-24": { jobs: 3, activity: 2 },
        "2026-09-25": { jobs: 3 },
      },
      renderTooltip,
    });
    await user.hover(dayCell("Thursday, September 24"));
    expect(renderTooltip).toHaveBeenLastCalledWith(
      expect.objectContaining({ today: true, future: false, complete: true }),
    );
    await user.hover(dayCell("Friday, September 25"));
    expect(renderTooltip).toHaveBeenLastCalledWith({
      date: "2026-09-25",
      today: false,
      future: true,
      complete: false,
      goals: [
        { goal: GOALS[0], done: 3, target: 3, fraction: 1 },
        { goal: GOALS[1], done: 0, target: 2, fraction: 0 },
      ],
    });
    expect(tooltip()).toHaveTextContent("Tip for 2026-09-25");
  });

  it("shows nothing on days where renderTooltip returns nothing", async () => {
    const user = userEvent.setup();
    const empty: Record<string, ReactNode> = {
      "2026-09-01": null,
      "2026-09-02": false,
      "2026-09-03": undefined,
      "2026-09-04": "",
      "2026-09-05": true,
      "2026-09-06": [],
    };
    renderCalendar({
      values: VALUES,
      renderTooltip: (day) => empty[day.date],
    });
    for (const name of [
      "Tuesday, September 1",
      "Wednesday, September 2",
      "Thursday, September 3",
      "Friday, September 4",
      "Saturday, September 5",
      "Sunday, September 6",
    ]) {
      await user.hover(dayCell(name));
      expect(tooltip()).toBeNull();
      expect(dayCell(name)).not.toHaveAttribute("data-hovered");
    }
  });

  it("turns tooltips off with renderTooltip={null}", async () => {
    const user = userEvent.setup();
    renderCalendar({ values: VALUES, renderTooltip: null });
    await user.hover(dayCell("Tuesday, September 1"));
    expect(tooltip()).toBeNull();
    expect(dayCell("Tuesday, September 1")).not.toHaveAttribute("data-hovered");
  });
});
