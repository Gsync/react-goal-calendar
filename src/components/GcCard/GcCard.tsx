import { forwardRef } from "react";
import { cn } from "../../lib/cn";
import type { GcCardProps } from "./types";

const ROOT =
  "gcx:box-border gcx:rounded-xl gcx:border gcx:border-gc-border gcx:bg-gc-card gcx:p-4 gcx:text-gc-fg";

/** The card frame (border, radius, background, padding) to wrap any component in. */
export const GcCard = forwardRef<HTMLDivElement, GcCardProps>(function GcCard(
  { className, ...rest },
  ref,
) {
  return <div {...rest} ref={ref} className={cn(ROOT, className)} />;
});

GcCard.displayName = "GcCard";
