# Notification System - Quick Start Guide

## 🎯 What This Does

Automatically sends notifications for:
- 📅 **New bookings** → Notify managers and owners immediately
- 💰 **Payment reminders** → Alert staff 7, 3, and 1 day(s) before event
- ✅ **Payment received** → Confirm payment and cancel pending reminders
- ⚠️ **Overdue payments** → Alert owners on event day if still unpaid

## 🚀 Quick Setup (Local Setup)

### ✅ Already Installed!

The notification system is already integrated into your booking and payment workflows. No additional setup needed!

### 📋 How to Use

#### When you create a booking:
- ✅ Managers and Owners get notified immediately
- ✅ Payment reminders are automatically scheduled

#### To process scheduled reminders:

**Option 1: Run Manually (Simple)**
```bash
npm run process-notifications
```

**Option 2: Automate with Windows Task Scheduler**
1. Open Task Scheduler
2. Create Basic Task → Name: "Process Booking Notifications"
3. Trigger: Daily at 8:00 AM
4. Action: Start a program → Browse to `run-notifications.bat`
5. Finish

See `NOTIFICATION_LOCAL_SETUP.md` for detailed instructions.

## 📋 Testing

### Test Booking Notifications
1. Create a new booking through your app
2. Go to Notifications (bell icon)
3. Managers and Owners should see "New Booking Created" notification

### Test Scheduled Reminders
```bash
# Process any pending notifications
npm run process-notifications
```

### Check Database
```sql
-- See scheduled notifications
SELECT * FROM ScheduledNotification WHERE sent = false;

-- See sent notifications
SELECT * FROM ScheduledNotification WHERE sent = true ORDER BY sentAt DESC LIMIT 10;

-- See user notifications
SELECT * FROM Notification WHERE type IN ('BOOKING', 'PAYMENT') ORDER BY createdAt DESC LIMIT 10;
```

## 🎨 How It Works

```
NEW BOOKING CREATED
    ↓
✅ Immediate notification to Managers & Owners
✅ Schedule payment reminders for 7d, 3d, 1d before event

EVERY DAY AT 8:00 AM
    ↓
✅ Cron job checks for pending reminders
✅ Sends notifications if due today
✅ Marks as sent

PAYMENT RECEIVED
    ↓
✅ Immediate notification to Managers & Owners
✅ Cancel all pending payment reminders
```

## 📊 Notification Timeline Example

**Booking Created:** March 1, 2024
**Event Date:** March 15, 2024

| Date | Time | What Happens |
|------|------|--------------|
| Mar 1 | Immediately | ✉️ "New booking created" |
| Mar 8 | 8:00 AM | ⏰ "Payment pending - 7 days left" |
| Mar 12 | 8:00 AM | ⚠️ "Urgent: Payment pending - 3 days left" |
| Mar 14 | 8:00 AM | 🚨 "Critical: Payment due tomorrow" |
| Mar 15 | 8:00 AM | ❌ "Payment overdue" (if still unpaid) |

**If paid on Mar 10:**
- ✅ "Payment received" notification sent
- ❌ Mar 12, 14, 15 reminders cancelled

## 🔍 Monitoring

### Check Cron Job Status
1. Vercel Dashboard → Your Project → Deployments
2. Click on latest deployment
3. Go to "Functions" tab
4. Look for `/api/cron/notifications`

### Check Logs
```bash
# In Vercel dashboard
1. Click on a deployment
2. Go to "Functions" tab
3. Click on the notification cron function
4. View logs
```

### Check Notifications in App
1. Log in as Owner or Manager
2. Click bell icon (notifications)
3. Look for BOOKING or PAYMENT type notifications

## ⚙️ Configuration

### Change Notification Timing
Edit `lib/notification-scheduler.ts`:

```typescript
// Currently set to 8:00 AM
sevenDaysBefore.setHours(8, 0, 0, 0);

// Change to 9:30 AM
sevenDaysBefore.setHours(9, 30, 0, 0);
```

### Change Cron Schedule
Edit `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/notifications",
      "schedule": "0 9 * * *"  // 9:00 AM instead of 8:00 AM
    }
  ]
}
```

Cron format: `minute hour day month dayOfWeek`
- `0 8 * * *` = Every day at 8:00 AM
- `0 */6 * * *` = Every 6 hours
- `0 8,20 * * *` = 8:00 AM and 8:00 PM daily

## 🐛 Troubleshooting

### "Notifications not sending"
1. Check if booking was created successfully
2. Verify you're logged in as Manager or Owner
3. Check Notification table in database

### "Scheduled reminders not processing"
1. Run manually: `npm run process-notifications`
2. Check for errors in console output
3. Verify notifications are scheduled for today or earlier

### "Getting duplicate notifications"
```sql
-- Check for duplicates
SELECT bookingId, notificationType, COUNT(*)
FROM ScheduledNotification
GROUP BY bookingId, notificationType
HAVING COUNT(*) > 1;
```

## 📚 More Information

- **Local setup guide**: `NOTIFICATION_LOCAL_SETUP.md`
- **Full documentation**: `NOTIFICATION_SYSTEM.md`
- **Implementation details**: `NOTIFICATION_IMPLEMENTATION_SUMMARY.md`

## ✅ Daily Routine

**Manual Method:**
```bash
npm run process-notifications
```
Run this each morning or whenever you want to process reminders.

**Automated Method:**
Set up Windows Task Scheduler to run `run-notifications.bat` daily at 8 AM.

---

**Ready to go!** 🚀 Your notification system is ready for local use. Just run the processor script daily to send scheduled reminders!
