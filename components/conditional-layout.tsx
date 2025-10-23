"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

interface ConditionalLayoutProps {
  children: ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const { status } = useSession();
  const pathname = usePathname();

  // Don't show sidebar on login page or when not authenticated
  const shouldShowSidebar = status === "authenticated" && pathname !== "/login";

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (shouldShowSidebar) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-1 flex-col bg-muted">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  // No sidebar layout (for login page and unauthenticated users)
  return <div className="min-h-screen">{children}</div>;
}
