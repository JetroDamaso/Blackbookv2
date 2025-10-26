# Booking Notification System

## Overview

The booking notification system provides automated alerts for booking creation and payment deadline reminders. This system helps ensure timely payments and keeps managers and owners informed about booking status.

## Features

### 1. Booking Creation Notifications
When a new booking is created:
- Immediate notifications sent to all Managers and Owners
- Includes event name, date, and creator information
- Helps staff stay informed about new bookings

### 2. Payment Reminder Notifications
Automated reminders scheduled at strategic intervals before the event date:
- **7 days before**: Initial reminder about pending payment
- **3 days before**: Urgent reminder about approaching deadline
- **1 day before**: Critical reminder that payment is due soon
- **Event day**: Overdue notification (only if still unpaid)

### 3. Payment Completion Notifications
When a payment is received:
- Notifications sent to all Managers and Owners
- Shows payment amount and client information
- Automatically cancels all pending payment reminders

## Technical Architecture

### Database Schema

#### ScheduledNotification Model
```prisma
model ScheduledNotification {
  id               String   @id @default(cuid())
  bookingId        Int
  booking          Booking  @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  notificationType String   // PAYMENT_REMINDER_7, PAYMENT_REMINDER_3, etc.
  scheduledFor     DateTime
  sent             Boolean  @default(false)
  sentAt           DateTime?
  createdAt        DateTime @default(now())

  @@index([bookingId])
  @@index([scheduledFor, sent])
}
```

### Notification Types

| Type | When Sent | Recipients |
|------|-----------|------------|
| `BOOKING_CREATED` | Immediately when booking is created | Managers & Owners |
| `PAYMENT_REMINDER_7` | 7 days before event | Managers & Owners |
| `PAYMENT_REMINDER_3` | 3 days before event | Managers & Owners |
| `PAYMENT_REMINDER_1` | 1 day before event | Managers & Owners |
| `PAYMENT_OVERDUE` | On event day (if unpaid) | Owners only |
| `PAYMENT_COMPLETED` | When payment is received | Managers & Owners |

### Core Functions

#### `scheduleBookingNotifications(bookingId: number)`
- Schedules payment reminder notifications for a booking
- Calculates notification dates based on event start date
- Creates ScheduledNotification records in database
- Only schedules notifications for future dates

#### `sendBookingCreatedNotifications(bookingId: number)`
- Sends immediate notification when booking is created
- Creates Notification records for Managers and Owners
- Includes booking details and creator information

#### `sendPaymentCompletedNotifications(bookingId: number, paymentAmount: number)`
- Sends notification when payment is received
- Shows payment amount and client information
- Notifies Managers and Owners

#### `cancelPaymentReminders(bookingId: number)`
- Deletes all pending payment reminder notifications
- Called automatically when full payment is received
- Prevents duplicate reminders after payment

#### `processPendingNotifications()`
- Processes all scheduled notifications that are due
- Called daily by cron job
- Checks if payments are still pending before sending overdue notices
- Marks notifications as sent after delivery

## Integration Points

### Booking Creation
File: `server/Booking/pushActions.ts`

```typescript
// After creating booking
await scheduleBookingNotifications(data.id);
await sendBookingCreatedNotifications(data.id);
```

### Payment Processing
File: `server/Billing & Payments/pushActions.ts`

```typescript
// After payment is recorded
const isFullyPaid = totalPaid >= billing.discountedPrice;
if (isFullyPaid) {
  await sendPaymentCompletedNotifications(bookingId, amount);
  await cancelPaymentReminders(bookingId);
}
```

### Cron Job
File: `app/api/cron/notifications/route.ts`

Daily cron job that processes pending notifications.

## Setup Instructions

### 1. Environment Variables
Add to `.env`:
```bash
CRON_SECRET="your-secure-random-secret-here"
```

Generate a secure secret:
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or use any secure random string generator
```

### 2. Database Migration
The migration has already been applied:
```bash
npx prisma migrate dev --name add_scheduled_notifications
```

### 3. Vercel Cron Configuration
Create or update `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/notifications",
      "schedule": "0 8 * * *"
    }
  ]
}
```

This runs the notification processor daily at 8:00 AM UTC.

### 4. Local Testing
To test the cron job locally:

```bash
# Make sure CRON_SECRET is set in .env
curl -H "Authorization: Bearer your-secure-random-secret-here" \
  http://localhost:3000/api/cron/notifications
