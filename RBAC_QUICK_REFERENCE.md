# RBAC Quick Reference Card

## 🚀 Quick Start

### Import What You Need

```tsx
// Permission checks in components
import { RoleGuard, PermissionButton, RequireOwner } from '@/components/auth';

// Permission checks in API routes
import { hasPermission } from '@/lib/permissions';

// Activity logging
import { logActivity } from '@/lib/activity-log';

// Notifications
import { createNotification, notifyDiscountApproved } from '@/lib/notifications';

// UI Components
import { NotificationBell } from '@/components/notifications';
import { RequestDiscountModal } from '@/components/discounts/RequestDiscountModal';
import { EmployeeRoleBadge } from '@/components/employees';
```

---

## 🔐 Permission Checks

### In React Components

```tsx
// Hide content from unauthorized users
<RoleGuard permission="employees:delete">
  <DeleteButton />
</RoleGuard>

// Smart button that auto-disables
<PermissionButton
  permission="clients:create"
  onClick={handleCreate}
>
  Add Client
</PermissionButton>

// Owner-only content
<RequireOwner>
  <SensitiveSettings />
</RequireOwner>

// Manager or Owner only
<RequireManagerOrOwner>
  <Reports />
</RequireManagerOrOwner>
```

### In API Routes

```tsx
import { getServerSession } from 'next-auth';
import { hasPermission } from '@/lib/permissions';

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);

  // Check authentication
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check permission
  if (!hasPermission(session.user.role as any, 'clients:delete')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Your logic here...
}
```

---

## 📊 Available Permissions

### Employees
- `employees:create`, `employees:read`, `employees:update`, `employees:delete`
- `employees:manage-roles` (Owner only)

### Bookings
- `bookings:create`, `bookings:read`, `bookings:update`, `bookings:delete`
- `bookings:cancel`

### Discounts
- `discounts:request` (All roles can request)
- `discounts:approve`, `discounts:reject` (Owner only)
- `discounts:view-all` (Owner, Manager)

### Payments
- `payments:create`, `payments:read`, `payments:update`, `payments:delete`
- `payments:refund` (Owner only)

### Clients
- `clients:create`, `clients:read`, `clients:update`, `clients:delete`

### Resources
- `event-types:create`, `event-types:read`, `event-types:update`, `event-types:delete`
- `pavilions:create`, `pavilions:read`, `pavilions:update`, `pavilions:delete`
- `packages:create`, `packages:read`, `packages:update`, `packages:delete`

### Inventory
- `inventory:create`, `inventory:read`, `inventory:update`, `inventory:delete`

### Reports
- `reports:view`, `reports:export` (Owner, Manager only)

### Settings
- `settings:view`, `settings:update` (Owner only for update)

### Activity Logs
- `activity-logs:view` (Owner only)

---

## 👥 Role Permission Matrix

| Permission | Owner | Manager | Front Desk |
|-----------|-------|---------|------------|
| Manage Employees | ✅ | ❌ | ❌ |
| View Employees | ✅ | ✅ | ❌ |
| Create Bookings | ✅ | ✅ | ✅ |
| Delete Bookings | ✅ | ❌ | ❌ |
| Request Discounts | ✅ | ✅ | ✅ |
| Approve Discounts | ✅ | ❌ | ❌ |
| Record Payments | ✅ | ✅ | ✅ |
| Refund Payments | ✅ | ❌ | ❌ |
| Delete Clients | ✅ | ✅ | ❌ |
| View Reports | ✅ | ✅ | ❌ |
| View Activity Logs | ✅ | ❌ | ❌ |
| Update Settings | ✅ | ❌ | ❌ |

---

## 📝 Activity Logging

### Log User Actions

```tsx
await logActivity(
  userId: string,
  action: string,
  resource: string,
  details?: object,
  ipAddress?: string,
  userAgent?: string
);
```

### Example

```tsx
await logActivity(
  session.user.id,
  'booking_created',
  'booking',
  {
    bookingId: newBooking.id,
    clientName: booking.client.name,
    eventDate: booking.eventDate,
  },
  req.headers.get('x-forwarded-for'),
  req.headers.get('user-agent')
);
```

### Common Actions

**Employees:** `employee_created`, `employee_updated`, `employee_deleted`, `employee_role_changed`

**Bookings:** `booking_created`, `booking_updated`, `booking_deleted`, `booking_cancelled`

