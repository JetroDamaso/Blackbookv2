/**
 * RoleGuard Component
 * Conditionally renders children based on user permissions
 * Usage:
 *   <RoleGuard permission="employees:create">
 *     <Button>Create Employee</Button>
 *   </RoleGuard>
 */

"use client";

import { useSession } from "next-auth/react";
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  type Permission,
  type Role,
} from "@/lib/permissions";
import { ReactNode } from "react";

interface RoleGuardProps {
  children: ReactNode;
  /** Single permission required to view content */
  permission?: Permission;
  /** Array of permissions - user needs ANY of them */
  anyPermissions?: Permission[];
  /** Array of permissions - user needs ALL of them */
  allPermissions?: Permission[];
  /** Content to show if user doesn't have permission */
  fallback?: ReactNode;
  /** If true, show children when user DOESN'T have permission (inverse logic) */
  inverse?: boolean;
}

export function RoleGuard({
  children,
  permission,
  anyPermissions,
  allPermissions,
  fallback = null,
  inverse = false,
}: RoleGuardProps) {
  const { data: session } = useSession();
  const userRole = session?.user?.role as Role | undefined;

  // Determine if user has required permissions
  let hasRequiredPermission = false;

  if (permission) {
    hasRequiredPermission = hasPermission(userRole, permission);
  } else if (anyPermissions) {
    hasRequiredPermission = hasAnyPermission(userRole, anyPermissions);
  } else if (allPermissions) {
    hasRequiredPermission = hasAllPermissions(userRole, allPermissions);
  } else {
    // If no permissions specified, allow by default
    hasRequiredPermission = true;
  }

  // Apply inverse logic if specified
  const shouldRender = inverse ? !hasRequiredPermission : hasRequiredPermission;

  return shouldRender ? <>{children}</> : <>{fallback}</>;
}

interface RequireRoleProps {
  children: ReactNode;
  /** Specific role(s) required */
  roles: Role | Role[];
  /** Content to show if user doesn't have role */
  fallback?: ReactNode;
}

/**
 * RequireRole Component
 * Conditionally renders children based on exact role match
 * Usage:
 *   <RequireRole roles="OWNER">
 *     <AdminPanel />
 *   </RequireRole>
 */
export function RequireRole({ children, roles, fallback = null }: RequireRoleProps) {
  const { data: session } = useSession();
  const userRole = session?.user?.role as Role | undefined;

  if (!userRole) {
    return <>{fallback}</>;
  }

  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  const hasRole = allowedRoles.includes(userRole);

  return hasRole ? <>{children}</> : <>{fallback}</>;
}

interface RequireOwnerProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * RequireOwner Component
 * Shorthand for requiring Owner role
 * Usage:
 *   <RequireOwner>
 *     <DeleteAllDataButton />
 *   </RequireOwner>
 */
export function RequireOwner({ children, fallback = null }: RequireOwnerProps) {
  return (
    <RequireRole roles="OWNER" fallback={fallback}>
      {children}
    </RequireRole>
  );
}

interface RequireManagerOrOwnerProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * RequireManagerOrOwner Component
 * Shorthand for requiring Manager or Owner role
 * Usage:
 *   <RequireManagerOrOwner>
 *     <ViewReportsButton />
 *   </RequireManagerOrOwner>
 */
export function RequireManagerOrOwner({ children, fallback = null }: RequireManagerOrOwnerProps) {
  return (
    <RequireRole roles={["OWNER", "MANAGER"]} fallback={fallback}>
      {children}
    </RequireRole>
  );
}
