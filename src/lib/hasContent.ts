import type { ReactNode } from "react";

// These render nothing, so they mean "no tooltip" rather than an empty box.
export function hasContent(node: ReactNode): boolean {
  if (Array.isArray(node)) return node.some(hasContent);
  return (
    node !== null &&
    node !== undefined &&
    typeof node !== "boolean" &&
    node !== ""
  );
}
