import { createRef, type Ref } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { GcMonthSummary, type GcGoal, type GcMonthSummaryProps } from "../src";

const JOBS: GcGoal = { id: "jobs", label: "Jobs", target: 3 };
const RINGS: GcGoal[] = [
  JOBS,
  { id: "activity", label: "Activity", target: 2, unit: "h" },
];

const SEPT: NonNullable<GcMonthSummaryProps["data"]>[string] = {
  rings: { jobs: 0.78, activity: 0.61 },
  stats: [
    { label: "Current streak", value: "8 days", tone: "primary" },
    { label: "Best streak", value: "8 days", tone: "warning" },
    { label: "Both goals met", value: "10 days", tone: "success" },
    { label: "Nothing logged", value: "1 day", tone: "danger" },
  ],
};

function renderSummary(
  props: Partial<GcMonthSummaryProps> & { ref?: Ref<HTMLDivElement> } = {},
) {
  return render(
    <GcMonthSummary
      rings={RINGS}
      data={{ "2026-09": SEPT }}
      today="2026-09-24"
      locale="en-US"
      {...props}
    />,
  );
}

describe("GcMonthSummary month navigation", () => {
  it("shows the month of today with the locale's short title", () => {
    renderSummary({ today: "2027-02-10" });
    expect(screen.getByText("Feb 2027")).toBeInTheDocument();
  });

  it("formats the title with the locale", () => {
    renderSummary({ defaultMonth: "2026-09", locale: "en-GB" });
    expect(screen.getByText("Sept 2026")).toBeInTheDocument();
  });

  it("moves between months and reports each change", async () => {
    const user = userEvent.setup();
    const onMonthChange = vi.fn();
    renderSummary({ onMonthChange });
    await user.click(screen.getByRole("button", { name: "Next month" }));
    expect(screen.getByText("Oct 2026")).toBeInTheDocument();
    expect(onMonthChange).toHaveBeenLastCalledWith("2026-10");
    await user.click(screen.getByRole("button", { name: "Previous month" }));
    await user.click(screen.getByRole("button", { name: "Previous month" }));
    expect(onMonthChange).toHaveBeenLastCalledWith("2026-08");
  });

  it("follows a controlled month", () => {
    const { rerender } = renderSummary({ month: "2026-09" });
    expect(screen.getByText("Sep 2026")).toBeInTheDocument();
    rerender(
      <GcMonthSummary
        rings={RINGS}
        today="2026-09-24"
        locale="en-US"
        month="2026-11"
      />,
    );
    expect(screen.getByText("Nov 2026")).toBeInTheDocument();
  });

  it("clamps a controlled month into the bounds and disables the arrow there", () => {
    renderSummary({
      month: "2027-03",
      minMonth: "2026-01",
      maxMonth: "2026-12",
    });
    expect(screen.getByText("Dec 2026")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next month" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    expect(
      screen.getByRole("button", { name: "Previous month" }),
    ).not.toHaveAttribute("aria-disabled");
  });

  it("uses translated button names", () => {
    renderSummary({
      labels: {
        previousMonth: "Vorheriger Monat",
        nextMonth: "Nächster Monat",
      },
    });
    expect(
      screen.getByRole("button", { name: "Vorheriger Monat" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Nächster Monat" }),
    ).toBeInTheDocument();
  });

  it("does not make the visible title a live region", () => {
    renderSummary();
    expect(screen.getByText("Sep 2026")).not.toHaveAttribute("role");
  });
});

describe("GcMonthSummary data lookup", () => {
  it("marks only a month without an entry as empty", async () => {
    const user = userEvent.setup();
    const { container } = renderSummary();
    expect(container.firstElementChild).not.toHaveAttribute("data-empty");
    await user.click(screen.getByRole("button", { name: "Next month" }));
    expect(container.firstElementChild).toHaveAttribute("data-empty");
  });

  it("shows a legend entry per ring, hidden from assistive tech", () => {
    renderSummary();
    expect(
      screen.getByText("Jobs").closest("[aria-hidden='true']"),
    ).not.toBeNull();
    expect(screen.getByText("Activity")).toBeInTheDocument();
  });
});

describe("GcMonthSummary root element", () => {
  it("forwards the ref, merges className and passes native props", () => {
    const ref = createRef<HTMLDivElement>();
    renderSummary({
      ref,
      className: "custom",
      id: "summary",
      "aria-label": "September goals",
    });
    const root = document.getElementById("summary");
    expect(ref.current).toBe(root);
    expect(root).toHaveClass("custom");
    expect(root).toHaveAttribute("aria-label", "September goals");
  });
});
