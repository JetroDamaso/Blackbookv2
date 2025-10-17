"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";

import { SearchForm } from "@/components/search-form";
import { VersionSwitcher } from "@/components/version-switcher";
import {
  Book,
  Users,
  CalendarIcon,
  Castle,
  Hotel,
  Wine,
  UserCheck,
  Shield,
  DollarSign,
  Percent,
  CreditCard,
  Notebook,
  Settings2,
  LayoutDashboard,
  Building2,
  UserCog,
  Wallet,
  BarChart2,
  Calendar,
  Cake,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

// This is sample data.
const data = {
  versions: ["1.0.1", "1.1.0-alpha", "2.0.0-beta1"],
  navMain: [
    {
      title: "Daily Operations",
      url: "#",
      icon: LayoutDashboard,
      items: [
        {
          title: "Home",
          url: "/event_calendar",
          icon: Calendar,
        },
        {
          title: "Bookings",
          url: "/manage",
          icon: Book,
        },
        {
          title: "Clients",
          url: "/manage/clients",
          icon: Users,
        },
        {
          title: "Event Types",
          url: "/manage/event-types",
          icon: Cake,
        },
      ],
    },
    {
      title: "Facilities & Resources",
      url: "#",
      icon: Building2,
      items: [
        {
          title: "Pavilion",
          url: "/manage/pavilion",
          icon: Castle,
        },
        {
          title: "Rooms",
          url: "/manage/rooms",
          icon: Hotel,
        },
        {
          title: "Inventory",
          url: "/manage/inventory",
          icon: Wine,
        },
      ],
    },
    {
      title: "Staff & Roles",
      url: "#",
      icon: UserCog,
      items: [
        {
          title: "Employees",
          url: "/manage/employees",
          icon: UserCheck,
        },
        {
          title: "Roles",
          url: "/manage/roles",
          icon: Shield,
        },
      ],
    },
    {
      title: "Finance & Payments",
      url: "#",
      icon: Wallet,
      items: [
        {
          title: "Additional Charges",
          url: "/manage/additional-charges",
          icon: DollarSign,
        },
        {
          title: "Discounts",
          url: "/manage/discounts",
          icon: Percent,
        },
        {
          title: "Payment Methods",
          url: "/manage/mode-of-payment",
          icon: CreditCard,
        },
      ],
    },
    {
      title: "Reports & Settings",
      url: "#",
      icon: BarChart2,
      items: [
        {
          title: "Reports",
          url: "/reports",
          icon: Notebook,
        },
        {
          title: "Settings",
          url: "/settings",
          icon: Settings2,
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex gap-3 justify-start items-center py-2 px-1">
          <Image
            src="/susings_and_rufins_logo.png"
            alt="Susings and Rufins Logo"
            width={60}
            height={60}
          />
        </div>
      </SidebarHeader>
      <SidebarContent>
        {/* We create a SidebarGroup for each parent. */}
        {data.navMain.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((item) => {
                  const isActive = pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <a href={item.url}>
                          <item.icon className="mr-2 h-4 w-4" />
                          {item.title}
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
