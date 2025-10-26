/**
 * Discount Status Badge
 * Visual indicator of discount request status
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, Edit } from "lucide-react";

interface DiscountStatusBadgeProps {
  status: "PENDING" | "APPROVED" | "REJECTED" | "MODIFIED";
  className?: string;
}

export function DiscountStatusBadge({ status, className }: DiscountStatusBadgeProps) {
  const config = {
    PENDING: {
      label: "Pending",
      color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      icon: Clock,
    },
    APPROVED: {
      label: "Approved",
      color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      icon: CheckCircle,
    },
    REJECTED: {
      label: "Rejected",
      color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      icon: XCircle,
    },
    MODIFIED: {
      label: "Modified",
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      icon: Edit,
    },
  };

  const { label, color, icon: Icon } = config[status];

  return (
    <Badge className={`${color} ${className}`} variant="outline">
      <Icon className="w-3 h-3 mr-1" />
      {label}
    </Badge>
  );
}
