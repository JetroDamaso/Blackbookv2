# Role-Based Navigation Implementation

## Overview

The sidebar navigation now filters menu items based on the logged-in user's role. This ensures users only see navigation items they have permission to access.

## Roles and Access Levels

### 1. **Owner** Role
- **Access**: Full access to all navigation items
- **Sections Visible**:
  - ✅ Daily Operations (Home, Bookings, Clients, Event Types)
  - ✅ Facilities & Resources (Pavilion, Packages, Rooms, Inventory)
  - ✅ Staff & Roles (Employees, Roles)
  - ✅ Finance & Payments (Additional Charges, Discounts, Payment Methods)
  - ✅ Reports & Settings (Reports, Settings)

### 2. **Manager** Role
- **Access**: Full access to all navigation items (same as Owner)
- **Sections Visible**:
  - ✅ Daily Operations (Home, Bookings, Clients, Event Types)
  - ✅ Facilities & Resources (Pavilion, Packages, Rooms, Inventory)
  - ✅ Staff & Roles (Employees, Roles)
  - ✅ Finance & Payments (Additional Charges, Discounts, Payment Methods)
  - ✅ Reports & Settings (Reports, Settings)

### 3. **Front Desk** Role
- **Access**: Limited access for front-line operations
- **Sections Visible**:
  - ✅ Daily Operations (Home, Bookings, Clients, Event Types)
  - ✅ Facilities & Resources (Pavilion, Packages, Rooms, Inventory)
  - ✅ Finance & Payments (Additional Charges, Payment Methods)
  - ✅ Settings (Settings only)
- **Sections Hidden**:
  - ❌ Staff & Roles (entire section)
  - ❌ Reports (from Reports & Settings)
  - ❌ Discounts (from Finance & Payments)

## Implementation Details

### File Modified
- `components/app-sidebar.tsx`

### Key Changes

1. **Session Check**:
   ```tsx
   const { data: session, status } = useSession();

   if (status === "unauthenticated" || !session?.user) {
     return null;
   }
   ```

2. **Role-Based Filtering Function**:
   ```tsx
   const getFilteredNavigation = () => {
     const userRole = session.user.role;

     if (userRole === "Owner") {
       return data.navMain;
     }

     if (userRole === "Manager") {
       return data.navMain;
     }

     if (userRole === "Front Desk") {
       // Filter sections and items
       return data.navMain
         .filter(section => /* exclude specific sections */)
         .map(section => /* filter items within sections */)
         .concat([/* add Settings section */]);
     }

     return data.navMain; // Default for unknown roles
   };
   ```

3. **Dynamic Navigation Rendering**:
   ```tsx
   const filteredNavigation = getFilteredNavigation();

   {filteredNavigation.map(item => (
     <SidebarGroup key={item.title}>
       {/* Render filtered navigation items */}
     </SidebarGroup>
   ))}
   ```

## How It Works

1. **User Logs In**: NextAuth authentication assigns the user's role from the database
2. **Session Created**: Role is stored in `session.user.role`
3. **Sidebar Renders**: `AppSidebar` component checks the user's role
4. **Navigation Filtered**: Based on the role, appropriate navigation items are shown/hidden
5. **User Sees**: Only the navigation items they have access to

## Security Note

⚠️ **Important**: This implementation controls UI visibility only. You must also implement:

1. **Route Protection**: Use middleware or page-level checks to prevent direct URL access
2. **API Protection**: Validate user roles in server actions and API routes
3. **Component Guards**: Add role checks in sensitive components

### Example Route Protection

```tsx
// In a protected page
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function EmployeesPage() {
  const session = await getServerSession();

  if (!session || session.user.role === "Front Desk") {
    redirect("/dashboard");
  }

  return <EmployeesManagement />;
}
```

### Example API Protection

```ts
// In a server action
export async function deleteEmployee(id: string) {
  const session = await getServerSession();

  if (!session || session.user.role === "Front Desk") {
    throw new Error("Unauthorized");
  }

  // Proceed with deletion
}
```

## Testing Checklist

- [ ] Test with Owner role - should see all navigation
- [ ] Test with Manager role - should see all navigation
- [ ] Test with Front Desk role - should see limited navigation:
  - [ ] ✅ Daily Operations section visible
  - [ ] ✅ Facilities & Resources section visible
  - [ ] ✅ Finance & Payments section visible (without Discounts)
  - [ ] ✅ Settings visible
  - [ ] ❌ Staff & Roles section hidden
  - [ ] ❌ Reports hidden
  - [ ] ❌ Discounts hidden
- [ ] Test with unknown role - should default to full navigation
- [ ] Test navigation links work correctly for all visible items
- [ ] Test no console errors or TypeScript warnings

## Future Enhancements

1. **Dynamic Role Configuration**: Store role permissions in database instead of hardcoding
2. **Granular Permissions**: Add permission-based access (e.g., `canViewReports`, `canEditEmployees`)
3. **Role Hierarchy**: Implement role inheritance (e.g., Manager inherits Front Desk permissions)
4. **Audit Logging**: Track when users access restricted areas
5. **Permission Cache**: Cache role permissions for better performance

## Related Files

- `components/app-sidebar.tsx` - Main sidebar with role filtering
- `app/api/auth/[...nextauth]/route.ts` - NextAuth configuration
- `types/next-auth.d.ts` - TypeScript definitions for session
- `hooks/useAuth.ts` - Authentication hooks
- `server/employee/pullActions.ts` - Employee authentication logic
