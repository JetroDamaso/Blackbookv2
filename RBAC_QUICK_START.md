# RBAC Quick Start Guide

## For Developers: How to Use the RBAC System

### 🚀 Quick Start

#### 1. Check User Permission in React Component

```tsx
'use client';

import { RoleGuard, PermissionButton } from '@/components/auth';

export function MyComponent() {
  return (
    <div>
      {/* Show content only if user has permission */}
      <RoleGuard permission="bookings:create">
        <CreateBookingButton />
      </RoleGuard>

      {/* Smart button that auto-disables */}
      <PermissionButton
        permission="bookings:delete"
        onClick={handleDelete}
        variant="destructive"
      >
        Delete Booking
      </PermissionButton>
    </div>
  );
}
```

#### 2. Check Permission in API Route

```typescript
// app/api/bookings/route.ts
import { getServerSession } from 'next-auth';
import { hasPermission } from '@/lib/permissions';

export async function POST(request: Request) {
  const session = await getServerSession();

  // Check permission - return 403 if unauthorized
  if (!hasPermission(session?.user?.role, 'bookings:create')) {
    return new Response('Unauthorized', { status: 403 });
  }

  // User has permission - proceed
  // ... create booking
}
```

#### 3. Log Important Actions

```typescript
import { logActivity, getIpAddress, getUserAgent } from '@/lib/activity-log';

// After creating/updating/deleting something important
await logActivity({
  userId: session.user.id,
  action: 'booking.created',
  resource: 'booking',
  resourceId: booking.id.toString(),
  details: {
    clientName: booking.client.name,
    eventDate: booking.eventDate,
    totalAmount: booking.totalAmount,
  },
  ipAddress: getIpAddress(request),
  userAgent: getUserAgent(request),
});
```

#### 4. Send Notifications

```typescript
import { notifyNewBooking, notifyDiscountRequest } from '@/lib/notifications';

// Notify relevant users about a new booking
await notifyNewBooking(
  [ownerId, managerId], // Array of user IDs
  booking.id,
  booking.client.name,
  booking.eventDate.toLocaleDateString()
);

// Notify owner about discount request
await notifyDiscountRequest(
  ownerId,
  discountRequest.id,
  requesterName,
  bookingId,
  '15%'
);
```

---

## 📚 Common Patterns

### Pattern 1: Owner-Only Features

```tsx
import { RequireOwner } from '@/components/auth';

export function AdminPanel() {
  return (
    <RequireOwner fallback={<p>Only the Owner can access this</p>}>
      <div>
        <h1>Admin Panel</h1>
        {/* Owner-only content */}
      </div>
    </RequireOwner>
  );
}
```

### Pattern 2: Manager or Owner Features

```tsx
import { RequireManagerOrOwner } from '@/components/auth';

export function ReportsPage() {
  return (
    <RequireManagerOrOwner>
      <div>
        <h1>Reports</h1>
        {/* Manager and Owner can see this */}
      </div>
    </RequireManagerOrOwner>
  );
}
```

### Pattern 3: Multiple Permission Checks

```tsx
import { RoleGuard } from '@/components/auth';

export function AdvancedFeatures() {
  return (
    <div>
      {/* User needs EITHER permission */}
      <RoleGuard anyPermissions={['reports:view', 'reports:export']}>
        <ReportsSection />
      </RoleGuard>

      {/* User needs BOTH permissions */}
      <RoleGuard allPermissions={['bookings:read', 'payments:read']}>
        <FinancialOverview />
      </RoleGuard>
    </div>
  );
}
```

### Pattern 4: Conditional Rendering Based on Role

```tsx
import { useSession } from 'next-auth/react';
import { hasPermission } from '@/lib/permissions';

export function BookingForm() {
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  const canApproveDiscounts = hasPermission(userRole, 'discounts:approve');
  const canRequestDiscounts = hasPermission(userRole, 'discounts:request');

  return (
    <div>
      {canRequestDiscounts && !canApproveDiscounts && (
        <p>You can request discounts, but need Owner approval</p>
      )}

      {canApproveDiscounts && (
        <ApproveDiscountButton />
      )}
    </div>
  );
}
```

### Pattern 5: Protected API Route with Logging

