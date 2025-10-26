# Role-Based Access Control (RBAC) Implementation

## Overview
This document summarizes the complete RBAC system implementation for the booking management system, including discount request-approval workflow.

## Implementation Status

### ✅ Phase 1: Database Schema (COMPLETED)
The database has been updated to support the RBAC system with new models and relations.

#### New Models Created:
1. **DiscountRequest**
   - Tracks all discount requests from Managers/Front Desk Staff to Owner
   - Fields: booking reference, requester, discount details, status, review info
   - Status flow: PENDING → APPROVED/REJECTED/MODIFIED
   - Supports document attachments (stored as JSON string array)

2. **Notification**
   - System-wide notification system
   - Types: DISCOUNT_REQUEST, DISCOUNT_RESPONSE, BOOKING, PAYMENT, INVENTORY, SYSTEM
   - Tracks read/unread status with timestamps

3. **UserActivityLog**
   - Complete audit trail of all user actions
   - Captures: action, resource, details (JSON), IP address, user agent
   - Indexed for fast querying by user, action, resource, and date

#### Updated Models:
1. **Employee**
   - Added: `discountRequests` relation
   - Added: `reviewedDiscounts` relation
   - Added: `notifications` relation
   - Added: `activityLogs` relation
   - Added: `lastLogin` field

2. **Booking**
   - Added: `discountRequests` relation

#### Migration:
- Migration file created: `20251026173654_add_rbac_models`
- Database updated successfully
- All indexes created for performance

---

### ✅ Phase 2: Core Infrastructure (COMPLETED)
Three core library files have been created to support the RBAC system.

#### 1. Permission System (`lib/permissions.ts`)
**Comprehensive permission management with 40+ granular permissions:**

**Employee Management:**
- `employees:create` - Create new employees
- `employees:read` - View employee list and details
- `employees:update` - Edit employee information
- `employees:delete` - Remove employees
- `employees:manage-roles` - Change employee roles (Owner only)

**Booking Management:**
- `bookings:create` - Create new bookings
- `bookings:read` - View bookings
- `bookings:update` - Edit booking details
- `bookings:delete` - Delete bookings
- `bookings:cancel` - Cancel bookings

**Discount Management:**
- `discounts:request` - Request discounts (Manager, Front Desk)
- `discounts:approve` - Approve discount requests (Owner only)
- `discounts:reject` - Reject discount requests (Owner only)
- `discounts:view-all` - View all discount requests

**Payment Management:**
- `payments:create` - Create payment records
- `payments:read` - View payment information
- `payments:update` - Edit payment details
- `payments:delete` - Delete payments
- `payments:refund` - Process refunds (Owner, Manager)

**Client Management:**
- `clients:create` - Add new clients
- `clients:read` - View client information
- `clients:update` - Edit client details
- `clients:delete` - Remove clients

**Resource Management:**
- `event-types:*` - Event type CRUD operations
- `pavilions:*` - Pavilion CRUD operations
- `packages:*` - Package CRUD operations
- `inventory:*` - Inventory CRUD operations

**Reports & Settings:**
- `reports:view` - View reports
- `reports:export` - Export reports
- `settings:view` - View settings
- `settings:update` - Modify settings (Owner, Manager)
- `activity-logs:view` - View activity logs (Owner only)

**Role Permission Matrix:**
```typescript
OWNER: Full access to all 40+ permissions
MANAGER: 25 permissions (cannot manage employees, limited settings)
FRONT_DESK: 13 permissions (booking and client operations only)
```

**Helper Functions:**
- `hasPermission(role, permission)` - Check single permission
- `hasAnyPermission(role, permissions[])` - Check if has ANY permission
- `hasAllPermissions(role, permissions[])` - Check if has ALL permissions
- `getRolePermissions(role)` - Get all permissions for a role
- `canPerformAction(role, action, options)` - Advanced permission check with business logic
- `canAccessRoute(role, route)` - Route-based access control
- `getRoleDisplayName(role)` - Get friendly role name
- `getRoleBadgeColor(role)` - Get Tailwind classes for role badge

**Exported Constants:**
```typescript
PERMISSIONS.CREATE_EMPLOYEE
PERMISSIONS.APPROVE_DISCOUNT
PERMISSIONS.DELETE_BOOKING
// ... and 37 more for easy reference
```

