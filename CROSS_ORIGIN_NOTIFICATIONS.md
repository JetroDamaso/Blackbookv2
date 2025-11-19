# Cross-Origin Notification System Implementation

## Problem
Notifications were only showing in LocalStorage, which is isolated per origin. When accessing the app from different URLs (e.g., `localhost:3000` vs `192.168.1.18:3000`), notifications wouldn't sync across them because LocalStorage is domain-specific.

## Solution
Implemented a **database-backed notification system** that stores notifications in the database and polls for updates. This ensures notifications work across:
- Different devices
- Different browsers
- Different URLs/origins (localhost, IP address, domain name)
- Multiple tabs on different machines

## Changes Made

### 1. Server Action for Creating Notifications
**File:** `app/actions/createBookingNotification.ts` (NEW)
- Creates database notifications for all active employees when a booking is created
- Uses the existing `createBulkNotifications` function from `lib/notifications.ts`

### 2. Database Notifications Hook
**File:** `hooks/useDatabaseNotifications.ts` (NEW)
- Polls the `/api/notifications` endpoint every 10 seconds
- Shows toast notifications for new entries
- Handles mark as read, mark all as read operations
- Returns same interface as the old LocalStorage hook for easy migration

### 3. Updated NotificationBell Component
**File:** `components/NotificationBell.tsx` (MODIFIED)
- Now uses `useDatabaseNotifications` instead of `useNotifications` (LocalStorage)
- Updated notification type icons to match database types:
  - `BOOKING` → 📅
  - `PAYMENT` → 💰
  - `DISCOUNT_REQUEST` → 🎫
  - `DISCOUNT_RESPONSE` → ✅
  - `INVENTORY` → 📦
  - `SYSTEM` → ⚙️

### 4. Updated Booking Creation
**File:** `components/(Bookings)/(AddBookings)/page.tsx` (MODIFIED)
- Added import for `createBookingNotification` server action
- After creating booking and syncing to LocalStorage, now also creates database notification
- Extracts client name from either selected client or new client form data

## How It Works

### Notification Flow:
1. **User creates a booking** → Form submitted
2. **Booking saved to database** → API creates booking record
3. **LocalStorage sync** → `integrateNewBooking()` adds to LocalStorage (for offline features)
4. **Database notification** → `createBookingNotification()` creates notification records for all active employees
5. **Real-time polling** → `useDatabaseNotifications` hook polls every 10 seconds on all connected clients
6. **Toast display** → New notifications show as toast popups
7. **Bell icon update** → Unread count updates in the notification bell

### Cross-Origin Sync:
```
Device A (localhost:3000)        Database        Device B (192.168.1.18:3000)
        │                            │                        │
        │ 1. Create Booking          │                        │
        ├───────────────────────────>│                        │
        │                            │                        │
        │ 2. Save Notification       │                        │
        │                            │                        │
        │                            │ 3. Poll (every 10s)    │
        │                            │<───────────────────────┤
        │                            │                        │
        │                            │ 4. Return new notif    │
        │                            ├───────────────────────>│
        │                            │                        │
        │                            │ 5. Show toast 🔔       │
```

## API Endpoints Used

### GET `/api/notifications`
- Returns: `{ notifications: [], total: number, unreadCount: number, hasMore: boolean }`
- Fetches notifications for the current session user
- Ordered by createdAt DESC
- Limit: 50 notifications

### PATCH `/api/notifications`
- Body: `{ notificationIds: string[] }` OR `{ markAll: true }`
- Marks specified notifications as read
- Returns: `{ success: true }`

## Database Schema
The system uses the existing `Notification` model in Prisma:
```prisma
model Notification {
  id        String   @id @default(cuid())
  userId    String
  user      Employee @relation(...)
  type      String   // "BOOKING", "PAYMENT", etc.
  title     String
  message   String
  link      String?
  read      Boolean  @default(false)
  bookingId Int?
  clientId  Int?
  createdAt DateTime @default(now())
}
```

## Testing

### To test cross-origin notifications:
1. Open app on `http://localhost:3000` in one browser
2. Open app on `http://192.168.1.18:3000` in another browser (or same browser, different tab)
3. Login on both
4. Create a booking on localhost
5. Wait up to 10 seconds
6. **Expected:** Notification appears on both localhost AND 192.168.1.18 ✅

## Backward Compatibility
- LocalStorage system (`lib/local/*`) still works for offline features like:
  - Booking status updates
  - Client-side booking management
  - Offline-first capabilities
- The new database notification system **supplements** rather than replaces LocalStorage
- Both systems can coexist

## Performance Considerations
- **Polling interval:** 10 seconds (configurable)
- **Limit:** 50 most recent notifications per request
- **Network traffic:** ~1 request every 10 seconds per active user
- **Database queries:** Indexed on userId, read status, and createdAt

## Future Enhancements
Consider upgrading to WebSockets or Server-Sent Events (SSE) for:
- Instant real-time updates (no polling delay)
- Reduced server load (no repeated polling)
- Lower network traffic
- Better user experience

## Files Modified/Created

### New Files:
- `app/actions/createBookingNotification.ts`
- `hooks/useDatabaseNotifications.ts`
- `CROSS_ORIGIN_NOTIFICATIONS.md` (this file)

### Modified Files:
- `components/NotificationBell.tsx`
- `components/(Bookings)/(AddBookings)/page.tsx`

### Existing Files (Unchanged but Used):
- `app/api/notifications/route.ts` (existing API)
- `lib/notifications.ts` (existing helper functions)
- `prisma/schema.prisma` (existing Notification model)
