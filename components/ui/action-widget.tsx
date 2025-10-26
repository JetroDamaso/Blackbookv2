import { LucideIcon } from "lucide-react";

interface ActionWidgetProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  iconColor?: string;
}

/**
 * Action widget for clickable actions and navigation.
 *
 * @example
 * ```tsx
 * <ActionWidget
 *   icon={Notebook}
 *   label="View Reports"
 *   onClick={() => router.push('/reports')}
 *   iconColor="text-blue-600"
 * />
 * ```
 */
export function ActionWidget({
  icon: Icon,
  label,
  onClick,
  iconColor = "text-blue-600",
}: ActionWidgetProps) {
  return (
    <div
      className="flex flex-col rounded-md p-4 bg-white border-1 items-center gap-2 justify-center cursor-pointer hover:bg-gray-50 transition-colors min-w-[120px] flex-shrink-0"
      onClick={onClick}
    >
      <Icon className={`size-9 ${iconColor}`} />
      <p className="text-sm select-none">{label}</p>
    </div>
  );
}
