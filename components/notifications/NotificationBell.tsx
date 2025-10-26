"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationDropdown } from "./NotificationDropdown";
import BookingDialogComponent from "@/components/(Calendar)/BookingDialog";

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch("/api/notifications/unread-count");
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();

    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      // Refresh count when dropdown opens
      fetchUnreadCount();
    }
  };

  const handleBookingClick = (bookingId: number) => {
    setSelectedBookingId(bookingId);
    setShowBookingDialog(true);
    setIsOpen(false); // Close the dropdown
  };

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <Badge
                className="absolute -top-1 -right-1 px-1.5 min-w-5 h-5 flex items-center justify-center"
                variant="destructive"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            )}
            <span className="sr-only">Notifications</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80 p-0">
          <NotificationDropdown onUpdate={fetchUnreadCount} onBookingClick={handleBookingClick} />
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Booking Dialog - Rendered outside sidebar using Portal */}
      {isMounted &&
        selectedBookingId &&
        typeof window !== "undefined" &&
        createPortal(
          <BookingDialogComponent
            bookingId={selectedBookingId}
            open={showBookingDialog}
            onOpenChange={setShowBookingDialog}
          />,
          document.body
        )}
    </>
  );
}
