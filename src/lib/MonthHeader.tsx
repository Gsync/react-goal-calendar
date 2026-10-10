import type { ReactNode } from "react";

const NAV_BUTTON =
  "gcx:inline-flex gcx:size-8 gcx:cursor-pointer gcx:items-center gcx:justify-center gcx:rounded-md gcx:border-0 gcx:bg-transparent gcx:p-0 gcx:text-gc-muted-fg gcx:hover:bg-gc-muted gcx:hover:text-gc-fg gcx:focus-visible:outline-2 gcx:focus-visible:outline-offset-2 gcx:focus-visible:outline-gc-primary gcx:aria-disabled:cursor-not-allowed gcx:aria-disabled:opacity-40 gcx:aria-disabled:hover:bg-transparent gcx:aria-disabled:hover:text-gc-muted-fg";

// Mirrored under dir="rtl" so "previous" still points toward the start.
function Chevron({ d }: { d: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className="gcx:size-4 gcx:rtl:-scale-x-100"
    >
      <path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface MonthHeaderProps {
  title: ReactNode;
  titleId?: string;
  canGoBack: boolean;
  canGoForward: boolean;
  onPrevious: () => void;
  onNext: () => void;
  labels?: { previousMonth?: string; nextMonth?: string };
}

export function MonthHeader({
  title,
  titleId,
  canGoBack,
  canGoForward,
  onPrevious,
  onNext,
  labels,
}: MonthHeaderProps) {
  return (
    <div className="gcx:flex gcx:items-center gcx:justify-between gcx:gap-2">
      <div id={titleId} className="gcx:text-lg gcx:font-semibold">
        {title}
      </div>
      <div className="gcx:flex gcx:gap-1">
        <button
          type="button"
          aria-label={labels?.previousMonth || "Previous month"}
          aria-disabled={!canGoBack || undefined}
          onClick={onPrevious}
          className={NAV_BUTTON}
        >
          <Chevron d="M10 3 5 8l5 5" />
        </button>
        <button
          type="button"
          aria-label={labels?.nextMonth || "Next month"}
          aria-disabled={!canGoForward || undefined}
          onClick={onNext}
          className={NAV_BUTTON}
        >
          <Chevron d="m6 3 5 5-5 5" />
        </button>
      </div>
    </div>
  );
}
