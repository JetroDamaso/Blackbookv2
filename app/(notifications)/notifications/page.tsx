"use client";

import { Bell } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { NotificationList } from "@/components/notifications/NotificationList";

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader icon={Bell} title="Notifications" />

      <div className="p-4 -mt-4">
          <NotificationList />
      </div>
    </div>
  );
}
