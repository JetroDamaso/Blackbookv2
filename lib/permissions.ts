/**
 * Permission Management System
 * Centralizes all role-based access control logic
 */

// Role type definition (matching Prisma schema)
export type Role = "OWNER" | "MANAGER" | "FRONT_DESK";

export type Permission =
  // Employee Management
  | "employees:create"
  | "employees:read"
  | "employees:update"
  | "employees:delete"
  | "employees:manage-roles"

  // Booking Management
  | "bookings:create"
  | "bookings:read"
  | "bookings:update"
  | "bookings:delete"
  | "bookings:cancel"

  // Discount Management
  | "discounts:request"
  | "discounts:approve"
  | "discounts:reject"
  | "discounts:view-all"

  // Payment Management
  | "payments:create"
  | "payments:read"
  | "payments:update"
  | "payments:delete"
  | "payments:refund"

  // Client Management
  | "clients:create"
  | "clients:read"
  | "clients:update"
  | "clients:delete"

  // Event Type Management
  | "event-types:create"
  | "event-types:read"
  | "event-types:update"
  | "event-types:delete"

  // Pavilion Management
  | "pavilions:create"
  | "pavilions:read"
  | "pavilions:update"
  | "pavilions:delete"

  // Package Management
  | "packages:create"
  | "packages:read"
  | "packages:update"
  | "packages:delete"

  // Inventory Management
  | "inventory:create"
  | "inventory:read"
  | "inventory:update"
  | "inventory:delete"

  // Reports
  | "reports:view"
  | "reports:export"

  // Settings
  | "settings:view"
  | "settings:update";

/**
 * Permission Matrix
 * Defines what permissions each role has
 */
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  OWNER: [
    // Full access to everything
    "employees:create",
    "employees:read",
    "employees:update",
    "employees:delete",
    "employees:manage-roles",
    "bookings:create",
    "bookings:read",
    "bookings:update",
    "bookings:delete",
    "bookings:cancel",
    "discounts:request",
    "discounts:approve",
    "discounts:reject",
    "discounts:view-all",
    "payments:create",
    "payments:read",
    "payments:update",
    "payments:delete",
    "payments:refund",
    "clients:create",
    "clients:read",
    "clients:update",
    "clients:delete",
    "event-types:create",
    "event-types:read",
    "event-types:update",
    "event-types:delete",
    "pavilions:create",
    "pavilions:read",
    "pavilions:update",
    "pavilions:delete",
    "packages:create",
    "packages:read",
    "packages:update",
    "packages:delete",
    "inventory:create",
    "inventory:read",
    "inventory:update",
    "inventory:delete",
    "reports:view",
    "reports:export",
    "settings:view",
    "settings:update",
  ],
  MANAGER: [
    // Can manage most things except employees and sensitive settings
    "employees:read",
    "bookings:create",
    "bookings:read",
    "bookings:update",
    "bookings:cancel",
    "discounts:request", // Can request but not approve
    "discounts:view-all",
    "payments:create",
    "payments:read",
    "payments:update",
    "clients:create",
    "clients:read",
    "clients:update",
    "clients:delete",
    "event-types:read",
    "event-types:update",
    "pavilions:read",
    "pavilions:update",
    "packages:read",
    "packages:update",
    "inventory:create",
    "inventory:read",
    "inventory:update",
    "reports:view",
    "reports:export",
    "settings:view",
  ],
  FRONT_DESK: [
    // Limited to booking and client operations
    "bookings:create",
    "bookings:read",
    "bookings:update",
    "discounts:request", // Can request but not approve
    "payments:create",
    "payments:read",
    "clients:create",
    "clients:read",
    "clients:update",
    "event-types:read",
    "pavilions:read",
    "packages:read",
    "inventory:read",
  ],
};

/**
 * Normalize role string to match our Role type
 * Handles variations like "Manager" -> "MANAGER", "Front Desk" -> "FRONT_DESK"
 */
function normalizeRole(role: string | null | undefined): Role | null {
  if (!role) return null;

  // Convert to uppercase and replace spaces with underscores
  const normalized = role.toUpperCase().replace(/\s+/g, "_");

  // Check if it's a valid role
  if (normalized === "OWNER" || normalized === "MANAGER" || normalized === "FRONT_DESK") {
    return normalized as Role;
  }

  return null;
}

/**
 * Check if a role has a specific permission
 */
