// @vitest-environment node
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { GcCard, GcMonthCalendar } from "../src";

// No DOM here: any window/document access during render throws.
describe("server rendering", () => {
  it("renders GcMonthCalendar without browser globals", () => {
    expect(typeof window).toBe("undefined");
    const html = renderToString(
      <GcCard>
        <GcMonthCalendar
          goals={[{ id: "jobs", label: "Jobs", target: 3 }]}
          values={{ "2026-09-01": { jobs: 3 } }}
          today="2026-09-24"
          locale="en-US"
        />
      </GcCard>,
    );
    expect(html).toContain("Sep 2026");
    expect(html).toContain('aria-current="date"');
    expect(html).toContain("Tuesday, September 1: Jobs 3 of 3. All goals met.");
    expect(html).not.toContain("data-gc-tooltip");
    expect(html).toContain("gcx:bg-gc-card");
  });
});
