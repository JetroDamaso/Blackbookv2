# Offline Booking Status & Notifications System - Implementation Guide

## Overview

Complete **offline, browser-based** booking status and notification system using **LocalStorage + Client-Side Timers**. No cron jobs, no backend schedulers, no internet required.

---

## 🎯 Features

### Booking Status (Automatic Transitions)
- ✅ **Pending (1)** - Created, no payment
- ✅ **Confirmed (2)** - Down payment received
- ✅ **In Progress (3)** - Event happening now
- ✅ **Completed (4)** - Ended with full payment
- ✅ **Unpaid (5)** - Ended with balance remaining
- ✅ **Cancelled (6)** - Manually cancelled
- ✅ **Archived (7)** - Old bookings

### Notifications (Browser Toasts)
- ✅ **New Booking Created** - Instant notification
- ✅ **Payment Alert - 1 Week Before** - Auto-triggered
- ✅ **Payment Alert - 3 Days Before** - Auto-triggered
- ✅ **Payment Alert - 1 Day Before** - Auto-triggered
- ✅ **Unpaid Reminder** - Every 3 days for unpaid bookings

---

## 📁 Files Created

```
lib/local/
├── storage.ts                  # LocalStorage manager
├── status-updater.ts           # Status transition logic
├── notification-checker.ts     # Notification scheduling
└── integration.ts              # Database sync helpers

hooks/
├── useBookingStatusUpdater.ts  # React hook for status updates
└── useNotifications.ts         # React hook for notifications

components/
├── BookingSystemProvider.tsx   # Global provider (runs timers)
├── BookingStatusBadge.tsx      # Status badge component
├── NotificationBell.tsx        # Notification bell dropdown
└── BookingStatusDashboard.tsx  # Status dashboard widget
```

---

## 🚀 Quick Start

### Step 1: Wrap Your App with Provider

Add the `BookingSystemProvider` to your root layout:

```tsx
// app/layout.tsx
import { BookingSystemProvider } from '@/components/BookingSystemProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <BookingSystemProvider
          statusUpdateInterval={5000}        // Check statuses every 5 seconds
          notificationCheckInterval={10000}  // Check notifications every 10 seconds
          enableStatusUpdates={true}
          enableNotifications={true}
          showToasts={true}
        >
          {children}
        </BookingSystemProvider>
      </body>
    </html>
  );
}
```

### Step 2: Add Notification Bell to Navigation

```tsx
// components/app-sidebar.tsx or navigation component
import { NotificationBell } from '@/components/NotificationBell';

export function AppSidebar() {
  return (
    <div className="flex items-center gap-4">
      <NotificationBell />
      {/* Other navigation items */}
    </div>
  );
}
```

### Step 3: Integrate with Booking Creation

Update your booking creation code to sync with LocalStorage:

```tsx
// In your booking creation function
import { integrateNewBooking } from '@/lib/local/integration';

async function createBooking(data: BookingData) {
  // 1. Create booking in database
  const booking = await createBookingMutation.mutateAsync(data);

  // 2. Create billing record
  const billing = await createBillingMutation.mutateAsync({
    bookingId: booking.id,
    originalPrice: totalPrice,
    balance: totalPrice - downPayment,
    // ... other billing data
  });

  // 3. Sync to LocalStorage (triggers notification)
  await integrateNewBooking({
    id: booking.id,
    eventName: data.eventName,
    startAt: data.startAt,
    endAt: data.endAt,
    clientId: data.clientId,
    pavilionId: data.pavilionId,
    billing: {
      balance: billing.balance,
      originalPrice: billing.originalPrice,
    },
    createdAt: booking.createdAt,
  });

  console.log('Booking created and synced to LocalStorage!');
}
```

### Step 4: Sync Existing Bookings on App Load

Add this to your root component or dashboard:

```tsx
'use client';

import { useEffect } from 'react';
import { syncAllBookings } from '@/lib/local/integration';
import { useQuery } from '@tanstack/react-query';

export function BookingSync() {
  const { data: bookings } = useQuery({
    queryKey: ['allBookings'],
    queryFn: () => getAllBookingsFromDatabase(),
  });

  useEffect(() => {
    if (bookings && bookings.length > 0) {
      syncAllBookings(bookings);
      console.log(`Synced ${bookings.length} bookings to LocalStorage`);
    }
  }, [bookings]);

  return null; // This is a sync component, no UI
}
```

