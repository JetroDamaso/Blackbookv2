"use client";

import * as React from "react";
import {
  AudioWaveform,
  Book,
  BookOpen,
  Bot,
  Calendar,
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
      title: "Home",
      url: "/",
      icon: LucideHome,
      isActive: true,
    },
    {
      title: "Search",
      url: "#",
      icon: Search,
      isActive: true,

    },
    {
      title: "Calendar",
      url: "/event_calendar",
      icon: Calendar,
      isActive: true,
    },
    {
      title: "Bookings",
      url: "/bookings",
      icon: Book,
      isActive: true,
    },
    {
      title: "Clients",
      url: "/clients",
      icon: Users,
      isActive: true,
    },
    {
      title: "Inventory",
      url: "/inventory",
      icon: Wine,
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
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
