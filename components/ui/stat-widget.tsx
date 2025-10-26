import { ReactNode } from "react";

interface StatWidgetProps {
  label: string;
  value: string | number;
  description?: ReactNode;
  minWidth?: string;
}

/**
 * Stat widget for displaying metrics and statistics.
 *
 * @example
 * ```tsx
 * <StatWidget
 *   label="Total Bookings"
 *   value={1234}
 *   description={<>Active <span className="text-primary">bookings</span></>}
 * />
 * ```
 */
export function StatWidget({
  label,
  value,
  description,
  minWidth = "min-w-[200px]",
}: StatWidgetProps) {
  return (
    <div
      className={`flex rounded-md p-4 bg-white border-1 items-center gap-2 ${minWidth} flex-shrink-0`}
    >
      <div className="flex flex-col">
        <p className="text-md">{label}</p>
        <p className="text-4xl font-semibold">{value}</p>
        {description && <p className="text-xs">{description}</p>}
      </div>
    </div>
  );
}
