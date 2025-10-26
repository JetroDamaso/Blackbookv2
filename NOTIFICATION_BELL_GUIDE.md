# Notification Bell - Visual Guide

## 📍 Where to Find It

The notification bell icon is located in the **sidebar header**, right next to the Susings and Rufins logo.

```
┌─────────────────────────┐
│ [Logo]            🔔 (3) │  ← Sidebar Header
├─────────────────────────┤
│ Daily Operations        │
│  📅 Home                │
│  📖 Bookings            │
│  👥 Clients             │
│                         │
│ Facilities & Resources  │
│  🏰 Pavilion            │
│  📦 Packages            │
└─────────────────────────┘

[Logo] = Susings and Rufins Logo
🔔 (3) = Notification bell with unread count badge
```

## 🎯 What You'll See

### When Logged In (Manager/Owner):
- **Bell Icon** 🔔 in the top-right corner
- **Red Badge** with number showing unread notifications (e.g., "3")
- **Dropdown** when you click the bell showing recent notifications

### Example Notifications:

#### Booking Created:
```
┌────────────────────────────────────────┐
│ 📅 New Booking Created                 │
│ New booking created: Birthday Party    │
│ on March 15, 2025 by John Doe         │
│ Just now                               │
└────────────────────────────────────────┘
```

#### Payment Reminder:
```
┌────────────────────────────────────────┐
│ 💰 Urgent: Payment Pending             │
│ Urgent: Payment pending for Jane       │
│ Smith's booking on March 15, 2025.    │
│ Total: ₱50,000                         │
│ 2 hours ago                            │
└────────────────────────────────────────┘
```

#### Payment Received:
```
┌────────────────────────────────────────┐
│ ✅ Payment Received                    │
│ Payment received: ₱50,000 from Jane    │
│ Smith for booking on March 15, 2025   │
│ 5 minutes ago                          │
└────────────────────────────────────────┘
```

## 📱 How to Use

### Opening Notifications:
1. Click the **bell icon** 🔔 in the top-right corner
2. A dropdown appears showing your recent notifications
3. Unread notifications are highlighted

### Reading a Notification:
1. Click on any notification in the dropdown
2. It will mark as read and navigate to the related page (if applicable)
3. The unread count badge decreases

### Marking All as Read:
1. Open the notifications dropdown
2. Click the **"Mark all as read"** button at the top
3. All notifications are marked as read

### Refreshing Notifications:
- The bell icon automatically checks for new notifications every 30 seconds
- You can also manually refresh by closing and reopening the dropdown

## 🎨 Visual States

### No Unread Notifications:
```
🔔  ← Bell icon (no badge)
```

### With Unread Notifications:
```
🔔 (5)  ← Bell icon with red badge showing count
```

### Dropdown Open:
```
🔔 (3)
  ↓
┌──────────────────────────────────────┐
│ Notifications               [✓] Mark all│
├──────────────────────────────────────┤
│ 📅 New Booking Created               │
│ New booking: Birthday Party...       │
│ Just now                        •    │ ← Blue dot = unread
├──────────────────────────────────────┤
│ 💰 Payment Pending                   │
│ Payment pending: Wedding on...       │
│ 2 hours ago                     •    │
├──────────────────────────────────────┤
│ ✅ Payment Received                  │
│ Payment: ₱25,000 from...             │
│ Yesterday                            │ ← No dot = read
└──────────────────────────────────────┘
```

## 🔔 Notification Types & Icons

| Type | Icon | When You'll See It |
|------|------|-------------------|
| Booking Created | 📅 | Immediately when new booking is created |
| Payment Reminder (7d) | 💰 | 7 days before event |
| Payment Reminder (3d) | ⚠️ | 3 days before event |
| Payment Reminder (1d) | 🚨 | 1 day before event |
| Payment Overdue | ❌ | On event day if still unpaid |
| Payment Received | ✅ | When payment is completed |

## 👥 Who Sees What

### Managers & Owners:
- ✅ All booking creation notifications
- ✅ All payment reminders (7d, 3d, 1d)
- ✅ All payment received notifications

### Owners Only:
- ✅ Payment overdue notifications (on event day)

### Other Roles:
- ❌ Do not receive these automated notifications
- (Only receive notifications relevant to their role)

## 💡 Pro Tips

1. **Check regularly**: The badge shows how many unread notifications you have
2. **Auto-refresh**: New notifications appear automatically every 30 seconds
3. **Click to view**: Clicking a notification marks it as read
4. **Quick access**: The bell is always visible at the top-right
5. **Mobile friendly**: Works on mobile devices too

## 🎯 Common Scenarios

### Scenario 1: New booking arrives while you're working
1. You'll see the badge number increase (e.g., 🔔 (1) becomes 🔔 (2))
2. Click the bell to see the new booking notification
3. Click the notification to go to the booking details

### Scenario 2: Checking payment status
1. Click the bell icon
2. Look for payment-related notifications (💰, ⚠️, 🚨, ✅)
3. Recent notifications show at the top

### Scenario 3: End of day review
1. Click the bell to see all notifications from today
2. Review any pending payments or new bookings
3. Mark all as read when done

## 🔍 Troubleshooting

### "I don't see the bell icon"
- ✅ Make sure you're logged in
- ✅ Check if you're logged in as Manager or Owner
- ✅ Refresh the page
- ✅ Check browser console for errors

### "The badge count doesn't update"
- ✅ Wait 30 seconds for auto-refresh
- ✅ Close and reopen the dropdown
- ✅ Refresh the page

### "Notifications aren't showing"
- ✅ Create a test booking to generate a notification
- ✅ Run `npm run process-notifications` to process scheduled ones
- ✅ Check database: `SELECT * FROM Notification ORDER BY createdAt DESC LIMIT 10;`

---

**The notification bell is your central hub for staying updated on bookings and payments!** 🔔
