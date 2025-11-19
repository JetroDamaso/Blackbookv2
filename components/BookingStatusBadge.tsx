/**
 * BookingStatusBadge Component
 * Displays booking status with color coding
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { BOOKING_STATUS, BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS } from '@/lib/local/status-updater';

interface BookingStatusBadgeProps {
  status: number;
  className?: string;
}

const STATUS_VARIANTS = {
  yellow: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  blue: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  purple: 'bg-purple-100 text-purple-800 hover:bg-purple-100',
  green: 'bg-green-100 text-green-800 hover:bg-green-100',
  red: 'bg-red-100 text-red-800 hover:bg-red-100',
  gray: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
  slate: 'bg-slate-100 text-slate-800 hover:bg-slate-100',
} as const;

export function BookingStatusBadge({ status, className }: BookingStatusBadgeProps) {
  const label = BOOKING_STATUS_LABELS[status as keyof typeof BOOKING_STATUS_LABELS] || 'Unknown';
  const color = BOOKING_STATUS_COLORS[status as keyof typeof BOOKING_STATUS_COLORS] || 'gray';
  const variant = STATUS_VARIANTS[color as keyof typeof STATUS_VARIANTS];

  return (
    <Badge className={`${variant} ${className || ''}`}>
      {label}
    </Badge>
  );
}

/**
 * BookingStatusIcon Component
 * Icon representation of booking status
 */
export function BookingStatusIcon({ status, className }: { status: number; className?: string }) {
  let icon = '●';
  let colorClass = 'text-gray-500';

  switch (status) {
    case BOOKING_STATUS.PENDING:
      icon = '○';
      colorClass = 'text-yellow-500';
      break;
    case BOOKING_STATUS.CONFIRMED:
      icon = '◉';
      colorClass = 'text-blue-500';
      break;
    case BOOKING_STATUS.IN_PROGRESS:
      icon = '◉';
      colorClass = 'text-purple-500 animate-pulse';
      break;
    case BOOKING_STATUS.COMPLETED:
      icon = '✓';
      colorClass = 'text-green-500';
      break;
    case BOOKING_STATUS.UNPAID:
      icon = '⚠';
      colorClass = 'text-red-500';
      break;
    case BOOKING_STATUS.CANCELLED:
      icon = '✕';
      colorClass = 'text-gray-500';
      break;
    case BOOKING_STATUS.ARCHIVED:
      icon = '◌';
      colorClass = 'text-slate-400';
      break;
  }

  return (
    <span className={`font-bold ${colorClass} ${className || ''}`}>
      {icon}
    </span>
  );
}
