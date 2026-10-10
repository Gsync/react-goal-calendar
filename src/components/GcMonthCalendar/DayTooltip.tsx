import { TooltipRows } from "../../lib/Tooltip";
import type { GcDayInfo } from "./types";

export function DefaultTooltip({
  day,
  dateText,
  number,
}: {
  day: GcDayInfo;
  dateText: string;
  number: Intl.NumberFormat;
}) {
  return (
    <TooltipRows
      title={dateText}
      rows={day.goals.map(({ goal, done, target, fraction }) => ({
        label: goal.label,
        text: `${number.format(done)} / ${number.format(target)}${goal.unit ? ` ${goal.unit}` : ""}`,
        met: fraction >= 1,
      }))}
    />
  );
}