#### 2. Activity Logging System (`lib/activity-log.ts`)
**Complete audit trail with 40+ action types:**

**Action Categories:**
- Employee actions (created, updated, deleted, role_changed, login, logout)
- Booking actions (created, updated, deleted, cancelled, status_changed)
- Discount actions (requested, approved, rejected, modified)
- Payment actions (created, updated, deleted, refunded)
- Client actions (created, updated, deleted)
- Resource actions (event_type, pavilion, package)
- Inventory actions (created, updated, deleted, stock_adjusted)
- Settings actions (updated)
- System actions (backup_created, data_exported, error)

**Functions:**
- `logActivity(options)` - Log an activity
  - Parameters: userId, action, resource, resourceId, details, ipAddress, userAgent
  - Auto-serializes details to JSON
  - Fails gracefully (won't break app if logging fails)

- `getUserActivityLogs(userId, options)` - Get logs for a user
  - Filtering: action, resource, date range
  - Pagination: limit, offset
  - Returns: logs, total, hasMore

- `getAllActivityLogs(options)` - Get all logs (Owner only)
  - Same filtering and pagination
  - Includes user information

- `getResourceActivityLogs(resource, resourceId, options)` - Get logs for specific resource
  - Example: All activities related to Booking #123

- `formatActivityLog(log)` - Convert log to human-readable text
  - "created booking" instead of "booking.created"

- `getUserActivityStats(userId)` - Get statistics
  - Total actions
  - Recent actions (last 30 days)
  - Breakdown by resource type

**Helper Functions:**
- `getIpAddress(request)` - Extract IP from various headers
- `getUserAgent(request)` - Extract user agent

**Usage Example:**
```typescript
await logActivity({
  userId: currentUser.id,
  action: 'discount.approved',
  resource: 'discount',
  resourceId: discountRequest.id,
  details: {
    bookingId: discountRequest.bookingId,
    originalAmount: 1000,
    discountAmount: 100,
  },
  ipAddress: getIpAddress(request),
  userAgent: getUserAgent(request),
});
```

#### 3. Notification System (`lib/notifications.ts`)
**Multi-channel notification system with templates:**

**Core Functions:**
- `createNotification(options)` - Create single notification
- `createBulkNotifications(userIds, options)` - Notify multiple users
- `getUserNotifications(userId, options)` - Get user's notifications
  - Filter: unreadOnly
  - Pagination: limit, offset
  - Returns: notifications, total, unreadCount, hasMore

- `markNotificationAsRead(id)` - Mark single as read
- `markNotificationsAsRead(ids[])` - Mark multiple as read
- `markAllNotificationsAsRead(userId)` - Mark all as read
- `deleteNotification(id)` - Delete single notification
- `deleteReadNotifications(userId)` - Delete all read notifications
- `getUnreadNotificationCount(userId)` - Get count of unread

**Pre-built Notification Templates:**

**Discount Workflow:**
- `notifyDiscountRequest(ownerId, ...)` - Notify Owner of new request
- `notifyDiscountApproved(requesterId, ...)` - Notify requester of approval
- `notifyDiscountRejected(requesterId, ...)` - Notify requester of rejection
- `notifyDiscountModified(requesterId, ...)` - Notify requester of modification

**Booking Events:**
- `notifyNewBooking(userIds, ...)` - Notify about new booking
- `notifyBookingCancellation(userIds, ...)` - Notify about cancellation

**Payment Events:**
- `notifyPaymentReceived(userIds, ...)` - Notify about payment

**Inventory Alerts:**
- `notifyLowInventory(userIds, ...)` - Alert when stock is low

**System Events:**
- `notifySystemEvent(userIds, title, message, link)` - Generic system notification

**Usage Example:**
```typescript
// When Manager requests discount
await notifyDiscountRequest(
  ownerId,
  discountRequest.id,
  'John Manager',
  bookingId,
  '15%'
);

// When Owner approves
await notifyDiscountApproved(
  managerId,
  discountRequest.id,
  bookingId,
  '15%'
);
```

---

### ✅ Phase 3: React Components (COMPLETED)
Created reusable components for role-based UI rendering.

#### 1. RoleGuard Component (`components/auth/RoleGuard.tsx`)
**Conditional rendering based on permissions:**

**Basic Usage:**
```tsx
<RoleGuard permission="employees:create">
  <Button>Create Employee</Button>
</RoleGuard>
```

**Advanced Usage:**
```tsx
// Require ANY of these permissions
<RoleGuard anyPermissions={['discounts:approve', 'discounts:reject']}>
  <ReviewDiscountPanel />
</RoleGuard>

// Require ALL of these permissions
<RoleGuard allPermissions={['bookings:read', 'payments:read']}>
  <FinancialReport />
</RoleGuard>

// Show fallback content
<RoleGuard permission="reports:export" fallback={<p>Upgrade to Manager</p>}>
  <ExportButton />
</RoleGuard>

// Inverse logic (show to users WITHOUT permission)
<RoleGuard permission="discounts:approve" inverse>
  <p>Contact Owner for discount approval</p>
</RoleGuard>
```

**Helper Components:**

```tsx
// Require specific role(s)
<RequireRole roles="OWNER">
  <DeleteAllButton />
</RequireRole>

<RequireRole roles={['OWNER', 'MANAGER']}>
  <AdvancedSettings />
</RequireRole>

// Shorthand for Owner only
<RequireOwner>
  <EmployeeManagement />
</RequireOwner>

// Shorthand for Owner or Manager
<RequireManagerOrOwner>
  <ReportsPage />
</RequireManagerOrOwner>
```

#### 2. PermissionButton Component (`components/auth/PermissionButton.tsx`)
**Smart button that auto-disables based on permissions:**

**Basic Usage:**
```tsx
<PermissionButton permission="bookings:delete" onClick={handleDelete}>
  Delete Booking
</PermissionButton>
```

**Advanced Features:**
```tsx
// Hide button instead of disabling
<PermissionButton
  permission="employees:create"
  hideWhenDisabled
>
  Create Employee
</PermissionButton>

// Custom tooltip message
<PermissionButton
  permission="discounts:approve"
  disabledTooltip="Only the Owner can approve discounts"
  onClick={handleApprove}
>
  Approve Discount
</PermissionButton>

// All Button props supported
<PermissionButton
  permission="clients:delete"
  variant="destructive"
  size="sm"
  className="ml-2"
  onClick={handleDelete}
>
  Delete
</PermissionButton>
```

**Features:**
- Automatically disables if user lacks permission
- Optional: Hide button entirely with `hideWhenDisabled`
- Shows tooltip on hover explaining why disabled
- Custom tooltip message via `disabledTooltip` prop
- Supports all standard Button props
- Type-safe with full TypeScript support

---

## User Roles & Permissions

### Owner (Full Access)
**Can do everything:**
- ✅ Manage employees (create, edit, delete, change roles)
- ✅ Approve/reject/modify discount requests
- ✅ Full booking management
- ✅ Payment refunds
- ✅ Full resource management (event types, pavilions, packages)
- ✅ Inventory management
- ✅ View and export reports
- ✅ Modify all settings
- ✅ View all activity logs

### Manager (Limited Admin)
**Cannot manage employees or approve discounts:**
- ❌ Cannot create/edit/delete employees
- ❌ Cannot approve discount requests (can only request)
- ❌ Cannot manage employee roles
- ✅ Can request discounts
- ✅ Full booking management
- ✅ Payment management (no refunds)
- ✅ Full client management
- ✅ Edit resources (cannot create/delete)
- ✅ Inventory management
- ✅ View and export reports
- ✅ View settings (cannot modify sensitive settings)

### Front Desk Staff (Operational Only)
**Limited to daily operations:**
- ❌ Cannot manage employees
- ❌ Cannot approve discounts (can only request)
- ❌ Cannot delete bookings
- ❌ Cannot access reports
- ❌ Cannot modify settings
- ✅ Can request discounts
- ✅ Create and edit bookings
- ✅ Basic payment recording
- ✅ Create and edit clients
- ✅ View resources (read-only)
- ✅ View inventory (read-only)

---

## Discount Request Workflow

### The Problem (Before RBAC)
Currently, when Manager or Front Desk needs to give a discount:
1. They call/text the Owner
2. Explain the situation verbally
3. Wait for approval
4. Manually apply discount if approved
5. No audit trail of who approved what

### The Solution (With RBAC)
Digital workflow that mirrors the phone call process:

#### Step 1: Request Discount (Manager/Front Desk)
```tsx
// In booking form
<RoleGuard permission="discounts:request">
  <Button onClick={() => setShowDiscountModal(true)}>
    Request Discount
  </Button>
</RoleGuard>
```

Modal appears with:
- Discount type (percentage or fixed amount)
- Discount value
- Justification text field
- Optional document upload (photos, emails, etc.)
- Shows calculated final amount

API call creates DiscountRequest:
```typescript
await fetch('/api/discount-requests', {
  method: 'POST',
  body: JSON.stringify({
    bookingId: booking.id,
    discountType: 'percentage',
    discountValue: 15,
    justification: 'Client is celebrating golden anniversary',
    originalAmount: 50000,
  }),
});
```

System automatically:
- Creates DiscountRequest with status "PENDING"
- Notifies Owner via `notifyDiscountRequest()`
- Logs activity via `logActivity()`
- Updates booking to show "Discount Pending"

#### Step 2: Review Request (Owner)
Owner receives notification:
- "John Manager is requesting a 15% discount for Booking #1234"
- Click to view discount request details

Review page shows:
- Booking details
- Client information
- Current package and pricing
- Requested discount details
- Justification
- Uploaded documents
- Original amount vs. discounted amount

Three action buttons (Owner only):
```tsx
<RequireOwner>
  <div className="flex gap-2">
    <PermissionButton
      permission="discounts:approve"
      onClick={handleApprove}
    >
      Approve
    </PermissionButton>

    <PermissionButton
      permission="discounts:reject"
      variant="destructive"
      onClick={handleReject}
    >
      Reject
    </PermissionButton>

    <PermissionButton
      permission="discounts:approve"
      variant="outline"
      onClick={handleModify}
    >
      Modify & Approve
    </PermissionButton>
  </div>
</RequireOwner>
```

#### Step 3: Owner Decision

**Option A: Approve**
```typescript
// PATCH /api/discount-requests/[id]/approve
await updateDiscountRequest(id, {
  status: 'APPROVED',
  finalAmount: originalAmount - (originalAmount * discountValue / 100),
});
```

System automatically:
- Updates DiscountRequest status to "APPROVED"
- Updates Booking with approved discount
- Notifies requester via `notifyDiscountApproved()`
- Logs approval via `logActivity()`

**Option B: Reject**
```typescript
// PATCH /api/discount-requests/[id]/reject
await updateDiscountRequest(id, {
  status: 'REJECTED',
  reviewNotes: 'Not enough justification for this discount',
});
```

System automatically:
- Updates DiscountRequest status to "REJECTED"
- Notifies requester via `notifyDiscountRejected()`
- Logs rejection via `logActivity()`

**Option C: Modify & Approve**
```typescript
// PATCH /api/discount-requests/[id]/modify
await updateDiscountRequest(id, {
  status: 'MODIFIED',
  finalAmount: 42500, // Owner decides different amount
  reviewNotes: 'Approved 10% instead of 15%',
});
```

System automatically:
- Updates DiscountRequest status to "MODIFIED"
- Updates Booking with modified discount
- Notifies requester via `notifyDiscountModified()`
- Logs modification via `logActivity()`

#### Step 4: Requester Receives Response
Notification appears:
- "Your 15% discount request for Booking #1234 has been approved"
- OR "Your discount request was rejected: Not enough justification"
- OR "Your discount was adjusted from 15% to 10% and approved"

Click notification to:
- View updated booking with applied discount
- See Owner's notes
- Continue with booking process

---

## Next Steps (Remaining Implementation)

### 🔄 Phase 4: API Routes (In Progress)
Need to create API endpoints for discount requests:

**Files to Create:**
1. `app/api/discount-requests/route.ts`
   - POST - Create new discount request
   - GET - List discount requests (filtered by role)

2. `app/api/discount-requests/[id]/route.ts`
   - GET - Get discount request details
   - PATCH - Update discount request

3. `app/api/discount-requests/[id]/approve/route.ts`
   - PATCH - Approve discount request (Owner only)

4. `app/api/discount-requests/[id]/reject/route.ts`
   - PATCH - Reject discount request (Owner only)

5. `app/api/discount-requests/[id]/modify/route.ts`
   - PATCH - Modify and approve (Owner only)

6. `app/api/notifications/route.ts`
   - GET - Get user notifications
   - PATCH - Mark notifications as read

7. `app/api/notifications/[id]/route.ts`
   - DELETE - Delete notification

8. `app/api/activity-logs/route.ts`
   - GET - Get activity logs (filtered by role)

### 📋 Phase 5: Discount Request UI
**Files to Create:**

1. `components/bookings/RequestDiscountModal.tsx`
   - Modal for requesting discounts
   - Form with discount type, value, justification
   - File upload for supporting documents
   - Shows calculated final amount
   - Only visible to users with `discounts:request` permission

2. `components/bookings/DiscountStatusBadge.tsx`
   - Visual indicator of discount request status
   - Different colors for PENDING, APPROVED, REJECTED, MODIFIED
   - Shows in booking forms and lists

3. `app/(discounts)/discount-requests/page.tsx`
   - List of all discount requests
   - Filtered by role:
     - Owner: Sees all requests
     - Manager/Front Desk: Sees only their own requests
   - Filter by status (Pending, Approved, Rejected)
   - Sort by date

4. `app/(discounts)/discount-requests/[id]/page.tsx`
   - Detailed view of discount request
   - Shows booking details, justification, documents
   - Approval buttons (Owner only)
   - Modification form (Owner only)
   - Review notes

### 👥 Phase 6: Employee Management
**Files to Create:**

1. Update `app/manage/employees/page.tsx`
   - Wrap create/edit/delete buttons with `PermissionButton`
   - Show role badges
   - Restrict role editing to Owner only

2. `components/employees/EmployeeRoleSelect.tsx`
   - Dropdown for selecting employee role
   - Only shown to Owner (`RequireOwner`)

3. `components/employees/EmployeePermissionsList.tsx`
   - Display what permissions each role has
   - Educational tool for Owner when assigning roles

### 🔔 Phase 7: Notification System UI
**Files to Create:**

1. `components/notifications/NotificationBell.tsx`
   - Bell icon in header with unread count badge
   - Click to open notification dropdown

2. `components/notifications/NotificationDropdown.tsx`
   - Dropdown showing recent notifications
   - Mark as read on click
   - "View all" link to full notification page

3. `components/notifications/NotificationList.tsx`
   - Full page list of notifications
   - Filter by type
   - Mark all as read
   - Delete read notifications

4. `app/(notifications)/notifications/page.tsx`
   - Full notifications page

### 🔐 Phase 8: Sidebar & Navigation
**Files to Update:**

1. `components/app-sidebar.tsx`
   - Wrap menu items with `RoleGuard`
   - Hide "Employees" from non-Owners
   - Hide "Reports" from Front Desk
   - Hide "Settings" based on permissions
   - Add "Discount Requests" menu item

### 📊 Phase 9: Activity Logs UI
**Files to Create:**

1. `app/(settings)/activity-logs/page.tsx`
   - Full activity log viewer (Owner only)
   - Filter by user, action, resource, date
   - Pagination
   - Export functionality

2. `components/activity-logs/ActivityLogTable.tsx`
   - Table component for displaying logs
   - Formatted action descriptions
   - User info, timestamp, details

3. `components/activity-logs/ActivityLogFilters.tsx`
   - Filter controls
   - Date range picker
   - Action type dropdown
   - Resource type dropdown
   - User dropdown

### 🎨 Phase 10: Update Existing Pages
**Files to Update:**

1. `app/(bookings)/**` - Add discount request functionality
2. `app/(clients)/**` - Add permission checks
3. `app/manage/event-types/**` - Restrict based on role
4. `app/manage/pavilions/**` - Restrict based on role
5. `app/manage/packages/**` - Restrict based on role
6. `app/(inventory)/**` - Restrict based on role
7. `app/(reports)/**` - Restrict to Owner/Manager
8. `app/(settings)/**` - Restrict sensitive settings to Owner

---

## Testing Checklist

### Permission System
- [ ] Owner has all 40+ permissions
- [ ] Manager has 25 permissions (no employee management, no approve discounts)
- [ ] Front Desk has 13 permissions (only operational)
- [ ] `hasPermission()` correctly checks permissions
- [ ] `hasAnyPermission()` works with multiple permissions
- [ ] `hasAllPermissions()` requires all permissions
- [ ] `canAccessRoute()` blocks unauthorized routes

### Discount Request Workflow
- [ ] Manager can request discount
- [ ] Front Desk can request discount
- [ ] Owner receives notification of request
- [ ] Owner can approve discount
- [ ] Owner can reject discount
- [ ] Owner can modify and approve
- [ ] Requester receives notification of decision
- [ ] Booking is updated with approved discount
- [ ] All actions are logged to activity log

### Notifications
- [ ] Notifications are created correctly
- [ ] Bulk notifications work
- [ ] Unread count is accurate
- [ ] Mark as read works
- [ ] Mark all as read works
- [ ] Delete notification works
- [ ] Templates format correctly

### Activity Logging
- [ ] All important actions are logged
- [ ] Log includes correct user, action, resource
- [ ] Details are serialized to JSON correctly
- [ ] IP address and user agent are captured
- [ ] Logs can be filtered by user
- [ ] Logs can be filtered by action/resource
- [ ] Logs can be filtered by date range
- [ ] Pagination works correctly

### UI Components
- [ ] `RoleGuard` shows/hides content based on permissions
- [ ] `RequireRole` works with single and multiple roles
- [ ] `RequireOwner` only shows to Owner
- [ ] `RequireManagerOrOwner` shows to both roles
- [ ] `PermissionButton` disables when no permission
- [ ] `PermissionButton` hides with `hideWhenDisabled`
- [ ] Tooltip shows on disabled buttons
- [ ] Custom tooltip message works

### Integration Tests
- [ ] Complete discount request flow works end-to-end
- [ ] Notifications are sent at correct times
- [ ] Activity logs capture all steps
- [ ] Permissions are enforced on API routes
- [ ] Permissions are enforced in UI
- [ ] Sidebar shows correct menu items per role

---

## Security Considerations

### API Route Protection
All API routes must check permissions:
```typescript
// app/api/discount-requests/route.ts
import { getServerSession } from 'next-auth';
import { hasPermission } from '@/lib/permissions';

export async function POST(request: Request) {
  const session = await getServerSession();

  if (!hasPermission(session?.user?.role, 'discounts:request')) {
    return new Response('Unauthorized', { status: 403 });
  }

  // ... create discount request
}
```

### Client-Side Protection
Never rely solely on UI hiding:
- Always validate on server
- UI protection is UX, not security
- API routes are the real security layer

### Activity Logging
Log all sensitive actions:
- Employee role changes
- Discount approvals/rejections
- Payment refunds
- Settings changes
- Failed permission checks

### Notification Validation
Ensure users can only:
- View their own notifications
- Mark their own notifications as read
- Delete their own notifications

---

## File Structure

```
lib/
├── permissions.ts           ✅ Permission system
├── activity-log.ts          ✅ Activity logging
└── notifications.ts         ✅ Notification system

components/
└── auth/
    ├── RoleGuard.tsx       ✅ Role-based rendering
    ├── PermissionButton.tsx ✅ Permission-based button
    └── index.ts            ✅ Exports

prisma/
├── schema.prisma           ✅ Updated with RBAC models
└── migrations/
    └── 20251026173654_add_rbac_models/
        └── migration.sql   ✅ RBAC migration

app/
├── api/
│   ├── discount-requests/  ⏳ TODO
│   ├── notifications/      ⏳ TODO
│   └── activity-logs/      ⏳ TODO
│
├── (discounts)/
│   └── discount-requests/  ⏳ TODO
│
├── (notifications)/
│   └── notifications/      ⏳ TODO
│
└── (settings)/
    └── activity-logs/      ⏳ TODO
```

---

## Usage Examples

### Example 1: Booking Page with Discount Request
```tsx
'use client';

import { RoleGuard, PermissionButton } from '@/components/auth';
import { useState } from 'react';

export function BookingForm() {
  const [showDiscountModal, setShowDiscountModal] = useState(false);

  return (
    <div>
      {/* Booking form fields */}

      <RoleGuard permission="discounts:request">
        <PermissionButton
          permission="discounts:request"
          onClick={() => setShowDiscountModal(true)}
          variant="outline"
        >
          Request Discount
        </PermissionButton>
      </RoleGuard>

      {showDiscountModal && (
        <RequestDiscountModal
          booking={booking}
          onClose={() => setShowDiscountModal(false)}
        />
      )}
    </div>
  );
}
```

### Example 2: Employee Management Page
```tsx
'use client';

import { RequireOwner, PermissionButton } from '@/components/auth';

export function EmployeesPage() {
  return (
    <div>
      <RequireOwner fallback={<p>Only the Owner can manage employees</p>}>
        <PermissionButton
          permission="employees:create"
          onClick={handleCreateEmployee}
        >
          Create Employee
        </PermissionButton>

        <EmployeeList />
      </RequireOwner>
    </div>
  );
}
```

### Example 3: Discount Review Page (Owner Only)
```tsx
'use client';

import { RequireOwner, PermissionButton } from '@/components/auth';
import { useDiscountRequest } from '@/hooks/useDiscountRequest';

export function DiscountReviewPage({ id }: { id: string }) {
  const { discountRequest, approve, reject, modify } = useDiscountRequest(id);

  return (
    <RequireOwner>
      <div>
        <h1>Discount Request #{discountRequest.id}</h1>

        {/* Request details */}

        <div className="flex gap-2">
          <PermissionButton
            permission="discounts:approve"
            onClick={() => approve()}
          >
            Approve
          </PermissionButton>

          <PermissionButton
            permission="discounts:reject"
            variant="destructive"
            onClick={() => reject()}
          >
            Reject
          </PermissionButton>

          <PermissionButton
            permission="discounts:approve"
            variant="outline"
            onClick={() => setShowModifyModal(true)}
          >
            Modify & Approve
          </PermissionButton>
        </div>
      </div>
    </RequireOwner>
  );
}
```

### Example 4: API Route with Permission Check
```typescript
// app/api/discount-requests/[id]/approve/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { hasPermission } from '@/lib/permissions';
import { prisma } from '@/server/db';
import { logActivity } from '@/lib/activity-log';
import { notifyDiscountApproved } from '@/lib/notifications';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession();

  // Check permission
  if (!hasPermission(session?.user?.role, 'discounts:approve')) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 403 }
    );
  }

  // Get discount request
  const discountRequest = await prisma.discountRequest.findUnique({
    where: { id: params.id },
  });

  if (!discountRequest) {
    return NextResponse.json(
      { error: 'Not found' },
      { status: 404 }
    );
  }

  // Update discount request
  const updated = await prisma.discountRequest.update({
    where: { id: params.id },
    data: {
      status: 'APPROVED',
      reviewedById: session.user.id,
      reviewedAt: new Date(),
      finalAmount: discountRequest.originalAmount -
        (discountRequest.discountValue * discountRequest.originalAmount / 100),
    },
  });

  // Update booking with discount
  await prisma.booking.update({
    where: { id: discountRequest.bookingId },
    data: {
      // Apply discount to booking
    },
  });

  // Log activity
  await logActivity({
    userId: session.user.id,
    action: 'discount.approved',
    resource: 'discount',
    resourceId: params.id,
    details: {
      bookingId: discountRequest.bookingId,
      discountValue: discountRequest.discountValue,
      discountUnit: discountRequest.discountUnit,
    },
  });

  // Notify requester
  await notifyDiscountApproved(
    discountRequest.requestedById,
    params.id,
    discountRequest.bookingId,
    `${discountRequest.discountValue}${discountRequest.discountUnit === 'PERCENTAGE' ? '%' : ' pesos'}`
  );

  return NextResponse.json(updated);
}
```

---

## Summary

**Completed:**
- ✅ Database schema with 3 new models
- ✅ Comprehensive permission system (40+ permissions)
- ✅ Complete activity logging system
- ✅ Full notification system with templates
- ✅ React components for role-based rendering
- ✅ Type-safe permission checking
- ✅ Utility functions and helpers

**Ready to Implement:**
- 📋 API routes for discount requests
- 📋 Discount request UI (modal, review page, status badges)
- 📋 Notification UI (bell icon, dropdown, full page)
- 📋 Activity log viewer (Owner only)
- 📋 Employee management updates
- 📋 Sidebar navigation updates
- 📋 Existing page updates with permission checks

**System Benefits:**
- 🔒 Secure permission-based access control
- 📝 Complete audit trail of all actions
- 🔔 Real-time notifications
- 🎯 Role-specific UI rendering
- 💼 Professional discount request workflow
- 📊 Activity logging and analytics
- 🚀 Scalable and maintainable architecture

The foundation is solid. The next phase is to build the API routes and UI components that use this infrastructure!
