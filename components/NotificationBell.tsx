/**
 * NotificationBell Component
 * Displays notification bell with unread count and dropdown
 * Now uses database notifications (works across devices/origins)
 */

'use client';

import { useState } from 'react';
import { Bell, Check, CheckCheck } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useDatabaseNotifications } from '@/hooks/useDatabaseNotifications';
import { formatDistanceToNow } from 'date-fns';

export function NotificationBell() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  } = useDatabaseNotifications({ showToast: false });

  const [isOpen, setIsOpen] = useState(false);

  // Separate notifications into unread and read
  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);

  const getNotificationIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'BOOKING':
        return '📅';
      case 'PAYMENT':
        return '💰';
      case 'DISCOUNT_REQUEST':
        return '🎫';
      case 'DISCOUNT_RESPONSE':
        return '✅';
      case 'INVENTORY':
        return '📦';
      case 'SYSTEM':
        return '⚙️';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type.toUpperCase()) {
      case 'BOOKING':
        return 'border-blue-200';
      case 'PAYMENT':
        return 'border-green-200';
      case 'DISCOUNT_REQUEST':
        return 'border-yellow-200';
      case 'DISCOUNT_RESPONSE':
        return 'border-purple-200';
      case 'INVENTORY':
        return 'border-orange-200';
      case 'SYSTEM':
        return 'border-gray-200';
      default:
        return 'border-gray-200';
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-lg">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs"
            >
              <CheckCheck className="h-4 w-4 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Bell className="h-12 w-12 mb-2 opacity-20" />
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            <div>
              {/* Unread Notifications Section */}
              {unreadNotifications.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-muted/50 sticky top-0 z-10">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase">
                      Unread ({unreadNotifications.length})
                    </h4>
                  </div>
                  <div className="divide-y">
                    {unreadNotifications.map(notif => (
                      <div
                        key={notif.id}
                        className="p-4 hover:bg-accent/50 transition-colors bg-accent/30"
                      >
                        <div className="flex gap-3 items-start">
                          <div className="text-2xl mt-1">
                            {getNotificationIcon(notif.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div
                              className={`text-sm border-l-2 pl-2 ${getNotificationColor(notif.type)}`}
                            >
                              <p className="font-semibold">
                                {notif.message}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => markAsRead(notif.id)}
                              title="Mark as read"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Read Notifications Section */}
              {readNotifications.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-muted/30 sticky top-0 z-10">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase">
                      Read ({readNotifications.length})
                    </h4>
                  </div>
                  <div className="divide-y">
                    {readNotifications.map(notif => (
                      <div
                        key={notif.id}
                        className="p-4 hover:bg-accent/50 transition-colors opacity-60"
                      >
                        <div className="flex gap-3 items-start">
                          <div className="text-2xl mt-1">
                            {getNotificationIcon(notif.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div
                              className={`text-sm border-l-2 pl-2 ${getNotificationColor(notif.type)}`}
                            >
                              <p>
                                {notif.message}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