```typescript
// app/api/bookings/[id]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { hasPermission } from '@/lib/permissions';
import { logActivity, getIpAddress, getUserAgent } from '@/lib/activity-log';
import { prisma } from '@/server/db';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession();

  // Check permission
  if (!hasPermission(session?.user?.role, 'bookings:delete')) {
    // Log failed attempt
    await logActivity({
      userId: session?.user?.id || 'unknown',
      action: 'booking.delete_failed',
      resource: 'booking',
      resourceId: params.id,
      details: { reason: 'Insufficient permissions' },
      ipAddress: getIpAddress(request),
      userAgent: getUserAgent(request),
    });

    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 403 }
    );
  }

  // Get booking for logging
  const booking = await prisma.booking.findUnique({
    where: { id: parseInt(params.id) },
    include: { client: true },
  });

  if (!booking) {
    return NextResponse.json(
      { error: 'Not found' },
      { status: 404 }
    );
  }

  // Delete booking
  await prisma.booking.delete({
    where: { id: parseInt(params.id) },
  });

  // Log successful deletion
  await logActivity({
    userId: session.user.id,
    action: 'booking.deleted',
    resource: 'booking',
    resourceId: params.id,
    details: {
      clientName: booking.client.name,
      eventDate: booking.eventDate,
      totalAmount: booking.totalAmount,
    },
    ipAddress: getIpAddress(request),
    userAgent: getUserAgent(request),
  });

  return NextResponse.json({ success: true });
}
```

---

## 🔑 Available Permissions

### Employee Management
- `employees:create` - Create new employees
- `employees:read` - View employees
- `employees:update` - Edit employees
- `employees:delete` - Delete employees
- `employees:manage-roles` - Change roles (Owner only)

### Booking Management
- `bookings:create` - Create bookings
- `bookings:read` - View bookings
- `bookings:update` - Edit bookings
- `bookings:delete` - Delete bookings
- `bookings:cancel` - Cancel bookings

### Discount Management
- `discounts:request` - Request discounts
- `discounts:approve` - Approve discounts (Owner only)
- `discounts:reject` - Reject discounts (Owner only)
- `discounts:view-all` - View all discount requests

### Payment Management
- `payments:create` - Create payments
- `payments:read` - View payments
- `payments:update` - Edit payments
- `payments:delete` - Delete payments
- `payments:refund` - Process refunds

### Client Management
- `clients:create` - Create clients
- `clients:read` - View clients
- `clients:update` - Edit clients
- `clients:delete` - Delete clients

### Resource Management
- `event-types:*` - Event type operations
- `pavilions:*` - Pavilion operations
- `packages:*` - Package operations
- `inventory:*` - Inventory operations

### Reports & Settings
- `reports:view` - View reports
- `reports:export` - Export reports
- `settings:view` - View settings
- `settings:update` - Modify settings
- `activity-logs:view` - View activity logs (Owner only)

**See `RBAC_IMPLEMENTATION_SUMMARY.md` for complete list**

---

## 🎯 Role Capabilities

### Owner
- ✅ **Everything** (all 40+ permissions)
- Can manage employees and change roles
- Can approve/reject discount requests
- Can view all activity logs

### Manager
- ✅ 25 permissions
- ❌ Cannot manage employees
- ❌ Cannot approve discounts (can request)
- ✅ Can manage bookings, clients, resources
- ✅ Can view and export reports

### Front Desk Staff
- ✅ 13 permissions (operational only)
- ❌ Cannot manage employees
- ❌ Cannot approve discounts (can request)
- ❌ Cannot delete bookings
- ❌ Cannot access reports
- ✅ Can create/edit bookings and clients

---

## 📝 Activity Log Actions

### Employee Actions
- `employee.created` - New employee added
- `employee.updated` - Employee info changed
- `employee.deleted` - Employee removed
- `employee.role_changed` - Role changed
- `employee.login` - User logged in
- `employee.logout` - User logged out

### Booking Actions
- `booking.created` - New booking
- `booking.updated` - Booking modified
- `booking.deleted` - Booking removed
- `booking.cancelled` - Booking cancelled
- `booking.status_changed` - Status updated

### Discount Actions
- `discount.requested` - Discount request submitted
- `discount.approved` - Request approved
- `discount.rejected` - Request rejected
- `discount.modified` - Request modified and approved

### Payment Actions
- `payment.created` - New payment
- `payment.updated` - Payment modified
- `payment.deleted` - Payment removed
- `payment.refunded` - Payment refunded

**See `lib/activity-log.ts` for complete list**

---

## 🔔 Notification Types

- `DISCOUNT_REQUEST` - New discount request
- `DISCOUNT_RESPONSE` - Discount approved/rejected
- `BOOKING` - Booking events
- `PAYMENT` - Payment events
- `INVENTORY` - Inventory alerts
- `SYSTEM` - System notifications

