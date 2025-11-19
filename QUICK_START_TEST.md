# 🚀 Quick Start - Test Your New System

## Step 1: Start the Development Server

```powershell
npm run dev
```

## Step 2: Login to Your App

Open `http://localhost:3000` and login with your credentials.

## Step 3: Watch the Console

Open Browser DevTools (F12) → Console tab

You should see:
```
✅ Synced X bookings to LocalStorage
📊 Booking system initialized
🔔 Notification system started
```

## Step 4: Check LocalStorage

1. Open DevTools → Application tab
2. Click LocalStorage → `http://localhost:3000`
3. Look for these keys:
   - `bookings` - Array of all bookings
   - `notifications` - Array of notifications
   - `notification_schedules` - Tracking which notifications were sent

## Step 5: Create a Test Booking

1. Go to **Bookings** → **Create New Booking**
2. Fill in all required fields
3. Click **Create Booking**

**Watch for:**
- ✅ Success toast: "Booking created successfully"
- 🔔 Notification toast: "New booking created: [Event Name]"
- 🔔 Bell icon shows badge with "1" unread

## Step 6: Check the Notification Bell

1. Click the **bell icon** in the sidebar
2. You should see your new booking notification
3. Click "Mark as Read" or the notification itself
4. Badge should disappear

## Step 7: View Dashboard Statistics

1. Go to **Dashboard**
2. See the **Booking Status Dashboard**
3. Watch the statistics update in real-time
4. Check "Recent Status Changes" section

## Step 8: Test Status Auto-Update

### Option A: Create an event happening NOW
1. Create a booking with:
   - Start time: Current time
   - End time: 1 hour from now
2. Wait 5-10 seconds
3. Status should change to "In Progress" (orange badge)
4. Check dashboard - stats update automatically

### Option B: Create a past event
1. Create a booking with:
   - Start time: Yesterday
   - End time: Yesterday + 3 hours
   - Down payment: 50% of total
2. Wait 5-10 seconds
3. Status should change to "Unpaid" (if not fully paid)
4. Or "Completed" (if fully paid)

## Step 9: Test Cross-Tab Sync

1. Open your app in 2 browser tabs
2. Create a booking in Tab 1
3. Switch to Tab 2
4. Bell notification should appear automatically
5. Dashboard stats should update

## Step 10: Test Payment Alerts (Advanced)

### Method 1: Change Device Date
1. Create a booking 7 days from today
2. Change your computer's date to 7 days ahead
3. Refresh the app
4. Wait 10-15 seconds
5. Toast should appear: "Payment reminder..."

### Method 2: Wait for Real Alerts
- Create bookings with future dates
- System will trigger alerts automatically at:
  - 7 days before event
  - 3 days before event
  - 1 day before event

---

## 🎯 Success Checklist

After completing the steps above, you should have:

- ✅ Bookings synced to LocalStorage
- ✅ Notification bell working with unread count
- ✅ Toast notifications appearing
- ✅ Dashboard showing live statistics
- ✅ Status auto-updates every 5 seconds
- ✅ Cross-tab synchronization working
- ✅ New booking notifications instant

---

## 🐛 Troubleshooting

### "Cannot find module" errors
```powershell
npm install
```

### TypeScript errors
```powershell
npm run type-check
```

### Build errors
```powershell
npm run build
```

### Clear LocalStorage (if needed)
1. DevTools → Application → LocalStorage
2. Right-click → Clear
3. Refresh page

---

## 📊 What to Monitor

### Console Logs to Watch:
```
✅ Synced X bookings to LocalStorage
📊 Status update completed: X changes detected
🔔 New notification: Payment reminder...
🔄 Cross-tab sync: Bookings updated
✅ Booking synced to offline system
```

### Bell Icon States:
- **No badge** = No unread notifications
- **Badge with number** = Unread notifications count
- **Red dot** = High priority notification

### Status Badge Colors:
- 🟡 **Yellow** = Pending
- 🟢 **Green** = Confirmed
- 🔵 **Blue** = In Progress
- ✅ **Emerald** = Completed
- 🔴 **Red** = Unpaid
- ⚫ **Gray** = Cancelled
- 🗃️ **Slate** = Archived

---

## 🎉 You're Ready!

Your offline booking system is now **fully operational**!

**Next Steps:**
- Create real bookings
- Monitor notifications
- Check dashboard daily
- Customize colors/intervals if needed

**Documentation:**
- `OFFLINE_BOOKING_SYSTEM_GUIDE.md` - Full guide
- `INTEGRATION_COMPLETE.md` - Integration details
- `BOOKING_STATUS_SYSTEM.md` - Status system docs (if exists)

---

**Happy Booking! 🎊**
