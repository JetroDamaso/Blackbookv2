import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  actions?: ReactNode;
}

/**
 * Standard page header component following the design system.
 * Includes SidebarTrigger for mobile, icon, title, and optional action buttons.
 *
 * @example
 * ```tsx
 * <PageHeader
 *   icon={FileText}
 *   title="Reports"
 *   actions={<Button variant="outline">Export</Button>}
 * />
 * ```
 */
export function PageHeader({ icon: Icon, title, actions }: PageHeaderProps) {
  return (
    <header className="bg-white mb-4 border-b-1 overflow-hidden flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4 w-full">
        <SidebarTrigger className="-ml-1 block md:hidden" />
        <p className="font-semibold text-lg flex items-center gap-2 grow">
          <Icon size={18} /> <span>{title}</span>
        </p>
        {actions}
      </div>
    </header>
  );
}