### Step 5: Display Status Dashboard

Add the dashboard to your admin panel:

```tsx
// app/dashboard/page.tsx
import { BookingStatusDashboard } from '@/components/BookingStatusDashboard';

export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      <BookingStatusDashboard />
    </div>
  );
}
```

---

## 🔧 Configuration Options

### Status Update Interval

```tsx
<BookingSystemProvider statusUpdateInterval={5000}> // 5 seconds (default)
<BookingSystemProvider statusUpdateInterval={1000}> // 1 second (more responsive)
<BookingSystemProvider statusUpdateInterval={30000}> // 30 seconds (less frequent)
```

### Notification Check Interval

```tsx
<BookingSystemProvider notificationCheckInterval={10000}> // 10 seconds (default)
<BookingSystemProvider notificationCheckInterval={30000}> // 30 seconds
```

### Disable Features

```tsx
<BookingSystemProvider
  enableStatusUpdates={false}  // Disable auto status updates
  enableNotifications={false}  // Disable notifications
  showToasts={false}          // Disable toast notifications
>
```

---

## 📊 Using Status Badges

Display booking status anywhere:

```tsx
import { BookingStatusBadge } from '@/components/BookingStatusBadge';

<BookingStatusBadge status={booking.status} />
```

---

## 🔔 Manual Notification Triggers

You can manually trigger notifications:

```tsx
import { sendNewBookingNotification } from '@/lib/local/notification-checker';
import { getLocalBookings } from '@/lib/local/storage';

// Send notification for a specific booking
const booking = getLocalBookings().find(b => b.id === bookingId);
if (booking) {
  sendNewBookingNotification(booking);
}
```

---

## 🧪 Testing

### Test Status Transitions

1. Change your device time to test date-based transitions
2. Check console logs for status changes
3. Verify notifications appear at correct times

### Test Notifications

1. Create a booking
2. Verify "New Booking" notification appears
3. Change device date to 7 days before event
4. Wait for payment alert notification

### Test Offline Mode

1. Disconnect from internet
2. Create bookings (they'll sync to LocalStorage)
3. Status updates and notifications still work
4. Reconnect to sync with database

---

## 🔒 Security Notes

- All data stored in browser LocalStorage
- No external API calls for status/notifications
- Data persists across browser sessions
- User can clear LocalStorage to reset

---

## 📱 Cross-Tab Synchronization

The system automatically syncs across browser tabs using:
- `storage` events
- Custom events (`bookings-updated`, `notifications-updated`)

Open multiple tabs and changes will sync in real-time!

---

## 🎨 Customization

### Custom Status Colors

Edit `lib/local/status-updater.ts`:

```tsx
export const BOOKING_STATUS_COLORS = {
  [BOOKING_STATUS.PENDING]: 'orange', // Change from 'yellow'
  // ... other statuses
};
```

### Custom Notification Messages

Edit `lib/local/notification-checker.ts`:

```tsx
message: `Custom message for ${booking.eventName}`,
```

---

## 🐛 Troubleshooting

### Status not updating?
- Check browser console for logs
- Verify `BookingSystemProvider` is in root layout
- Check `statusUpdateInterval` setting

### Notifications not showing?
- Check if `showToasts={true}` is set
- Verify sonner Toaster is rendered
- Check browser notification permissions (not required but good to have)

### Data not syncing?
- Call `syncAllBookings()` on app load
- Check `integrateNewBooking()` is called after booking creation
- Verify LocalStorage is enabled in browser

---

## 📈 Performance

- Minimal CPU usage (timers run every 5-10 seconds)
- Lightweight LocalStorage operations
- No network requests for status/notifications
- Suitable for 1000+ bookings

---

## 🎯 Next Steps

1. ✅ Install dependencies (sonner, date-fns)
2. ✅ Add provider to root layout
3. ✅ Add notification bell to navigation
4. ✅ Integrate with booking creation
5. ✅ Sync existing bookings
6. ✅ Test and customize

---

## 📞 Support

For issues or questions, check:
- Browser console logs (detailed logging enabled)
- LocalStorage inspector (DevTools → Application → LocalStorage)
- Component props and configuration
