import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { GcMonthCalendar, type GcGoal } from "../src";

const GOALS: [GcGoal, GcGoal] = [
  { id: "calls", label: "Calls", target: 20 },
  { id: "emails", label: "Emails", target: 10 },
];

// Unprefixed classes generate no CSS (prefix(gcx)) and would clash with the host app's Tailwind.
function unprefixed(root: Element): string[] {
  const tokens = [root, ...root.querySelectorAll("*")].flatMap((el) =>
    Array.from(el.classList),
  );
  return [...new Set(tokens.filter((token) => !token.startsWith("gcx:")))];
}

describe("CSS isolation", () => {
  it("renders only gcx:-prefixed classes, tooltip included", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <GcMonthCalendar
        goals={GOALS}
        values={{ "2026-09-01": { calls: 20, emails: 3 } }}
        today="2026-09-24"
        locale="en-US"
      />,
    );
    await user.hover(
      screen.getByRole("cell", { name: /^Tuesday, September 1:/ }),
    );
    expect(document.querySelector("[data-gc-tooltip]")).not.toBeNull();
    expect(unprefixed(container)).toEqual([]);
  });
});
