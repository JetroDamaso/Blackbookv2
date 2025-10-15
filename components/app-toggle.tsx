"use client";
import { useId, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

import { Calendar, Home, Inbox } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";

export default function AppToggle() {
  const router = useRouter();
  const pathname = usePathname();

  // Determine current active tab based on pathname
  const getCurrentTab = () => {
    if (pathname === "/dashboard") return "home";
    if (pathname === "/event_calendar") return "calendar";
    if (pathname === "/manage") return "manage";
    if (pathname === "/manage/clients") return "manage";
    if (pathname === "/manage/inventory") return "manage";
    if (pathname === "/manage/pavilion") return "manage";

    return "home"; // default
  };

  const handleHomeClick = () => {
    router.push("/#");
  };

  const handleCalendarClick = () => {
    router.push("/event_calendar");
  };

  const handleManageClick = () => {
    router.push("/manage");
  };

  return (
    <Tabs value={getCurrentTab()}>
      <TabsList>
        <TabsTrigger
          value="home"
          className="text-sm gap-1"
          onClick={handleHomeClick}
        >
          <Home size={14} /> Home
        </TabsTrigger>
        <TabsTrigger
          value="calendar"
          className="text-sm gap-1"
          onClick={handleCalendarClick}
        >
          <Calendar size={14} />
          Calendar
        </TabsTrigger>
        <TabsTrigger
          value="manage"
          className="text-sm gap-1"
          onClick={handleManageClick}
        >
          <Inbox size={14} />
          Manage
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
