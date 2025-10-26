/**
 * PermissionButton Component
 * A button that is automatically disabled/hidden based on user permissions
 * Usage:
 *   <PermissionButton permission="employees:delete" onClick={handleDelete}>
 *     Delete Employee
 *   </PermissionButton>
 */

"use client";

import { useSession } from "next-auth/react";
import { hasPermission, type Permission, type Role } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { forwardRef, ComponentProps } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PermissionButtonProps extends ComponentProps<typeof Button> {
  /** Permission required to enable the button */
  permission: Permission;
  /** If true, hide button instead of disabling it */
  hideWhenDisabled?: boolean;
  /** Custom tooltip message when user lacks permission */
  disabledTooltip?: string;
}

export const PermissionButton = forwardRef<HTMLButtonElement, PermissionButtonProps>(
  (
    {
      permission,
      hideWhenDisabled = false,
      disabledTooltip = "You don't have permission to perform this action",
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const { data: session } = useSession();
    const userRole = session?.user?.role as Role | undefined;
    const hasRequiredPermission = hasPermission(userRole, permission);

    // If user doesn't have permission and we should hide the button
    if (!hasRequiredPermission && hideWhenDisabled) {
      return null;
    }

    // If button is disabled by permission, show tooltip
    if (!hasRequiredPermission) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-block">
                <Button ref={ref} disabled={true} {...props}>
                  {children}
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{disabledTooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    // User has permission - render normally
    return (
      <Button ref={ref} disabled={disabled} {...props}>
        {children}
      </Button>
    );
  }
);

PermissionButton.displayName = "PermissionButton";
