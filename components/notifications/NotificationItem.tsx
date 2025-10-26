"use client";

import {
  AlertCircle,
  CheckCircle,
  Info,
  XCircle,
  Receipt,
  Calendar,
  DollarSign,
  Package,
  Settings,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

interface NotificationItemProps {
  notification: Notification;
  onClick: () => void;
  onDelete: () => void;
}

export function NotificationItem({ notification, onClick, onDelete }: NotificationItemProps) {
  const getIcon = () => {
    const iconClass = "w-4 h-4 flex-shrink-0";

    switch (notification.type) {
      case "discount_request":
      case "discount_approved":
      case "discount_rejected":
      case "discount_modified":
        return <Receipt className={iconClass} />;
      case "booking_created":
      case "booking_updated":
      case "booking_cancelled":
        return <Calendar className={iconClass} />;
      case "payment_received":
      case "payment_overdue":
        return <DollarSign className={iconClass} />;
      case "inventory_low":
      case "inventory_out":
        return <Package className={iconClass} />;
      case "system":
        return <Settings className={iconClass} />;
      case "success":
        return <CheckCircle className={iconClass} />;
      case "warning":
        return <AlertCircle className={iconClass} />;
      case "error":
        return <XCircle className={iconClass} />;
      default:
        return <Info className={iconClass} />;
    }
  };

  const getTypeColor = () => {
    switch (notification.type) {
      case "discount_approved":
      case "payment_received":
      case "success":
        return "text-green-600 dark:text-green-400";
      case "discount_rejected":
      case "booking_cancelled":
      case "error":
        return "text-red-600 dark:text-red-400";
      case "discount_request":
      case "discount_modified":
      case "payment_overdue":
      case "inventory_low":
      case "warning":
        return "text-yellow-600 dark:text-yellow-400";
      default:
        return "text-blue-600 dark:text-blue-400";
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-start gap-3 p-4 hover:bg-accent transition-colors cursor-pointer relative group",
        !notification.read && "bg-blue-50/50 dark:bg-blue-950/20"
      )}
    >
      {/* Unread indicator */}
      {!notification.read && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full"></div>
      )}

      {/* Icon */}
      <div className={cn("mt-0.5", getTypeColor())}>{getIcon()}</div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <p
          className={cn("text-sm font-medium line-clamp-1", !notification.read && "font-semibold")}
        >
          {notification.title}
        </p>
        <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
        <p className="text-xs text-muted-foreground">{formatTimeAgo(notification.createdAt)}</p>
      </div>

      {/* Delete button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDelete}
        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
      >
        <Trash2 className="w-3 h-3" />
        <span className="sr-only">Delete notification</span>
      </Button>
    </div>
  );
}
