# Notification System - Local Setup Guide

## 🎯 What This Does

Automatically sends notifications for:
- 📅 **New bookings** → Notify managers and owners immediately
- 💰 **Payment reminders** → Alert staff 7, 3, and 1 day(s) before event
- ✅ **Payment received** → Confirm payment and cancel pending reminders
- ⚠️ **Overdue payments** → Alert owners on event day if still unpaid

## 🚀 Quick Setup (For Local Use)

### The notification system is already integrated!

When you create bookings, notifications are automatically:
- ✅ Sent immediately to managers and owners
- ✅ Scheduled for future payment reminders

### Processing Scheduled Notifications

You have **3 options** to process scheduled notifications:

#### Option 1: Manual Script (Recommended for Testing)
```bash
npm run process-notifications
```

Run this command whenever you want to process pending notifications. This is perfect for:
- Testing the system
- Processing notifications on-demand
- Running manually each day

#### Option 2: API Endpoint
```bash
# Call the endpoint directly
curl http://localhost:3000/api/cron/notifications
```

This calls the same processing logic through the API.

#### Option 3: Windows Task Scheduler (For Daily Automation)

Create a batch file `run-notifications.bat`:
```batch
@echo off
cd /d D:\Web\snr.v2\Blackbookv2
call npm run process-notifications
```

Then set up Windows Task Scheduler:
1. Open Task Scheduler
2. Create Basic Task
3. Name it "Process Booking Notifications"
4. Trigger: Daily at 8:00 AM
5. Action: Start a program
6. Program: `D:\Web\snr.v2\Blackbookv2\run-notifications.bat`
7. Finish

## 📋 Testing

### Test 1: View the Notification Bell
1. Log in to your app as Manager or Owner
2. Look at the **sidebar** - in the header area next to the Susings & Rufins logo
3. You should see a **bell icon** 🔔 with a badge showing unread count

### Test 2: Create a Booking
1. Create a new booking through your app
2. Click the **bell icon 🔔** in the sidebar header
3. Managers and Owners should see "New Booking Created" notification
4. Check the database:
   ```sql
   SELECT * FROM ScheduledNotification WHERE sent = false;
   ```
   You should see scheduled reminders for 7d, 3d, 1d before event

### Test 2: Process Notifications Manually
```bash
npm run process-notifications
```

This will:
- Find all notifications scheduled for today or earlier
- Send them to the appropriate users
- Mark them as sent

### Test 3: Payment Completion
1. Add a payment that completes the booking
2. Check that "Payment Received" notification was sent
3. Verify pending reminders were cancelled:
   ```sql
   SELECT * FROM ScheduledNotification
   WHERE bookingId = YOUR_BOOKING_ID AND sent = false;
   ```
   Should return no results

## 🎨 How It Works

```
NEW BOOKING CREATED
    ↓
✅ Immediate notification to Managers & Owners
✅ Schedule payment reminders for 7d, 3d, 1d before event

RUN NOTIFICATION PROCESSOR (Daily at 8 AM)
    ↓
✅ Checks for pending reminders due today
✅ Sends notifications
✅ Marks as sent

PAYMENT RECEIVED
    ↓
✅ Immediate notification to Managers & Owners
✅ Cancel all pending payment reminders
```

## 📊 Notification Timeline Example

**Booking Created:** March 1, 2024
**Event Date:** March 15, 2024

| Date | Action | What Happens |
|------|--------|--------------|
| Mar 1 | Booking created | ✉️ "New booking created" (immediate) |
| Mar 8 | Run processor | ⏰ "Payment pending - 7 days left" |
| Mar 12 | Run processor | ⚠️ "Urgent: Payment pending - 3 days left" |
| Mar 14 | Run processor | 🚨 "Critical: Payment due tomorrow" |
| Mar 15 | Run processor | ❌ "Payment overdue" (if still unpaid) |

**If paid on Mar 10:**
- ✅ "Payment received" notification sent immediately
- ❌ Mar 12, 14, 15 reminders cancelled automatically

## 🔍 Check What's Scheduled

### View pending notifications:
```sql
SELECT
  sn.id,
  b.eventName,
  sn.notificationType,
  sn.scheduledFor,
  sn.sent
FROM ScheduledNotification sn
JOIN Booking b ON sn.bookingId = b.id
WHERE sn.sent = false
ORDER BY sn.scheduledFor;
```

