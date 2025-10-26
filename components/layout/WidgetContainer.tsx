import { ReactNode } from "react";

interface WidgetContainerProps {
  children: ReactNode;
}

/**
 * Container for widgets displayed below the page header.
 * Provides horizontal scrolling and consistent spacing.
 *
 * @example
 * ```tsx
 * <WidgetContainer>
 *   <StatWidget label="Total Items" value={123} />
 *   <ActionWidget icon={Notebook} label="Reports" onClick={...} />
 * </WidgetContainer>
 * ```
 */
export function WidgetContainer({ children }: WidgetContainerProps) {
  return <div className="bg-muted flex flex-wrap gap-2 px-4 pb-2 overflow-x-auto">{children}</div>;
}