**Discounts:** `discount_request_created`, `discount_request_approved`, `discount_request_rejected`, `discount_request_modified`

**Payments:** `payment_recorded`, `payment_updated`, `payment_deleted`, `payment_refunded`

**Clients:** `client_created`, `client_updated`, `client_deleted`

---

## 🔔 Notifications

### Send Notification

```tsx
await createNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  link?: string
);
```

### Use Templates

```tsx
// Notify discount approved
await notifyDiscountApproved(
  userId,
  discountRequest,
  approverName
);

// Notify discount rejected
await notifyDiscountRejected(
  userId,
  discountRequest,
  approverName,
  reason
);

// Notify new discount request (to all owners)
const owners = await prisma.employee.findMany({
  where: { role: 'OWNER' }
});
await notifyNewDiscountRequest(
  owners.map(o => o.id),
  discountRequest,
  requesterName
);
```

### Notification Types

- `discount_request` - New discount request created
- `discount_approved` - Discount request approved
- `discount_rejected` - Discount request rejected
- `discount_modified` - Discount request modified
- `booking_created`, `booking_updated`, `booking_cancelled`
- `payment_received`, `payment_overdue`
- `inventory_low`, `inventory_out`
- `system` - System notifications

---

## 🎨 UI Components

### Notification Bell

```tsx
import { NotificationBell } from '@/components/notifications';

<NotificationBell />
```

### Request Discount Modal

```tsx
import { RequestDiscountModal } from '@/components/discounts/RequestDiscountModal';

const [open, setOpen] = useState(false);

<PermissionButton
  permission="discounts:request"
  onClick={() => setOpen(true)}
>
  Request Discount
</PermissionButton>

<RequestDiscountModal
  open={open}
  onOpenChange={setOpen}
  bookingId={booking.id}
  originalAmount={booking.totalAmount}
  onSuccess={() => router.refresh()}
/>
```

### Employee Role Badge

```tsx
import { EmployeeRoleBadge } from '@/components/employees';

<EmployeeRoleBadge role={employee.role} />
```

### Employee Role Selector

```tsx
import { EmployeeRoleSelect } from '@/components/employees';

<RoleGuard permission="employees:manage-roles">
  <EmployeeRoleSelect
    value={role}
    onChange={setRole}
  />
</RoleGuard>
```

---

## 🛣️ Routes

### Pages

- `/discount-requests` - List discount requests
- `/discount-requests/[id]` - View/review discount request
- `/notifications` - View all notifications
- `/activity-logs` - View activity logs (Owner only)

### API Routes

**Discount Requests:**
- `POST /api/discount-requests` - Create request
- `GET /api/discount-requests` - List requests
- `GET /api/discount-requests/[id]` - Get request
- `PATCH /api/discount-requests/[id]/approve` - Approve
- `PATCH /api/discount-requests/[id]/reject` - Reject
- `PATCH /api/discount-requests/[id]/modify` - Modify

**Notifications:**
- `GET /api/notifications` - List notifications
- `PATCH /api/notifications` - Mark as read
- `DELETE /api/notifications/[id]` - Delete notification
- `GET /api/notifications/unread-count` - Get unread count

**Activity Logs:**
- `GET /api/activity-logs` - List logs (Owner only)
- `GET /api/activity-logs/stats` - Get statistics (Owner only)

---

## 🔧 Helper Functions

### Permission Helpers

```tsx
import { hasPermission, hasAnyPermission, hasAllPermissions } from '@/lib/permissions';

// Check single permission
hasPermission(role, 'clients:delete') // boolean

// Check if has ANY of these permissions
hasAnyPermission(role, ['bookings:create', 'bookings:update']) // boolean

// Check if has ALL of these permissions
hasAllPermissions(role, ['clients:read', 'clients:update']) // boolean
```

### Activity Log Helpers

```tsx
import {
  getUserActivityLogs,
  getAllActivityLogs,
  getResourceActivityLogs,
  formatActivityLog
} from '@/lib/activity-log';

// Get user's activity logs
const logs = await getUserActivityLogs(userId, {
  action: 'booking_created',
  limit: 50,
  offset: 0
});

// Get all activity logs (Owner only)
const allLogs = await getAllActivityLogs({
  resource: 'booking',
  startDate: new Date('2024-01-01'),
  endDate: new Date(),
});

// Get logs for specific resource
const bookingLogs = await getResourceActivityLogs('booking', bookingId);
```

### Notification Helpers

