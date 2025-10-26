"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, Trash2, ExternalLink, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NotificationItem } from "./NotificationItem";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  bookingId?: number;
  clientId?: number;
  createdAt: string;
}

interface NotificationDropdownProps {
  onUpdate?: () => void;
  onBookingClick?: (bookingId: number) => void;
}

export function NotificationDropdown({ onUpdate, onBookingClick }: NotificationDropdownProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAll, setLoadingAll] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("unread");
  const [showAllDialog, setShowAllDialog] = useState(false);
  const [dialogFilter, setDialogFilter] = useState<"all" | "unread">("all");

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const unreadOnly = filter === "unread";
      const response = await fetch(`/api/notifications?limit=20&unreadOnly=${unreadOnly}`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchAllNotifications = async () => {
    try {
      setLoadingAll(true);
      const unreadOnly = dialogFilter === "unread";
      const response = await fetch(`/api/notifications?limit=100&unreadOnly=${unreadOnly}`);
      if (response.ok) {
        const data = await response.json();
        setAllNotifications(data.notifications);
      }
    } catch (error) {
      console.error("Error fetching all notifications:", error);
    } finally {
      setLoadingAll(false);
    }
  };

  useEffect(() => {
    if (showAllDialog) {
      fetchAllNotifications();
    }
  }, [showAllDialog, dialogFilter]);

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });

      if (response.ok) {
        await fetchNotifications();
        onUpdate?.();
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const handleNotificationClick = async (notification: Notification, closeDialog = false) => {
    // Capture bookingId and link before any async operations
    const bookingId = notification.bookingId;
    const link = notification.link;
    const isUnread = !notification.read;

    // Mark as read if unread
    if (isUnread) {
      try {
        await fetch("/api/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notificationIds: [notification.id] }),
        });
        await fetchNotifications();
        if (showAllDialog) {
          await fetchAllNotifications();
        }
        onUpdate?.();
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }

    // Close all notifications dialog if requested
    if (closeDialog) {
      setShowAllDialog(false);
    }

    // Check if it's a booking notification with a bookingId
    if (bookingId && onBookingClick) {
      onBookingClick(bookingId);
    } else if (link) {
      // Fallback to routing if no bookingId but has a link
      router.push(link);
    }
  };

  const handleDelete = async (notificationId: string, fromDialog = false) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchNotifications();
        if (fromDialog) {
          await fetchAllNotifications();
        }
        onUpdate?.();
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const dialogUnreadCount = allNotifications.filter(n => !n.read).length;

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4" />
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <span className="text-xs text-muted-foreground">({unreadCount} unread)</span>
          )}
        </div>

        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead} className="h-8 text-xs">
            <CheckCheck className="w-3 h-3 mr-1" />
            Mark all read
          </Button>
        )}
      </div>

      {/* Filter Toggle */}
      <div className="flex gap-1 p-2 border-b bg-muted/50">
        <Button
          variant={filter === "unread" ? "default" : "ghost"}
          size="sm"
          onClick={() => setFilter("unread")}
          className="flex-1 h-8"
        >
          Unread
        </Button>
        <Button
          variant={filter === "all" ? "default" : "ghost"}
          size="sm"
          onClick={() => setFilter("all")}
          className="flex-1 h-8"
        >
          All
        </Button>
      </div>

      {/* Notifications List */}
      <ScrollArea className="h-96">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 dark:border-gray-100"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center px-4">
            <Bell className="w-8 h-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No notifications</p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map(notification => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={() => handleNotificationClick(notification)}
                onDelete={() => handleDelete(notification.id)}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      {notifications.length > 0 && (
        <>
          <Separator />
          <div className="p-2">
            <Button
              variant="ghost"
              className="w-full justify-center text-sm"
              onClick={() => setShowAllDialog(true)}
            >
              View all notifications
              <Maximize2 className="w-3 h-3 ml-2" />
            </Button>
          </div>
        </>
      )}

      {/* All Notifications Dialog */}
      <Dialog open={showAllDialog} onOpenChange={setShowAllDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              All Notifications
              {dialogUnreadCount > 0 && (
                <span className="text-sm text-muted-foreground font-normal">
                  ({dialogUnreadCount} unread)
                </span>
              )}
            </DialogTitle>
            <DialogDescription>View and manage all your notifications</DialogDescription>
          </DialogHeader>

          {/* Dialog Filter Toggle */}
          <div className="flex gap-1 border-b pb-3">
            <Button
              variant={dialogFilter === "unread" ? "default" : "ghost"}
              size="sm"
              onClick={() => setDialogFilter("unread")}
              className="flex-1 h-8"
            >
              Unread
            </Button>
            <Button
              variant={dialogFilter === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => setDialogFilter("all")}
              className="flex-1 h-8"
            >
              All
            </Button>
            {dialogUnreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={handleMarkAllAsRead} className="h-8">
                <CheckCheck className="w-3 h-3 mr-1" />
                Mark all read
              </Button>
            )}
          </div>

          {/* Dialog Notifications List */}
          <ScrollArea className="h-[60vh] pr-4">
            {loadingAll ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 dark:border-gray-100"></div>
              </div>
            ) : allNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center px-4">
                <Bell className="w-8 h-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No notifications</p>
              </div>
            ) : (
              <div className="divide-y">
                {allNotifications.map(notification => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onClick={() => handleNotificationClick(notification, true)}
                    onDelete={() => handleDelete(notification.id, true)}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
