import { createRef, type Ref } from "react";
import { render, screen, within } from "@testing-library/react";
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

  it("hides the legend when legend is false, keeping the donut", () => {
    renderSummary({ legend: false });
    expect(screen.queryByText("Jobs")).toBeNull();
    expect(screen.getByText("78%")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Jobs 78%, Activity 61%",
    );
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
  // jsdom computes no layout, so pin the classes that keep the text inside the 69px hole: the
  // percent lines set their own line height (--tw-leading doesn't inherit), the label is capped.
  it("sizes the centre text to fit inside the inner ring", () => {
    renderSummary();
    expect(screen.getByText("78%")).toHaveClass("gcx:text-lg/tight");
    expect(screen.getByText("61%")).toHaveClass("gcx:text-lg/tight");
    expect(screen.getByText("Goal hit")).toHaveClass(
      "gcx:max-w-[44px]",
      "gcx:truncate",
    );
  });

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

describe("GcMonthSummary stat rows", () => {
  it("lists each row's label and value in order", () => {
    renderSummary();
    expect(screen.getAllByRole("term").map((el) => el.textContent)).toEqual([
      "Current streak",
      "Best streak",
      "Both goals met",
      "Nothing logged",
    ]);
    expect(
      screen.getAllByRole("definition").map((el) => el.textContent),
    ).toEqual(["8 days", "8 days", "10 days", "1 day"]);
  });

  it("renders no list for a month without rows or without an entry", async () => {
    const user = userEvent.setup();
    renderSummary({ data: { "2026-09": { rings: { jobs: 1 } } } });
    expect(screen.queryByRole("term")).toBeNull();
    await user.click(screen.getByRole("button", { name: "Next month" }));
    expect(screen.queryByRole("term")).toBeNull();
  });

  it("accepts React content and falls back to a muted dot for an unknown tone", () => {
    renderSummary({
      data: {
        "2026-09": {
          stats: [
            {
              label: <em>Streak</em>,
              value: <strong>3</strong>,
              tone: "pink" as never,
            },
          ],
        },
      },
    });
    expect(screen.getByRole("term")).toHaveTextContent("Streak");
    expect(screen.getByRole("definition")).toHaveTextContent("3");
  });

  it("shows rows even without rings", () => {
    renderSummary({ rings: [] });
    expect(screen.getAllByRole("term")).toHaveLength(4);
  });

  // No preflight: the host app may not reset <dl>/<dd> margins (dd indents 40px by default).
  it("resets native list margins itself", () => {
    renderSummary();
    expect(screen.getAllByRole("definition")[0]).toHaveClass("gcx:m-0");
    expect(screen.getAllByRole("term")[0]).toHaveClass("gcx:m-0");
    expect(screen.getAllByRole("term")[0]?.closest("dl")).toHaveClass(
      "gcx:m-0",
    );
  });
});

describe("GcMonthSummary development warnings", () => {
  function warnings(): string[] {
    return vi.mocked(console.warn).mock.calls.map((call) => String(call[0]));
  }

  it("warns when a ring value looks like a percent, naming it", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    renderSummary({ data: { "2026-09": { rings: { jobs: 78 } } } });
    expect(warnings()).toContainEqual(
      expect.stringContaining('`data["2026-09"].rings.jobs` is 78'),
    );
    expect(screen.getByRole("status")).toHaveTextContent("Jobs 100%");
    vi.restoreAllMocks();
  });

  it("warns about a data key that is not a month", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    renderSummary({ data: { "2026-9": SEPT } });
    expect(warnings()).toContainEqual(
      expect.stringContaining('`data` key "2026-9"'),
    );
    vi.restoreAllMocks();
  });

  it("warns about more than two rings and draws two", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    renderSummary({ rings: [...RINGS, { id: "calls", label: "Calls" }] });
    expect(warnings()).toContainEqual(
      expect.stringContaining("`rings` has 3 entries"),
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "Jobs 78%, Activity 61%",
    );
    vi.restoreAllMocks();
  });

  it("shares the month prop warnings with the calendar", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    renderSummary({ minMonth: "2026-13" });
    expect(warnings()).toContainEqual(
      expect.stringContaining(
        "GcMonthSummary: `minMonth` must be a YYYY-MM month",
      ),
    );
    vi.restoreAllMocks();
  });

  it("stays silent in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    renderSummary({ data: { "2026-09": { rings: { jobs: 61 } } } });
    expect(spy).not.toHaveBeenCalled();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });
});

