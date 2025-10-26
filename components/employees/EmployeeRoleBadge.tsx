"use client";

import { Badge } from "@/components/ui/badge";

type Role = "OWNER" | "MANAGER" | "FRONT_DESK";

interface EmployeeRoleBadgeProps {
  role: Role;
  className?: string;
}

export function EmployeeRoleBadge({ role, className }: EmployeeRoleBadgeProps) {
  const getBadgeVariant = () => {
    switch (role) {
      case "OWNER":
        return "default";
      case "MANAGER":
        return "secondary";
      case "FRONT_DESK":
        return "outline";
      default:
        return "outline";
    }
  };

  const getRoleDisplay = () => {
    switch (role) {
      case "OWNER":
        return "Owner";
      case "MANAGER":
        return "Manager";
      case "FRONT_DESK":
        return "Front Desk";
      default:
        return role;
    }
  };

  return (
    <Badge variant={getBadgeVariant()} className={className}>
      {getRoleDisplay()}
    </Badge>
  );
}