```tsx
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationCount
} from '@/lib/notifications';

// Get user notifications
const notifications = await getUserNotifications(userId, {
  unreadOnly: true,
  limit: 20
});

// Mark as read
await markNotificationAsRead(notificationId);

// Mark all as read
await markAllNotificationsAsRead(userId);

// Get unread count
const count = await getUnreadNotificationCount(userId);
```

---

## 💡 Common Patterns

### Protect a Whole Page

```tsx
import { RequireOwner } from '@/components/auth';

export default function AdminPage() {
  return (
    <RequireOwner>
      {/* Page content */}
    </RequireOwner>
  );
}
```

### Conditional Rendering

```tsx
import { RoleGuard } from '@/components/auth';

<div>
  {/* Everyone sees this */}
  <BookingList />

  {/* Only Manager and Owner see this */}
  <RoleGuard permission="reports:view">
    <QuickStats />
  </RoleGuard>

  {/* Only Owner sees this */}
  <RoleGuard permission="activity-logs:view">
    <RecentActivity />
  </RoleGuard>
</div>
```

### Smart Buttons

```tsx
import { PermissionButton } from '@/components/auth';

<PermissionButton
  permission="clients:delete"
  onClick={handleDelete}
  variant="destructive"
  hideWhenDisabled  // Completely hide if no permission
>
  Delete
</PermissionButton>
```

---

## 📦 Files You Created

### Core (3 files)
- `lib/permissions.ts`
- `lib/activity-log.ts`
- `lib/notifications.ts`

### Components (18 files)
- Auth: `components/auth/` (3 files)
- Discounts: `components/discounts/` (4 files)
- Notifications: `components/notifications/` (5 files)
- Employees: `components/employees/` (4 files)
- Activity Logs: `components/activity-logs/` (3 files)

### API Routes (10 files)
- `app/api/discount-requests/` (5 files)
- `app/api/notifications/` (3 files)
- `app/api/activity-logs/` (2 files)

### Pages (4 files)
- `app/(discounts)/discount-requests/` (2 files)
- `app/(notifications)/notifications/` (1 file)
- `app/(settings)/activity-logs/` (1 file)

### Database (2 files)
- `prisma/schema.prisma`
- `prisma/migrations/.../migration.sql`

### Docs (6 files)
- `RBAC_IMPLEMENTATION_SUMMARY.md`
- `RBAC_PROGRESS.md`
- `RBAC_QUICK_START.md`
- `RBAC_PHASES_4-10_SUMMARY.md`
- `RBAC_FINAL_IMPLEMENTATION.md`
- `RBAC_INTEGRATION_CHECKLIST.md`

**Total: 41 files + 6 docs = 47 files**

---

## 🎯 Quick Integration (Copy-Paste Ready)

### 1. Add to Header

```tsx
import { NotificationBell } from '@/components/notifications';

<header>
  <NotificationBell />
</header>
```

### 2. Add to Booking Form

```tsx
import { RequestDiscountModal } from '@/components/discounts/RequestDiscountModal';
import { PermissionButton } from '@/components/auth';

const [showModal, setShowModal] = useState(false);

<PermissionButton permission="discounts:request" onClick={() => setShowModal(true)}>
  Request Discount
</PermissionButton>

<RequestDiscountModal
  open={showModal}
  onOpenChange={setShowModal}
  bookingId={booking.id}
  originalAmount={booking.totalAmount}
  onSuccess={() => router.refresh()}
/>
```

### 3. Protect API Route

```tsx
import { getServerSession } from 'next-auth';
import { hasPermission } from '@/lib/permissions';

const session = await getServerSession(authOptions);
if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
if (!hasPermission(session.user.role as any, 'clients:delete')) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

### 4. Log Activity

```tsx
import { logActivity } from '@/lib/activity-log';

await logActivity(
  session.user.id,
  'client_deleted',
  'client',
  { clientId, clientName }
);
```

---

## ✅ Quick Checklist

**Integration:**
- [ ] Add NotificationBell to header
- [ ] Add RequestDiscountModal to booking form
- [ ] Protect API routes with permission checks
- [ ] Add activity logging to key actions
- [ ] Test with all 3 roles

**Testing:**
- [ ] Front Desk cannot access employees page
- [ ] Manager can view reports
- [ ] Owner can approve discounts
- [ ] Notifications appear for all users
- [ ] Activity logs show in Owner account

---

**You're all set! 🚀**
