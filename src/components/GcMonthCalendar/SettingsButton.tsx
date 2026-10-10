import { cn } from "../../lib/cn";
import { ICON_BUTTON } from "../../lib/iconButton";

// Drawn inline so the package needs no icon library.
export function SettingsButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      // Called without the event, as the `() => void` type promises.
      onClick={() => onClick()}
      className={cn("gcx:size-7", ICON_BUTTON)}
    >
      <svg
        viewBox="0 0 16 16"
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        className="gcx:size-4"
      >
        <path d="M6.51 2.81 6.87 0.89 9.13 0.89 9.49 2.81 10.62 3.28 12.23 2.18 13.82 3.77 12.72 5.38 13.19 6.51 15.11 6.87 15.11 9.13 13.19 9.49 12.72 10.62 13.82 12.23 12.23 13.82 10.62 12.72 9.49 13.19 9.13 15.11 6.87 15.11 6.51 13.19 5.38 12.72 3.77 13.82 2.18 12.23 3.28 10.62 2.81 9.49 0.89 9.13 0.89 6.87 2.81 6.51 3.28 5.38 2.18 3.77 3.77 2.18 5.38 3.28Z" />
        <circle cx="8" cy="8" r="2.25" />
      </svg>
    </button>
  );
}
