# RBAC System - Integration Checklist

## 🎉 Implementation Complete - Ready for Integration!

All RBAC components, API routes, and UI elements have been created. This checklist will help you integrate the RBAC system into your existing booking application.

---

## ✅ Pre-Integration Checklist

Before starting integration, verify these are complete:

- [x] Database migration applied (`npx prisma migrate deploy`)
- [x] Prisma client generated (`npx prisma generate`)
- [x] All 41 files created successfully
- [x] No TypeScript compilation errors
- [ ] Development server running (`npm run dev`)
- [ ] Test the application loads without errors

---

## 📋 Integration Tasks

### 1. Add Notification Bell to Header (5 minutes)

**Location:** `app/layout.tsx` or your main header component

**Before:**
```tsx
export function Header() {
  return (
    <header>
      <div>Logo</div>
      <nav>Menu items</nav>
      <div>User menu</div>
    </header>
  );
}
```

**After:**
```tsx
import { NotificationBell } from '@/components/notifications';

export function Header() {
  return (
    <header>
      <div>Logo</div>
      <nav>Menu items</nav>
      <NotificationBell />  {/* Add this */}
      <div>User menu</div>
    </header>
  );
}
```

**Test:**
- [ ] Bell icon appears in header
- [ ] Badge shows unread count
- [ ] Dropdown opens on click
- [ ] Notifications display correctly

---

### 2. Add Discount Request to Booking Form (15 minutes)

**Location:** Your booking form component (e.g., `app/(bookings)/bookings/[id]/page.tsx`)

**Add these imports:**
```tsx
import { RequestDiscountModal } from '@/components/discounts/RequestDiscountModal';
import { PermissionButton, RoleGuard } from '@/components/auth';
```

**Add this state:**
```tsx
const [showDiscountModal, setShowDiscountModal] = useState(false);
```

**Add this button to your booking form:**
```tsx
{/* Add this where you want the discount button */}
<RoleGuard permission="discounts:request">
  <PermissionButton
    permission="discounts:request"
    onClick={() => setShowDiscountModal(true)}
    variant="outline"
  >
    Request Discount
  </PermissionButton>
</RoleGuard>

{/* Add this modal */}
<RequestDiscountModal
  open={showDiscountModal}
  onOpenChange={setShowDiscountModal}
  bookingId={booking.id}
  originalAmount={booking.totalAmount}
  onSuccess={() => {
    router.refresh();
    setShowDiscountModal(false);
  }}
/>
```

**Test:**
- [ ] Button appears for Manager and Front Desk
- [ ] Button doesn't appear for users without permission
- [ ] Modal opens when clicked
- [ ] Discount calculation works
- [ ] Request submission works
- [ ] Owner receives notification

---

### 3. Update Employee Management Page (20 minutes)

**Location:** `app/manage/employees/page.tsx`

**Add role display to employee list:**

```tsx
import { EmployeeRoleBadge } from '@/components/employees';
import { RoleGuard, PermissionButton } from '@/components/auth';

// In your employee table/list
<EmployeeRoleBadge role={employee.role} />

// Wrap edit/delete buttons
<RoleGuard permission="employees:update">
  <PermissionButton
    permission="employees:update"
    onClick={() => handleEdit(employee.id)}
  >
    Edit
  </PermissionButton>
</RoleGuard>

<RoleGuard permission="employees:delete">
  <PermissionButton
    permission="employees:delete"
    onClick={() => handleDelete(employee.id)}
    variant="destructive"
  >
    Delete
  </PermissionButton>
</RoleGuard>
```

**In employee create/edit form:**

```tsx
import { EmployeeRoleSelect, EmployeePermissionsList } from '@/components/employees';

// Add role selector (Owner only)
<RoleGuard permission="employees:manage-roles">
  <EmployeeRoleSelect
    value={formData.role}
    onChange={(role) => setFormData({ ...formData, role })}
  />
</RoleGuard>

// Add permission preview
<EmployeePermissionsList role={formData.role} />
```

