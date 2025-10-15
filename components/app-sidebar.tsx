"use client";

import * as React from "react";
import {
  AudioWaveform,
  Book,
  BookOpen,
  Bot,
  Calendar,
  Castle,
  Command,
  Frame,
  GalleryVerticalEnd,
  House,
  LucideHome,
  Map,
  Notebook,
  PieChart,
  Search,
  Settings2,
  SquareTerminal,
  Users,
  Wine,
  DollarSign,
  Percent,
  UserCheck,
  Calendar as CalendarIcon,
  CreditCard,
  Shield,
  Hotel,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Susings and Rufins Farm",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
  ],
  navMain: [
    {
      title: "Bookings",
      url: "/manage",
      icon: Book,
      isActive: true,
    },
    {
      title: "Clients",
      url: "/manage/clients",
      icon: Users,
      isActive: true,
    },
    {
      title: "Pavilion",
      url: "/manage/pavilion",
      icon: Castle,
      isActive: true,
    },
    {
      title: "Inventory",
      url: "/manage/inventory",
      icon: Wine,
      isActive: true,
    },
    {
      title: "Additional Charges",
      url: "/manage/additional-charges",
      icon: DollarSign,
      isActive: true,
    },
    {
      title: "Discounts",
      url: "/manage/discounts",
      icon: Percent,
      isActive: true,
    },
    {
      title: "Employees",
      url: "/manage/employees",
      icon: UserCheck,
      isActive: true,
    },
    {
      title: "Event Types",
      url: "/manage/event-types",
      icon: CalendarIcon,
      isActive: true,
    },
    {
      title: "Payment Methods",
      url: "/manage/mode-of-payment",
      icon: CreditCard,
      isActive: true,
    },
    {
      title: "Roles",
      url: "/manage/roles",
      icon: Shield,
      isActive: true,
    },
    {
      title: "Rooms",
      url: "/manage/rooms",
      icon: Hotel,
      isActive: true,
    },
    {
      title: "Reports",
      url: "/reports",
      icon: Notebook,
      isActive: true,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings2,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent className="mt-12">
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
