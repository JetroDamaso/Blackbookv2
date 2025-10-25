# Booking Status System

## Overview
The booking status system automatically manages booking statuses based on payment status and event dates.

## Status Codes

| Status Code | Status Name | Description |
|------------|-------------|-------------|
| 1 | **Pending** | No payments have been made yet |
| 2 | **Confirmed** | Has at least one payment, event hasn't started |
| 3 | **In Progress** | Event is happening today (current date is between start and end date) |
| 4 | **Completed** | Event date has passed AND payment is fully paid |
| 5 | **Unpaid** | Event date has passed AND payment is NOT fully paid |
| 6 | **Canceled** | Booking has been canceled (manual status) |
| 7 | **Archived** | Booking has been archived (manual status) |
| 8 | **Draft** | Booking is still being drafted/incomplete (manual status) |

## How It Works

### Automatic Status Updates

The booking status is automatically updated in the following scenarios:

1. **When a billing is created** - Updates the booking status based on initial deposit/payment
2. **When a payment is added** - Immediately updates the booking status
3. **Manual bulk update** - Can update all booking statuses at once

### Status Calculation Logic

The status is calculated based on three factors:

1. **Payment Status**
   - `hasPayments`: Whether any payments exist
   - `isFullyPaid`: Whether total payments >= total billing amount

2. **Event Timing**
   - `isToday`: Current date is between event start and end date
   - `isPast`: Current date is after event end date

3. **Priority Order**
   ```
   1. If event is today → Status 3 (In Progress)
   2. If event is past AND fully paid → Status 4 (Completed)
   3. If event is past AND not fully paid → Status 5 (Unpaid)
   4. If has payments → Status 2 (Confirmed)
   5. Otherwise → Status 1 (Pending)

   Note: Statuses 6 (Canceled), 7 (Archived), and 8 (Draft) are manual statuses
   that must be set explicitly and won't be automatically calculated.
   ```

## Implementation Files

- `server/Booking/helpers.ts` - Status calculation logic
- `server/Booking/pushActions.ts` - Update functions
  - `updateBookingStatus(bookingId)` - Update single booking
  - `updateAllBookingStatuses()` - Update all bookings
- `server/Billing & Payments/pushActions.ts` - Auto-update on payment creation
- `components/BookingStatusInitializer.tsx` - Automatic status updates (runs on startup + hourly)
- `app/layout.tsx` - Includes the BookingStatusInitializer component
- `lib/constants/bookingStatus.ts` - Status constants, labels, and colors

## Usage

### Update Single Booking Status
```typescript
import { updateBookingStatus } from "@/server/Booking/pushActions";

await updateBookingStatus(bookingId);
```

### Update All Booking Statuses
```typescript
import { updateAllBookingStatuses } from "@/server/Booking/pushActions";

const result = await updateAllBookingStatuses();
console.log(`Updated ${result.updatedCount} bookings`);
```

### Using Status Constants
```typescript
import { BOOKING_STATUS, BOOKING_STATUS_LABELS, isManualStatus } from "@/lib/constants/bookingStatus";

// Check status
if (booking.status === BOOKING_STATUS.CONFIRMED) {
  console.log("Booking is confirmed!");
}

// Get status label
const statusLabel = BOOKING_STATUS_LABELS[booking.status];

// Check if manual status
if (isManualStatus(booking.status)) {
  console.log("This is a manual status and won't be auto-updated");
}

// Set to canceled
await updateBooking(bookingId, { status: BOOKING_STATUS.CANCELED });
```

### Manual Trigger
The system is configured to automatically trigger `updateAllBookingStatuses()`:
- ✅ **On application startup** - Runs when the app loads
- ✅ **Every hour** - Automatically refreshes all booking statuses
- 📍 Implemented in `components/BookingStatusInitializer.tsx`

You can also manually call it from:
- A cron job (for redundancy)
- An admin panel button (for on-demand updates)
- Via API endpoint (for external triggers)

## Example Status Flow

### New Booking
1. Booking created → **Status 1 (Pending)**
2. First payment added → **Status 2 (Confirmed)**
3. Event day arrives → **Status 3 (In Progress)**
4. Event ends + fully paid → **Status 4 (Completed)**

### Unpaid Booking
1. Booking created → **Status 1 (Pending)**
2. Partial payment added → **Status 2 (Confirmed)**
3. Event day arrives → **Status 3 (In Progress)**
4. Event ends + NOT fully paid → **Status 5 (Unpaid)**

## Notes

- ✅ **Automatic updates**: Status updates happen automatically when payments are added
- ✅ **Hourly refresh**: All booking statuses are updated every hour via `BookingStatusInitializer`
- ✅ **Startup sync**: Statuses are synchronized when the application starts
- ⚠️ Bookings with no start/end dates cannot have their status updated
- 📅 The system is date-aware and will automatically transition bookings to "In Progress" or "Completed/Unpaid" based on the current date
- 🔍 Check browser console for status update logs (visible in development mode)
- 📝 **Manual statuses**: Statuses 6 (Canceled), 7 (Archived), and 8 (Draft) must be set manually and won't be automatically changed by the system