export function hasPermission(
  role: Role | string | null | undefined,
  permission: Permission
): boolean {
  if (!role) return false;

  // Normalize the role if it's a string
  const normalizedRole = typeof role === "string" ? normalizeRole(role) : role;
  if (!normalizedRole) return false;

  return ROLE_PERMISSIONS[normalizedRole]?.includes(permission) ?? false;
}

/**
 * Check if a role has ANY of the specified permissions
 */
export function hasAnyPermission(
  role: Role | string | null | undefined,
  permissions: Permission[]
): boolean {
  if (!role) return false;
  return permissions.some(permission => hasPermission(role, permission));
}

/**
 * Check if a role has ALL of the specified permissions
 */
export function hasAllPermissions(
  role: Role | string | null | undefined,
  permissions: Permission[]
): boolean {
  if (!role) return false;
  return permissions.every(permission => hasPermission(role, permission));
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: Role | string): Permission[] {
  const normalizedRole = typeof role === "string" ? normalizeRole(role) : role;
  if (!normalizedRole) return [];
  return ROLE_PERMISSIONS[normalizedRole] ?? [];
}

/**
 * Check if user can perform an action on a resource
 * This is a higher-level function that can include additional business logic
 */
export function canPerformAction(
  userRole: Role | string | null | undefined,
  action: Permission,
  options?: {
    isOwner?: boolean; // Is the user the owner of the resource?
    resourceStatus?: string; // Status of the resource (e.g., booking status)
  }
): boolean {
  // First check basic permission
  if (!hasPermission(userRole, action)) {
    return false;
  }

  // Additional business logic can go here
  // For example, you might allow users to edit their own resources
  // even if they don't have general edit permissions

  return true;
}

/**
 * Permission-based route guards
 * Returns true if the user can access the route
 */
export function canAccessRoute(userRole: Role | string | null | undefined, route: string): boolean {
  if (!userRole) return false;

  // Define route-to-permission mapping
  const routePermissions: Record<string, Permission> = {
    "/manage/employees": "employees:read",
    "/manage/clients": "clients:read",
    "/manage/event-types": "event-types:read",
    "/manage/pavilions": "pavilions:read",
    "/manage/packages": "packages:read",
    "/bookings": "bookings:read",
    "/calendar": "bookings:read",
    "/inventory": "inventory:read",
    "/reports": "reports:view",
    "/settings": "settings:view",
  };

  const requiredPermission = routePermissions[route];
  if (!requiredPermission) {
    // Route not in the map - allow by default (could be changed to deny)
    return true;
  }

  return hasPermission(userRole, requiredPermission);
}

/**
 * Get user's role display name
 */
export function getRoleDisplayName(role: Role): string {
  const roleNames: Record<Role, string> = {
    OWNER: "Owner",
    MANAGER: "Manager",
    FRONT_DESK: "Front Desk Staff",
  };
  return roleNames[role];
}

/**
 * Get role badge color for UI
 */
export function getRoleBadgeColor(role: Role): string {
  const colors: Record<Role, string> = {
    OWNER: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    MANAGER: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    FRONT_DESK: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  };
  return colors[role];
}

/**
 * Permission requirement helpers for UI components
 */
export const PERMISSIONS = {
  // Employee Management
  CREATE_EMPLOYEE: "employees:create" as Permission,
  READ_EMPLOYEE: "employees:read" as Permission,
  UPDATE_EMPLOYEE: "employees:update" as Permission,
  DELETE_EMPLOYEE: "employees:delete" as Permission,
  MANAGE_ROLES: "employees:manage-roles" as Permission,

  // Discount Management
  REQUEST_DISCOUNT: "discounts:request" as Permission,
  APPROVE_DISCOUNT: "discounts:approve" as Permission,
  REJECT_DISCOUNT: "discounts:reject" as Permission,
  VIEW_ALL_DISCOUNTS: "discounts:view-all" as Permission,

  // Booking Management
  CREATE_BOOKING: "bookings:create" as Permission,
  READ_BOOKING: "bookings:read" as Permission,
  UPDATE_BOOKING: "bookings:update" as Permission,
  DELETE_BOOKING: "bookings:delete" as Permission,
  CANCEL_BOOKING: "bookings:cancel" as Permission,

  // Payment Management
  CREATE_PAYMENT: "payments:create" as Permission,
  READ_PAYMENT: "payments:read" as Permission,
  REFUND_PAYMENT: "payments:refund" as Permission,

  // Reports
  VIEW_REPORTS: "reports:view" as Permission,
  EXPORT_REPORTS: "reports:export" as Permission,

  // Settings
  UPDATE_SETTINGS: "settings:update" as Permission,
};