**Test:**
- [ ] Role badges appear in employee list
- [ ] Edit/Delete buttons respect permissions
- [ ] Role selector only visible to Owner
- [ ] Permission list shows correctly for each role

---

### 4. Add Permission Checks to Client Management (10 minutes)

**Location:** Your client management pages

**Wrap CRUD buttons:**
```tsx
import { PermissionButton, RoleGuard } from '@/components/auth';

// Create button
<PermissionButton permission="clients:create" onClick={handleCreate}>
  Add Client
</PermissionButton>

// Edit button
<PermissionButton permission="clients:update" onClick={handleEdit}>
  Edit
</PermissionButton>

// Delete button
<PermissionButton permission="clients:delete" onClick={handleDelete}>
  Delete
</PermissionButton>
```

**Test:**
- [ ] Front Desk can create/edit clients
- [ ] Front Desk cannot delete clients
- [ ] Manager can delete clients
- [ ] Owner can do everything

---

### 5. Restrict Reports Page (10 minutes)

**Location:** `app/(reports)/reports/page.tsx`

**Wrap entire page:**
```tsx
import { RoleGuard } from '@/components/auth';

export default function ReportsPage() {
  return (
    <RoleGuard
      permission="reports:view"
      fallback={
        <div className="text-center p-12">
          <h2 className="text-2xl font-bold">Access Denied</h2>
          <p className="text-muted-foreground mt-2">
            You don't have permission to view reports.
          </p>
        </div>
      }
    >
      {/* Your existing reports content */}
    </RoleGuard>
  );
}
```

**Or use RequireManagerOrOwner:**
```tsx
import { RequireManagerOrOwner } from '@/components/auth';

export default function ReportsPage() {
  return (
    <RequireManagerOrOwner>
      {/* Your existing reports content */}
    </RequireManagerOrOwner>
  );
}
```

**Test:**
- [ ] Manager can access reports
- [ ] Owner can access reports
- [ ] Front Desk sees "Access Denied"

---

### 6. Add Permission Checks to Resource Management (15 minutes)

**Location:** Event Types, Pavilions, Packages pages

**For each resource type:**

```tsx
import { PermissionButton } from '@/components/auth';

// Event Types
<PermissionButton permission="event-types:create" onClick={handleCreate}>
  Add Event Type
</PermissionButton>

<PermissionButton permission="event-types:delete" onClick={handleDelete}>
  Delete
</PermissionButton>

// Pavilions
<PermissionButton permission="pavilions:create" onClick={handleCreate}>
  Add Pavilion
</PermissionButton>

// Packages
<PermissionButton permission="packages:create" onClick={handleCreate}>
  Add Package
</PermissionButton>
```

**Test:**
- [ ] Front Desk can view but not create/delete
- [ ] Manager can create/edit/delete
- [ ] Owner can do everything

---

### 7. Add Activity Logging to Key Actions (30 minutes)

**Add to your API routes or server actions:**

```tsx
import { logActivity } from '@/lib/activity-log';

// After creating a booking
await logActivity(
  session.user.id,
  'booking_created',
  'booking',
  {
    bookingId: newBooking.id,
    clientName: booking.client.name,
    eventDate: booking.eventDate,
  },
  req.headers.get('x-forwarded-for') || req.ip,
  req.headers.get('user-agent')
);

// After updating a payment
await logActivity(
  session.user.id,
  'payment_recorded',
  'payment',
  {
    paymentId: payment.id,
    amount: payment.amount,
    bookingId: payment.bookingId,
  }
);

// After deleting a client
await logActivity(
  session.user.id,
  'client_deleted',
  'client',
  {
    clientId: client.id,
    clientName: client.name,
  }
);
```

