import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GcCard } from "../src";

describe("GcCard", () => {
  it("renders its children", () => {
    render(
      <GcCard>
        <p>Inside</p>
      </GcCard>,
    );
    expect(screen.getByText("Inside")).toBeInTheDocument();
  });

  it("forwards the ref, merges className and passes native props to the root", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <GcCard ref={ref} className="custom" id="card" role="region" aria-label="Goals" />,
    );
    const root = screen.getByRole("region", { name: "Goals" });
    expect(ref.current).toBe(root);
    expect(root).toHaveClass("custom");
    expect(root).toHaveAttribute("id", "card");
  });

  it("adds no role of its own", () => {
    render(<GcCard data-testid="card" />);
    const root = screen.getByTestId("card");
    expect(root.tagName).toBe("DIV");
    expect(root).not.toHaveAttribute("role");
  });
});