describe("GcMonthSummary tooltip", () => {
  // The box is aria-hidden, so it has no role; data-gc-tooltip is its documented hook.
  const tooltip = () =>
    document.querySelector<HTMLElement>("[data-gc-tooltip]");
  const rows = () =>
    within(tooltip() as HTMLElement).getAllByRole("listitem", {
      hidden: true,
    });
  // The donut is aria-hidden too; its centre label is inside it.
  const donut = () => screen.getByText("Goal hit");

  it("shows Goal hit, the month and each ring's percentage while the mouse is over the donut", async () => {
    const user = userEvent.setup();
    renderSummary({ data: { "2026-09": { rings: { jobs: 1, activity: 0.61 } } } });
    expect(tooltip()).toBeNull();
    await user.hover(donut());
    expect(tooltip()).toHaveAttribute("aria-hidden", "true");
    expect(tooltip()).toHaveTextContent("Goal hit (Sep 2026)");
    expect(rows()).toHaveLength(2);
    expect(rows()[0]).toHaveTextContent("Jobs100%✓");
    expect(rows()[1]).toHaveTextContent("Activity61%");
    expect(rows()[1]).not.toHaveTextContent("✓");
    await user.unhover(donut());
    expect(tooltip()).toBeNull();
  });

  it("shows a dash for a ring without a value, and nothing for a month without any", async () => {
    const user = userEvent.setup();
    const { rerender } = renderSummary({
      data: { "2026-09": { rings: { jobs: 0.5 } } },
    });
    await user.hover(donut());
    expect(rows()[1]).toHaveTextContent("Activity—");
    rerender(
      <GcMonthSummary rings={RINGS} data={{}} today="2026-09-24" locale="en-US" />,
    );
    expect(tooltip()).toBeNull();
  });

  it("opens on tap, and closes on a second tap or Escape", async () => {
    const user = userEvent.setup();
    renderSummary();
    await user.pointer({ keys: "[TouchA]", target: donut() });
    expect(tooltip()).toHaveTextContent("Goal hit (Sep 2026)");
    await user.pointer({ keys: "[TouchA]", target: donut() });
    expect(tooltip()).toBeNull();
    await user.pointer({ keys: "[TouchA]", target: donut() });
    await user.keyboard("{Escape}");
    expect(tooltip()).toBeNull();
  });

  it("renders custom content from renderTooltip, and none when it is null", async () => {
    const user = userEvent.setup();
    const renderTooltip = vi.fn(() => "Custom");
    const { rerender } = renderSummary({ renderTooltip });
    await user.hover(donut());
    expect(tooltip()).toHaveTextContent("Custom");
    expect(renderTooltip).toHaveBeenLastCalledWith({
      month: "2026-09",
      rings: [
        { ring: RINGS[0], value: 0.78 },
        { ring: RINGS[1], value: 0.61 },
      ],
    });
    rerender(
      <GcMonthSummary
        rings={RINGS}
        data={{ "2026-09": SEPT }}
        today="2026-09-24"
        renderTooltip={null}
      />,
    );
    expect(tooltip()).toBeNull();
  });

  it("closes when the rings go away, and stays closed when they return", async () => {
    const user = userEvent.setup();
    const props = {
      data: { "2026-09": SEPT },
      today: "2026-09-24",
      renderTooltip: () => "Custom",
    };
    const { rerender } = render(<GcMonthSummary rings={RINGS} {...props} />);
    await user.hover(donut());
    expect(tooltip()).not.toBeNull();
    rerender(<GcMonthSummary rings={[]} {...props} />);
    expect(tooltip()).toBeNull();
    rerender(<GcMonthSummary rings={RINGS} {...props} />);
    expect(tooltip()).toBeNull();
  });
});