### View sent notification history:
```sql
SELECT
  sn.id,
  b.eventName,
  sn.notificationType,
  sn.scheduledFor,
  sn.sentAt
FROM ScheduledNotification sn
JOIN Booking b ON sn.bookingId = b.id
WHERE sn.sent = true
ORDER BY sn.sentAt DESC
LIMIT 20;
```

### View user notifications:
```sql
SELECT
  n.id,
  n.type,
  n.title,
  n.message,
  n.createdAt,
  e.firstName || ' ' || e.lastName as recipient
FROM Notification n
JOIN Employee e ON n.userId = e.id
WHERE n.type IN ('BOOKING', 'PAYMENT')
ORDER BY n.createdAt DESC
LIMIT 20;
```

## ⚙️ Configuration

### Change Notification Timing
Edit `lib/notification-scheduler.ts`:

```typescript
// Currently set to 8:00 AM
sevenDaysBefore.setHours(8, 0, 0, 0);

// Change to 9:30 AM
sevenDaysBefore.setHours(9, 30, 0, 0);
```

### Change Reminder Intervals
Edit `lib/notification-scheduler.ts`:

```typescript
// Add a 14-day reminder
const fourteenDaysBefore = new Date(eventDate);
fourteenDaysBefore.setDate(fourteenDaysBefore.getDate() - 14);
fourteenDaysBefore.setHours(8, 0, 0, 0);

if (fourteenDaysBefore > now) {
  scheduledNotifications.push({
    bookingId,
    notificationType: "PAYMENT_REMINDER_14",
    scheduledFor: fourteenDaysBefore,
  });
}
```

## 🐛 Troubleshooting

### "No notifications showing up"
1. Check if they were created:
   ```sql
   SELECT * FROM Notification ORDER BY createdAt DESC LIMIT 10;
   ```
2. Make sure you're logged in as Manager or Owner
3. Check the notification bell icon

### "Scheduled notifications not sending"
1. Run the processor manually:
   ```bash
   npm run process-notifications
   ```
2. Check for errors in the output
3. Verify notifications are scheduled for today or earlier:
   ```sql
   SELECT * FROM ScheduledNotification
   WHERE sent = false AND scheduledFor <= datetime('now');
   ```

### "Getting duplicate notifications"
1. Check for duplicate scheduled notifications:
   ```sql
   SELECT bookingId, notificationType, COUNT(*) as count
   FROM ScheduledNotification
   GROUP BY bookingId, notificationType
   HAVING COUNT(*) > 1;
   ```
2. Delete duplicates if found

## 📝 Daily Routine

### Manual Method
Each morning (or whenever you prefer):
```bash
npm run process-notifications
```

### Automated Method (Windows Task Scheduler)
Set it and forget it! The task scheduler will run it automatically every day at 8 AM.

## 📚 Files Reference

**Core Logic:**
- `lib/notification-scheduler.ts` - All notification functions

**Script:**
- `scripts/process-notifications.ts` - Manual processor script

**API:**
- `app/api/cron/notifications/route.ts` - API endpoint (optional)

**Integration:**
- `server/Booking/pushActions.ts` - Booking creation
- `server/Billing & Payments/pushActions.ts` - Payment handling

**Documentation:**
- `NOTIFICATION_SYSTEM.md` - Full technical documentation
- `NOTIFICATION_LOCAL_SETUP.md` - This file

## ✅ Quick Test Checklist

- [ ] Create a test booking
- [ ] Verify immediate notification appears for managers/owners
- [ ] Check database for scheduled reminders
- [ ] Run `npm run process-notifications` (should process 0 if none are due)
- [ ] Add a payment to complete the booking
- [ ] Verify payment notification was sent
- [ ] Confirm pending reminders were cancelled

## 🆘 Need Help?

1. Check `NOTIFICATION_SYSTEM.md` for detailed documentation
2. Run the processor script to see detailed output
3. Check the database tables: `ScheduledNotification` and `Notification`
4. Look for errors in your terminal/console

---

**You're all set!** 🚀 The notification system works automatically when you create bookings and process payments. Just remember to run the notification processor daily (manually or via Task Scheduler).
