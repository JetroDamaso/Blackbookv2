"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  Users,
  Calendar,
  Receipt,
  DollarSign,
  FileText,
  Package,
  Settings,
  Activity,
} from "lucide-react";
import { getRolePermissions, getRoleDisplayName } from "@/lib/permissions";

type Role = "OWNER" | "MANAGER" | "FRONT_DESK";

interface EmployeePermissionsListProps {
  role: Role;
}

export function EmployeePermissionsList({ role }: EmployeePermissionsListProps) {
  const permissions = getRolePermissions(role);

  const permissionCategories = [
    {
      title: "Employee Management",
      icon: Users,
      permissions: [
        { key: "employees:read", label: "View employees" },
        { key: "employees:create", label: "Create employees" },
        { key: "employees:update", label: "Edit employees" },
        { key: "employees:delete", label: "Delete employees" },
      ],
    },
    {
      title: "Bookings",
      icon: Calendar,
      permissions: [
        { key: "bookings:read", label: "View bookings" },
        { key: "bookings:create", label: "Create bookings" },
        { key: "bookings:update", label: "Edit bookings" },
        { key: "bookings:delete", label: "Delete bookings" },
        { key: "bookings:cancel", label: "Cancel bookings" },
      ],
    },
    {
      title: "Discounts",
      icon: Receipt,
      permissions: [
        { key: "discounts:request", label: "Request discounts" },
        { key: "discounts:approve", label: "Approve discounts" },
        { key: "discounts:view-all", label: "View all discount requests" },
      ],
    },
    {
      title: "Payments",
      icon: DollarSign,
      permissions: [
        { key: "payments:read", label: "View payments" },
        { key: "payments:create", label: "Record payments" },
        { key: "payments:update", label: "Edit payments" },
        { key: "payments:delete", label: "Delete payments" },
      ],
    },
    {
      title: "Clients",
      icon: Users,
      permissions: [
        { key: "clients:read", label: "View clients" },
        { key: "clients:create", label: "Create clients" },
        { key: "clients:update", label: "Edit clients" },
        { key: "clients:delete", label: "Delete clients" },
      ],
    },
    {
      title: "Resources",
      icon: Package,
      permissions: [
        { key: "event-types:read", label: "View event types" },
        { key: "event-types:create", label: "Create event types" },
        { key: "pavilions:read", label: "View pavilions" },
        { key: "pavilions:create", label: "Create pavilions" },
        { key: "packages:read", label: "View packages" },
        { key: "packages:create", label: "Create packages" },
      ],
    },
    {
      title: "Inventory",
      icon: Package,
      permissions: [
        { key: "inventory:read", label: "View inventory" },
        { key: "inventory:create", label: "Add inventory items" },
        { key: "inventory:update", label: "Update inventory" },
      ],
    },
    {
      title: "Reports",
      icon: FileText,
      permissions: [
        { key: "reports:view", label: "View reports" },
        { key: "reports:export", label: "Export reports" },
      ],
    },
    {
      title: "Settings",
      icon: Settings,
      permissions: [
        { key: "settings:read", label: "View settings" },
        { key: "settings:update", label: "Update settings" },
      ],
    },
    {
      title: "Activity Logs",
      icon: Activity,
      permissions: [{ key: "activity-logs:view", label: "View activity logs" }],
    },
  ];

  const hasPermission = (key: string) => permissions.includes(key as any);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Role Permissions</CardTitle>
        <CardDescription>{getRoleDisplayName(role)} has the following permissions:</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {permissionCategories.map(category => {
          const categoryPerms = category.permissions.filter(
            p => hasPermission(p.key) || !hasPermission(p.key)
          );

          if (categoryPerms.length === 0) return null;

          return (
            <div key={category.title} className="space-y-3">
              <div className="flex items-center gap-2">
                <category.icon className="w-4 h-4 text-muted-foreground" />
                <h4 className="font-semibold text-sm">{category.title}</h4>
              </div>
              <div className="grid gap-2 pl-6">
                {category.permissions.map(perm => (
                  <div key={perm.key} className="flex items-center gap-2 text-sm">
                    {hasPermission(perm.key) ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-gray-300" />
                    )}
                    <span
                      className={
                        hasPermission(perm.key) ? "" : "text-muted-foreground line-through"
                      }
                    >
                      {perm.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
