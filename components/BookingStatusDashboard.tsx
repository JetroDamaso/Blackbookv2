/**
 * BookingStatusDashboard
 * Real-time dashboard showing booking status statistics
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBookingStatusUpdater } from '@/hooks/useBookingStatusUpdater';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Ban,
  Archive,
  PlayCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function BookingStatusDashboard() {
  const { stats, lastUpdate, changeHistory } = useBookingStatusUpdater();

  const statusCards = [
    {
      title: 'Pending',
      count: stats.pending,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      description: 'No payment received',
    },
    {
      title: 'Confirmed',
      count: stats.confirmed,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Down payment made',
    },
    {
      title: 'In Progress',
      count: stats.inProgress,
      icon: PlayCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Event happening now',
    },
    {
      title: 'Completed',
      count: stats.completed,
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Fully paid & finished',
    },
    {
      title: 'Unpaid',
      count: stats.unpaid,
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      description: 'Balance remaining',
    },
    {
      title: 'Cancelled',
      count: stats.cancelled,
      icon: Ban,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      description: 'Manually cancelled',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Booking Status Dashboard</h2>
        <div className="text-sm text-muted-foreground">
          Last updated: {formatDistanceToNow(lastUpdate, { addSuffix: true })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statusCards.map(card => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="overflow-hidden">
              <CardHeader className={`pb-3 ${card.bgColor}`}>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-lg">{card.title}</span>
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className={`text-3xl font-bold ${card.color}`}>
                  {card.count}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Status Changes</CardTitle>
        </CardHeader>
        <CardContent>
          {changeHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No recent status changes
            </p>
          ) : (
            <div className="space-y-2">
              {changeHistory.slice(0, 10).map((change, index) => (
                <div
                  key={`${change.bookingId}-${change.timestamp}-${index}`}
                  className="flex items-center justify-between text-sm p-2 rounded-lg bg-accent/50"
                >
                  <span>
                    Booking #{change.bookingId}
                  </span>
                  <span className="text-muted-foreground">
                    {formatDistanceToNow(new Date(change.timestamp), { addSuffix: true })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Bookings</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Bookings</p>
              <p className="text-2xl font-bold">
                {stats.pending + stats.confirmed + stats.inProgress}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Needs Attention</p>
              <p className="text-2xl font-bold text-red-600">
                {stats.unpaid}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Archived</p>
              <p className="text-2xl font-bold text-gray-600">
                {stats.archived}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
