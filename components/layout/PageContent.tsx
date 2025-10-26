import { ReactNode } from "react";

interface PageContentProps {
  children: ReactNode;
}

/**
 * Main content area wrapper with consistent spacing and background.
 *
 * @example
 * ```tsx
 * <PageContent>
 *   <Card>...</Card>
 *   <DataTable />
 * </PageContent>
 * ```
 */
export function PageContent({ children }: PageContentProps) {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-muted overflow-hidden">{children}</div>
  );
}
