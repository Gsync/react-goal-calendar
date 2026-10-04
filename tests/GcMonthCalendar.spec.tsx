import { createRef, type Ref } from "react";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GcMonthCalendar, type GcMonthCalendarProps } from "../src";

function renderCalendar(
  props: Partial<GcMonthCalendarProps> & { ref?: Ref<HTMLDivElement> } = {},
) {
  return render(
    <GcMonthCalendar today="2026-09-24" locale="en-US" {...props} />,
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