**Key actions to log:**
- [ ] Booking created/updated/cancelled
- [ ] Payment recorded/updated
- [ ] Client created/updated/deleted
- [ ] Employee created/updated/deleted (sensitive!)
- [ ] Settings changed
- [ ] Resource created/deleted

---

### 8. Replace Toast Implementation (Optional - 20 minutes)

**Current:** Using `alert()` which is not ideal

**Recommended:** Install a proper toast library

**Option 1: Sonner (Recommended)**
```bash
npm install sonner
```

**Update `hooks/use-toast.ts`:**
```tsx
import { toast as sonnerToast } from 'sonner';

export function useToast() {
  return {
    toast: (title: string, description?: string) => {
      if (description) {
        sonnerToast(title, { description });
      } else {
        sonnerToast(title);
      }
    },
  };
}
```

**Add to `app/layout.tsx`:**
```tsx
import { Toaster } from 'sonner';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
```

**Test:**
- [ ] Toasts appear with nice animations
- [ ] Toasts auto-dismiss
- [ ] Multiple toasts stack properly

---

### 9. Add API Route Protection (Important!)

**For any existing API routes, add permission checks:**

```tsx
import { getServerSession } from 'next-auth';
import { hasPermission } from '@/lib/permissions';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  // Authentication check
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Permission check
  if (!hasPermission(session.user.role as any, 'clients:delete')) {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    );
  }

  // Your existing logic...
}
```

**Add to these routes:**
- [ ] Booking create/update/delete
- [ ] Client create/update/delete
- [ ] Employee create/update/delete
- [ ] Payment create/update/delete
- [ ] Resource create/delete
- [ ] Settings update

---

### 10. Test Complete Workflows (1 hour)

#### Discount Request Workflow
- [ ] Front Desk requests discount on booking
- [ ] Owner receives notification
- [ ] Bell icon shows unread count
- [ ] Owner clicks notification → navigates to detail page
- [ ] Owner approves discount
- [ ] Front Desk receives approval notification
- [ ] Activity log shows all actions
- [ ] Notification marked as read

#### Permission Enforcement
- [ ] Front Desk cannot access employee management
- [ ] Front Desk cannot see reports
- [ ] Front Desk cannot delete clients
- [ ] Manager can see reports
- [ ] Manager cannot manage employees
- [ ] Owner can see everything
- [ ] Owner can access activity logs

#### Activity Logging
- [ ] Owner can access activity logs page
- [ ] Logs show all user actions
- [ ] Filter by action type works
- [ ] Filter by resource works
- [ ] Search works
- [ ] Export CSV works
- [ ] Shows user name, role, IP, timestamp

---

## 🔍 Post-Integration Verification

### Quick Smoke Test (15 minutes)

1. **Login as Front Desk:**
   - [ ] Cannot see "Employees" in sidebar
   - [ ] Cannot see "Activity Logs" in sidebar
   - [ ] Cannot see "Reports" in sidebar
   - [ ] Can see "Discount Requests" in sidebar
   - [ ] Can request discounts
   - [ ] Can see notifications

2. **Login as Manager:**
   - [ ] Cannot see "Employees" in sidebar
   - [ ] Cannot see "Activity Logs" in sidebar
   - [ ] CAN see "Reports" in sidebar
   - [ ] Can see "Discount Requests" in sidebar
   - [ ] Can request discounts (but not approve)
   - [ ] Can see notifications

3. **Login as Owner:**
   - [ ] Can see ALL menu items
   - [ ] Can approve discount requests
   - [ ] Can see activity logs
   - [ ] Can manage employees
   - [ ] Can assign roles
   - [ ] Receives notifications for discount requests

### Security Verification (10 minutes)

**Try to bypass permissions:**

1. **URL Access:**
   - [ ] Front Desk accessing `/activity-logs` → Redirect or error
   - [ ] Front Desk accessing `/manage/employees` → Limited access
   - [ ] Manager accessing `/activity-logs` → Redirect or error