```

## Notification Timing

### Scheduling Logic
- All reminders are scheduled for 8:00 AM local time
- Only schedules notifications for dates in the future
- Payment deadline is the event start date (`booking.startAt`)

### Example Timeline
For a booking with event date: **March 15, 2024**

| Date | Time | Notification |
|------|------|--------------|
| Immediately | On creation | Booking created |
| March 8, 2024 | 8:00 AM | 7-day reminder |
| March 12, 2024 | 8:00 AM | 3-day reminder |
| March 14, 2024 | 8:00 AM | 1-day reminder |
| March 15, 2024 | 8:00 AM | Overdue notice (if unpaid) |

## Monitoring

### Check Scheduled Notifications
```typescript
// Get pending notifications for a booking
const pending = await prisma.scheduledNotification.findMany({
  where: {
    bookingId: bookingId,
    sent: false
  },
  orderBy: { scheduledFor: 'asc' }
});
```

### Check Sent Notifications
```typescript
// Get notification history
const history = await prisma.scheduledNotification.findMany({
  where: {
    bookingId: bookingId,
    sent: true
  },
  orderBy: { sentAt: 'desc' }
});
```

### View Recent Notifications
```typescript
// Check what notifications were sent in the last 24 hours
const recentNotifications = await prisma.notification.findMany({
  where: {
    createdAt: {
      gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
    },
    type: { in: ['BOOKING', 'PAYMENT'] }
  },
  include: {
    user: {
      select: { firstName: true, lastName: true }
    }
  },
  orderBy: { createdAt: 'desc' }
});
```

## Troubleshooting

### Notifications Not Sending

1. **Check if notifications are scheduled**:
   ```typescript
   const scheduled = await prisma.scheduledNotification.count({
     where: { sent: false }
   });
   console.log(`Pending notifications: ${scheduled}`);
   ```

2. **Check cron job logs**:
   - In Vercel: Go to your deployment > Functions > Cron Jobs
   - Look for errors in the notification processing

3. **Verify CRON_SECRET**:
   - Ensure it's set in environment variables
   - Ensure it matches in both `.env` and Vercel settings

### Notifications Sending Multiple Times

1. **Check for duplicate scheduled notifications**:
   ```typescript
   const duplicates = await prisma.scheduledNotification.groupBy({
     by: ['bookingId', 'notificationType'],
     having: {
       bookingId: { _count: { gt: 1 } }
     }
   });
   ```

2. **Verify sent status is being updated**:
   - Check that `sent: true` and `sentAt` are set after sending

### Payment Reminders Still Sending After Payment

1. **Verify payment completion logic**:
   ```typescript
   // Check if cancelPaymentReminders was called
   const pendingReminders = await prisma.scheduledNotification.count({
     where: {
       bookingId: bookingId,
       sent: false,
       notificationType: {
         in: ['PAYMENT_REMINDER_7', 'PAYMENT_REMINDER_3',
              'PAYMENT_REMINDER_1', 'PAYMENT_OVERDUE']
       }
     }
   });
   console.log(`Pending reminders: ${pendingReminders}`);
   ```

## Future Enhancements

Potential improvements to consider:

1. **Email Notifications**: Send email notifications to clients
2. **SMS Integration**: Send SMS reminders for critical deadlines
3. **Customizable Schedules**: Allow admins to configure reminder timing
4. **Notification Preferences**: Let users choose which notifications they receive
5. **Client Portal**: Allow clients to view and manage their booking notifications
6. **Notification Templates**: Customizable message templates
7. **Multi-language Support**: Notifications in different languages

## API Reference

### POST /api/cron/notifications
Processes all pending scheduled notifications.

**Authentication**: Requires `Authorization: Bearer <CRON_SECRET>` header

**Response**:
```json
{
  "success": true,
  "message": "Processed 5 notifications",
  "processed": 5
}
```

**Error Response**:
```json
{
  "error": "Unauthorized"
}
```

## Best Practices

1. **Always use try-catch blocks** when calling notification functions
2. **Don't throw errors** that would prevent booking/payment creation
3. **Log notification errors** for debugging but continue processing
4. **Monitor notification delivery** regularly
5. **Keep CRON_SECRET secure** and rotate it periodically
6. **Test notification logic** before deploying to production
7. **Document any changes** to notification timing or logic

## Related Files

- `lib/notification-scheduler.ts` - Core notification scheduling logic
- `app/api/cron/notifications/route.ts` - Cron job endpoint
- `server/Booking/pushActions.ts` - Booking creation integration
- `server/Billing & Payments/pushActions.ts` - Payment integration
- `prisma/schema.prisma` - Database schema
- `vercel.json` - Cron job configuration

## Support

For issues or questions about the notification system:
1. Check the logs in the notification scheduler
2. Verify database records in `ScheduledNotification` table
3. Check the cron job execution logs
4. Review this documentation for troubleshooting steps
