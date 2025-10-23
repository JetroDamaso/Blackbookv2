"use client";

import { type LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";

import { Collapsible, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const pathname = usePathname();

  // Function to determine if a navigation item is currently active
  const isItemActive = (itemUrl: string) => {
    // Handle exact match for root manage path
    if (itemUrl === "/manage" && pathname === "/manage") {
      return true;
    }

    // Handle exact match for other paths
    if (pathname === itemUrl) {
      return true;
    }

    // Handle sub-paths (e.g., /manage/clients should activate the clients nav item)
    if (itemUrl !== "/manage" && pathname.startsWith(itemUrl)) {
      return true;
    }

    return false;
  };

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map(item => {
          const isActive = isItemActive(item.url);

          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <Link href={item.url}>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title} isActive={isActive}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                </Link>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
