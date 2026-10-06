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

describe("GcMonthSummary donut", () => {
  it("announces the month and each ring's share", () => {
    renderSummary();
    expect(screen.getByRole("status")).toHaveTextContent(
      "September 2026. Goal hit: Jobs 78%, Activity 61%",
    );
  });

  it("shows the centre label and both percentages, hidden from assistive tech", () => {
    const { container } = renderSummary();
    expect(
      screen.getByText("78%").closest("[aria-hidden='true']"),
    ).not.toBeNull();
    expect(screen.getByText("61%")).toBeInTheDocument();
    expect(screen.getByText("Goal hit")).toBeInTheDocument();
    expect(
      container.querySelector("svg circle")?.closest("[aria-hidden='true']"),
    ).not.toBeNull();
  });

  it("never claims 100% or 0% before the ring is full or empty", () => {
    renderSummary({
      data: { "2026-09": { rings: { jobs: 0.996, activity: 0.003 } } },
    });
    expect(screen.getByRole("status")).toHaveTextContent(
      "Jobs 99%, Activity 1%",
    );
  });

  it("shows exactly 100% and 0% at the ends", () => {
    renderSummary({ data: { "2026-09": { rings: { jobs: 1, activity: 0 } } } });
    expect(screen.getByRole("status")).toHaveTextContent(
      "Jobs 100%, Activity 0%",
    );
  });

  it("shows dashes and no data for a month without an entry", async () => {
    const user = userEvent.setup();
    const { container } = renderSummary();
    await user.click(screen.getByRole("button", { name: "Next month" }));
    expect(screen.getByRole("status")).toHaveTextContent(
      "October 2026. Goal hit: no data",
    );
    expect(screen.getAllByText("—")).toHaveLength(2);
    expect(screen.queryByText("78%")).toBeNull();
    expect(container.firstElementChild).toHaveAttribute("data-empty");
    // The legend stays, so the layout doesn't jump.
    expect(screen.getByText("Jobs")).toBeInTheDocument();
  });

  it("marks only the missing ring when the month has data", () => {
    const { container } = renderSummary({
      data: { "2026-09": { rings: { jobs: 0.5 } } },
    });
    expect(screen.getByRole("status")).toHaveTextContent(
      "Jobs 50%, Activity no data",
    );
    expect(screen.getAllByText("—")).toHaveLength(1);
    expect(container.firstElementChild).not.toHaveAttribute("data-empty");
  });

  it("treats NaN and non-numbers as no value", () => {
    renderSummary({
      data: {
        "2026-09": { rings: { jobs: Number.NaN, activity: "0.5" as never } },
      },
    });
    expect(screen.getByRole("status")).toHaveTextContent("Goal hit: no data");
  });

  it("draws one ring and one percentage for a single ring", () => {
    renderSummary({ rings: [JOBS] });
    expect(screen.getByRole("status")).toHaveTextContent(
      "September 2026. Goal hit: Jobs 78%",
    );
    expect(screen.queryByText("61%")).toBeNull();
  });

  it("draws no donut without rings", () => {
    const { container } = renderSummary({ rings: [] });
    expect(container.querySelector("svg circle")).toBeNull();
    expect(screen.getByRole("status")).toHaveTextContent(/^September 2026$/);
  });

  it("translates the text and formats percentages for the locale", () => {
    renderSummary({
      locale: "de-DE",
      labels: { goalHit: "Ziel erreicht", noData: "keine Daten" },
      data: { "2026-09": { rings: { jobs: 0.78 } } },
    });
    expect(screen.getByRole("status")).toHaveTextContent(
      /^September 2026\. Ziel erreicht: Jobs 78\s%, Activity keine Daten$/,
    );
  });

  it("announces the new month's numbers after navigating", async () => {
    const user = userEvent.setup();
    renderSummary({
      data: {
        "2026-09": SEPT,
        "2026-10": { rings: { jobs: 0.25, activity: 0.5 } },
      },
    });
    await user.click(screen.getByRole("button", { name: "Next month" }));
    expect(screen.getByRole("status")).toHaveTextContent(
      "October 2026. Goal hit: Jobs 25%, Activity 50%",
    );
  });
});
