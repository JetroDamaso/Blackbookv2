# Menu Package Management Implementation

## Overview
Complete menu package management system integrated into the dishes management page with create, edit, and delete functionality.

## Features Implemented

### 1. Menu Package CRUD Operations
**File:** `server/menuPackages/pushActions.ts`

- **createMenuPackage(name, price, maxDishes, allowedCategoryIds, description?)**: Create new menu packages with allowed dish categories
- **updateMenuPackage(id, name, price, maxDishes, allowedCategoryIds, description?)**: Update existing packages, properly handles category relationships
- **deleteMenuPackage(id)**: Soft delete (sets `isDeleted: true`, `isActive: false`)
- **toggleMenuPackageActive(id, isActive)**: Toggle active status

All functions include:
- Error handling with try-catch
- Full package data return with relations
- Proper Prisma transactions

### 2. Menu Package Dialog Component
**File:** `app/manage/dishes/menu-package-dialog.tsx`

Features:
- Create and edit modes (determined by `packageId` prop)
- Form validation (name, price, max dishes, at least one category)
- Multi-select category checkboxes in scrollable area
- Delete confirmation for existing packages
- Auto-load package data when editing
- Reset form on close or when creating new
- Toast notifications for success/error states
- Proper loading states during mutations

Form Fields:
- Package Name (required)
- Price in ₱ (required, number input)
- Max Dishes (required, number input)
- Description (optional, textarea)
- Allowed Categories (required, multi-select checkboxes)

### 3. Dishes Page Integration
**File:** `app/manage/dishes/page.tsx`

Added menu package management widgets:

#### Widget 1: Menu Packages Card
- Shows total active packages count
- Includes "+" button to create new package
- Opens dialog in create mode when clicked

#### Widget 2: Average Package Price
- Calculates and displays average price across all packages
- Formatted as currency (₱0.00)

#### Widget 3: Most Restrictive Package (if exists)
- Shows package with lowest `maxDishes` value
- Displays dish limit and package name
- Clickable - opens dialog in edit mode for that package
- Hover effect for better UX

## User Flow

### Creating a Menu Package
1. Click "+" button on "Menu Packages" widget
2. Fill in package details (name, price, max dishes)
3. Add description (optional)
4. Select allowed dish categories (at least one required)
5. Click "Create"
6. Success toast appears, widgets update automatically

### Editing a Menu Package
1. Click on "Most Restrictive Package" widget
2. Package data loads automatically in form
3. Modify any fields as needed
4. Click "Update"
5. Success toast appears, widgets refresh

### Deleting a Menu Package
1. Open package in edit mode
2. Click "Delete" button (red, bottom left)
3. Confirm deletion in prompt
4. Package is soft-deleted (not removed from database)
5. Success toast appears, widgets update

## Technical Details

### State Management
- React Query for data fetching and caching
- Query keys: `["menuPackages"]` and `["menuPackage", id]`
- Automatic refetch on mutations
- Invalidates relevant queries after create/update/delete

### Validation
- Client-side: Required fields, positive numbers, at least one category
- Server-side: Prisma schema constraints, try-catch error handling
- User-friendly error messages via toast

### Category Management
The update function properly handles the many-to-many relationship:
```typescript
allowedCategories: {
  set: [], // Clear existing relationships
  connect: allowedCategoryIds.map(id => ({ id })) // Add new relationships
}
```

### Statistics Calculations
```typescript
// Total packages
totalPackages = menuPackagesData?.length || 0

// Average price
avgPackagePrice = sum of all prices / count

// Most restrictive
mostRestrictivePackage = package with minimum maxDishes value
```

## Database Schema
Uses existing `MenuPackages` model:
- `id`: Primary key
- `name`: Package name
- `price`: Decimal price
- `maxDishes`: Integer limit
- `description`: Optional text
- `allowedCategories`: Many-to-many with DishCategory
- `isActive`: Boolean for active status
- `isDeleted`: Boolean for soft delete

## Integration with Booking System
The menu packages created here are used in:
- `components/(Calendar)/BookingDialog.tsx` - Menu package selector in booking form
- `components/(Bookings)/(AddBookings)/page.tsx` - Package selector in add bookings page

When users select a menu package in booking forms:
1. Available dishes are filtered by allowed categories
2. Dish limit is enforced (validation prevents exceeding maxDishes)
3. Package description and details are displayed
4. Auto-quantity sets dishes to booking's totalPax

## Error Handling
All operations include comprehensive error handling:
- Try-catch blocks in server actions
- User-friendly error messages
- Toast notifications for all error states
- No silent failures

## UI/UX Features
- Consistent design with existing dishes management
- Responsive widget layout with horizontal scroll
- Loading states during data fetch and mutations
- Disabled states during form submission
- Confirmation prompts for destructive actions
- Hover effects for interactive elements
- Clear visual hierarchy

## Files Modified/Created

### Created:
- `server/menuPackages/pushActions.ts` (95 lines)
- `app/manage/dishes/menu-package-dialog.tsx` (324 lines)

### Modified:
- `app/manage/dishes/page.tsx` (183 lines)

### Existing (Used):
- `server/menuPackages/pullActions.ts`
- `server/Dishes/Actions/pullActions.ts` (getDishCategories)

## Testing Checklist
- [ ] Create new menu package with all fields
- [ ] Create package with minimum required fields
- [ ] Edit existing package details
- [ ] Edit package categories (add/remove)
- [ ] Delete package (confirm soft delete)
- [ ] Validation: empty name
- [ ] Validation: zero/negative price
- [ ] Validation: zero/negative max dishes
- [ ] Validation: no categories selected
- [ ] Verify widgets update after create
- [ ] Verify widgets update after edit
- [ ] Verify widgets update after delete
- [ ] Click "Most Restrictive Package" widget
- [ ] Test with no packages (widgets handle empty state)
- [ ] Test cancel button (form resets, dialog closes)

## Future Enhancements
- Bulk operations (activate/deactivate multiple packages)
- Package usage statistics (how many bookings use each package)
- Package duplication feature
- Package templates
- Export/import package configurations
- Package pricing history
- Package popularity analytics
