import type { ComponentPropsWithoutRef } from "react";

interface GcCardOwnProps {
  /** Classes merged last onto the root element. */
  className?: string;
}

// An interface, not an intersection alias, so the emitted .d.ts names it instead of expanding it.
export interface GcCardProps
  extends GcCardOwnProps,
    Omit<ComponentPropsWithoutRef<"div">, keyof GcCardOwnProps> {}
