"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, User } from "lucide-react";
import { useSession } from "next-auth/react";

interface UserInfoProps {
  showCard?: boolean;
  className?: string;
}

export function UserInfo({ showCard = true, className }: UserInfoProps) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className={className}>
        {showCard ? (
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-20" />
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        )}
      </div>
    );
  }

  if (status === "unauthenticated" || !session?.user) {
    return (
      <div className={className}>
        {showCard ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Not authenticated</p>
            </CardContent>
          </Card>
        ) : (
          <p className="text-sm text-muted-foreground">Not authenticated</p>
        )}
      </div>
    );
  }

  const { user } = session;

  const content = (
    <>
      <div className="flex items-center space-x-2 mb-3">
        <User className="h-5 w-5 text-muted-foreground" />
        <span className="font-medium">{user.name}</span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Employee ID:</span>
          <span className="font-mono">{user.employeeId.substring(0, 8)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Email:</span>
          <span className="text-xs">{user.email}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Role:</span>
          <Badge variant="secondary" className="flex items-center space-x-1">
            <Shield className="h-3 w-3" />
            <span>{user.role}</span>
          </Badge>
        </div>
      </div>
    </>
  );

  if (showCard) {
    return (
      <div className={className}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">User Information</CardTitle>
            <CardDescription>Currently logged in user details</CardDescription>
          </CardHeader>
          <CardContent>{content}</CardContent>
        </Card>
      </div>
    );
  }

  return <div className={className}>{content}</div>;
}

// Compact version for navigation bars, headers, etc.
export function UserInfoCompact({ className }: { className?: string }) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <Skeleton className="h-8 w-24" />;
  }

  if (status === "unauthenticated" || !session?.user) {
    return null;
  }

  const { user } = session;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
          <User className="h-4 w-4 text-primary" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium leading-none">{user.name}</span>
          <span className="text-xs text-muted-foreground leading-none mt-1">
            ID: {user.employeeId.substring(0, 8)}
          </span>
        </div>
      </div>
      <Badge variant="outline">{user.role}</Badge>
    </div>
  );
}

export default UserInfo;