### Pre-built Templates

```typescript
import {
  notifyDiscountRequest,
  notifyDiscountApproved,
  notifyDiscountRejected,
  notifyDiscountModified,
  notifyNewBooking,
  notifyBookingCancellation,
  notifyPaymentReceived,
  notifyLowInventory,
  notifySystemEvent,
} from '@/lib/notifications';
```

---

## 🛡️ Security Best Practices

### 1. Always Check Permissions on Server

```typescript
// ❌ BAD - Only hiding in UI
<RoleGuard permission="bookings:delete">
  <button onClick={deleteBooking}>Delete</button>
</RoleGuard>

// ✅ GOOD - Also check in API
export async function DELETE(request: Request) {
  const session = await getServerSession();

  if (!hasPermission(session?.user?.role, 'bookings:delete')) {
    return new Response('Unauthorized', { status: 403 });
  }

  // ... proceed with delete
}
```

### 2. Log Sensitive Actions

```typescript
// Always log these:
// - Employee role changes
// - Discount approvals/rejections
// - Payment refunds
// - Settings changes
// - Failed permission checks

await logActivity({
  userId: session.user.id,
  action: 'employee.role_changed',
  resource: 'employee',
  resourceId: employeeId,
  details: {
    oldRole: 'FRONT_DESK',
    newRole: 'MANAGER',
    changedBy: session.user.name,
  },
});
```

### 3. Validate Ownership

```typescript
// Check if user owns resource or has permission
export async function canEditBooking(userId: string, bookingId: number) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  // User created booking OR has edit permission
  return booking.createdBy === userId ||
         hasPermission(userRole, 'bookings:update');
}
```

---

## 🧪 Testing Your Implementation

### Test Permission Checks

```typescript
import { hasPermission } from '@/lib/permissions';

// Test all three roles
const testRoles = ['OWNER', 'MANAGER', 'FRONT_DESK'] as const;

testRoles.forEach(role => {
  console.log(`${role} can create bookings:`,
    hasPermission(role, 'bookings:create')
  );
  console.log(`${role} can approve discounts:`,
    hasPermission(role, 'discounts:approve')
  );
});

// Expected output:
// OWNER can create bookings: true
// OWNER can approve discounts: true
// MANAGER can create bookings: true
// MANAGER can approve discounts: false
// FRONT_DESK can create bookings: true
// FRONT_DESK can approve discounts: false
```

### Test Activity Logging

```typescript
import { getUserActivityLogs } from '@/lib/activity-log';

const logs = await getUserActivityLogs(userId, {
  limit: 10,
  action: 'booking.created',
});

console.log('Recent bookings created by user:', logs.logs);
```

### Test Notifications

```typescript
import { getUserNotifications } from '@/lib/notifications';

const { notifications, unreadCount } = await getUserNotifications(userId);

console.log(`User has ${unreadCount} unread notifications`);
```

---

## 🐛 Troubleshooting

### Permission Not Working?

```typescript
// Debug by logging the check
const userRole = session?.user?.role;
const hasPermission = hasPermission(userRole, 'bookings:create');

console.log('User role:', userRole);
console.log('Has permission:', hasPermission);
console.log('All permissions:', getRolePermissions(userRole));
```

### Activity Not Logging?

```typescript
// Check if logging is throwing errors
try {
  await logActivity({...});
  console.log('Activity logged successfully');
} catch (error) {
  console.error('Activity logging failed:', error);
}
```

### Notification Not Sending?

```typescript
// Verify user ID is correct
const user = await prisma.employee.findUnique({
  where: { id: userId },
});

if (!user) {
  console.error('User not found:', userId);
}

// Check notification was created
const notifications = await getUserNotifications(userId);
console.log('User notifications:', notifications);
```

---

## 📖 Further Reading

- `RBAC_IMPLEMENTATION_SUMMARY.md` - Complete documentation
- `RBAC_PROGRESS.md` - Implementation progress
- `lib/permissions.ts` - Permission system source
- `lib/activity-log.ts` - Activity logging source
- `lib/notifications.ts` - Notification system source

---

## 🚀 Ready to Build!

You now have everything you need to implement permission-based features:

1. ✅ Permission system configured
2. ✅ Activity logging ready
3. ✅ Notifications ready
4. ✅ React components available
5. ✅ Type-safe and documented

**Next Steps:**
1. Create API routes with permission checks
2. Build discount request UI
3. Add permission checks to existing pages
4. Test the complete workflow

Happy coding! 🎉