2. **API Access (use Postman or curl):**
   - [ ] Front Desk calling DELETE `/api/clients/123` → 403 Forbidden
   - [ ] Manager calling PATCH `/api/discount-requests/123/approve` → 403 Forbidden
   - [ ] Unauthenticated calling any API → 401 Unauthorized

3. **UI Visibility:**
   - [ ] Permission buttons auto-disable when user lacks permission
   - [ ] Disabled buttons show tooltip explaining why
   - [ ] RoleGuard components hide content correctly

---

## 📊 Integration Progress Tracker

Track your progress as you integrate:

```
┌─────────────────────────────────────────────────────────┐
│ Integration Task                          │ Status      │
├─────────────────────────────────────────────────────────┤
│ 1. Add notification bell to header       │ ☐ Pending   │
│ 2. Add discount request to bookings      │ ☐ Pending   │
│ 3. Update employee management             │ ☐ Pending   │
│ 4. Add permission checks to clients       │ ☐ Pending   │
│ 5. Restrict reports page                  │ ☐ Pending   │
│ 6. Add permission checks to resources     │ ☐ Pending   │
│ 7. Add activity logging                   │ ☐ Pending   │
│ 8. Replace toast implementation           │ ☐ Optional  │
│ 9. Add API route protection               │ ☐ Pending   │
│ 10. Test complete workflows               │ ☐ Pending   │
└─────────────────────────────────────────────────────────┘
```

**Total Estimated Integration Time: 2-3 hours**

---

## 🐛 Troubleshooting Common Issues

### Issue: TypeScript errors about missing types

**Solution:**
```bash
npx prisma generate
npm run dev
```

### Issue: Notifications not appearing

**Check:**
1. NotificationBell component is imported and rendered
2. User is authenticated
3. API route `/api/notifications/unread-count` returns successfully
4. Check browser console for errors

### Issue: Permissions not working correctly

**Check:**
1. User role in session matches Prisma enum (`OWNER`, `MANAGER`, `FRONT_DESK`)
2. Permission string is spelled correctly
3. Check `lib/permissions.ts` to see which roles have which permissions

### Issue: Activity logs not showing

**Check:**
1. Only Owner can access `/activity-logs`
2. `logActivity()` is being called in API routes
3. Check database for `UserActivityLog` entries

### Issue: Discount requests not working

**Check:**
1. User has `discounts:request` permission
2. Booking ID and amount are provided
3. Check API route `/api/discount-requests` for errors
4. Check if Owner users exist in database

---

## 🎯 Success Criteria

Your integration is complete when:

- ✅ All 3 user roles (Owner, Manager, Front Desk) can log in
- ✅ Notification bell appears in header for all users
- ✅ Users see different menu items based on their role
- ✅ Front Desk/Manager can request discounts
- ✅ Owner can approve/reject discount requests
- ✅ All users receive notifications for relevant events
- ✅ Owner can view complete activity logs
- ✅ All CRUD operations respect permissions
- ✅ Disabled buttons show helpful tooltips
- ✅ No console errors in browser
- ✅ No TypeScript compilation errors
- ✅ All API routes check permissions

---

## 📞 Need Help?

If you encounter issues during integration:

1. **Check Documentation:**
   - `RBAC_IMPLEMENTATION_SUMMARY.md` - Complete guide
   - `RBAC_QUICK_START.md` - Quick reference
   - `RBAC_FINAL_IMPLEMENTATION.md` - Feature overview

2. **Check Code:**
   - All components have comments explaining usage
   - API routes have error handling
   - Check browser console for client-side errors
   - Check server console for API errors

3. **Verify Prerequisites:**
   - Database migration applied
   - Prisma client generated
   - All packages installed
   - Development server running

---

## 🎊 You're Ready!

All RBAC components are created and ready to integrate. Follow this checklist step-by-step, test each integration, and you'll have a fully functional role-based access control system!

**Good luck! 🚀**
