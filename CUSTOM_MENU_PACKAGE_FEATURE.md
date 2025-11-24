# Custom Menu Package Feature Implementation

## Overview
Implemented automatic switching to "Custom Package" mode when dishes from non-allowed categories are selected in menu packages. This applies to both the Booking Dialog and Add Bookings page.

## Database Changes

### Menu Model Updates
Added new fields to the `Menu` model in `prisma/schema.prisma`:
- `pricePerPax` (Float): Custom price per person
- `isCustom` (Boolean): Flag to indicate if menu is in custom mode

```prisma
model Menu {
    id             Int           @id @default(autoincrement())
    bookingId      Int?
    booking        Booking?      @relation(fields: [bookingId], references: [id], onDelete: SetNull)
    menuDishes     MenuDish[]
    MenuPackages   MenuPackages? @relation(fields: [menuPackagesId], references: [id])
    menuPackagesId Int?
    pricePerPax    Float?
    isCustom       Boolean?      @default(false)
}
```

## Server Actions Updates

### Menu Push Actions (`server/Menu/pushActions.ts`)
Updated `updateMenuPackage` function to accept optional custom package parameters:

```typescript
export async function updateMenuPackage(
  menuId: number,
  menuPackagesId: number | null,
  pricePerPax?: number | null,
  isCustom?: boolean
)
```

## Features Implemented

### 1. Category-Based Dish Filtering
**Both BookingDialog and AddBookings Page**

- When a menu package is selected, only dishes from allowed categories are shown
- Filtering respects the `allowedCategories` relation in MenuPackages model
- Custom mode bypasses category restrictions

### 2. Automatic Custom Mode Switching
**Trigger Conditions:**
- User selects a menu package (e.g., "Package A" with beef and chicken categories)
- User attempts to add a dish from a non-allowed category (e.g., seafood)

**Automatic Actions:**
1. Switch menu package selector to "Custom Package"
2. Pre-fill price per pax with the previous package's price
3. Remove category restrictions on available dishes
4. Display custom mode info banner
5. Allow unlimited dish selection from any category

### 3. Custom Package Mode UI

**BookingDialog (`components/(Calendar)/BookingDialog.tsx`)**

New UI Elements:
- "Custom Package" option in menu package dropdown
- Price per pax input field (appears when custom mode active)
- Custom mode info banner (amber/yellow) with:
  - "Custom Menu Package" title
  - Description of unlimited category selection
  - Display of current price per pax

**AddBookings Page (`components/(Bookings)/(AddBookings)/page.tsx`)**

New UI Elements:
- "Custom Package" option at top of dropdown
- Price per pax input field
- Custom mode info banner matching BookingDialog style

### 4. State Management

**New State Variables (Both Pages):**
```typescript
const [customPricePerPax, setCustomPricePerPax] = useState<string>("");
const [isCustomMode, setIsCustomMode] = useState(false);
```

**BookingDialog Additional Logic:**
- Loads custom mode state from menu data on dialog open
- Handles price per pax updates with debouncing
- Syncs custom mode with database via `updateMenuPackage`

## User Flows

### Flow 1: Start with Package, Switch to Custom (BookingDialog)
1. User opens booking dialog
2. Clicks "Manage" on Dishes accordion
3. Selects "Package A" (beef & chicken only, ₱100/pax)
4. Sees only beef and chicken dishes in available list
5. User adds a dish from seafood category (not in list initially)
6. **System automatically:**
   - Switches to "Custom Package"
   - Sets price per pax to ₱100
   - Shows all dishes from all categories
   - Displays custom mode banner
   - Adds the seafood dish successfully

### Flow 2: Start with Custom Package (AddBookings)
1. User on Add Bookings form
2. Selects "Catering by Blackbook"
3. Opens Menu Package dropdown
4. Selects "Custom Package"
5. Enters custom price per pax (e.g., ₱150)
6. Can select any dishes from any category
7. No dish limit enforced

### Flow 3: Package Selection Behavior
**When selecting regular package:**
- Shows package name, price, max dishes
- Lists allowed categories
- Shows dish count: "X / Y dishes selected"
- Blue info banner

**When in custom mode:**
- Shows "Custom Menu Package" header
- Shows custom price per pax
- Amber/yellow info banner
- No dish limit display

## Technical Implementation Details

### BookingDialog Updates

**State Initialization:**
```typescript
React.useEffect(() => {
  if (isDishesDialogOpen) {
    const isCustom = menu?.isCustom || false;
    const pricePerPax = menu?.pricePerPax || null;

    setIsCustomMode(isCustom);
    setCustomPricePerPax(pricePerPax ? pricePerPax.toString() : "");

    if (isCustom) {
      setSelectedMenuPackageId("custom");
    } else {
      setSelectedMenuPackageId(menu?.menuPackagesId?.toString() || "none");
    }
  }
}, [isDishesDialogOpen, menu?.menuPackagesId, menu?.isCustom, menu?.pricePerPax]);
```

**Dish Filtering Logic:**
```typescript
const filteredDishes = allDishesData?.filter((dish) => {
  // ... other filters ...

  // Only filter by categories if package selected AND not custom mode
  if (selectedMenuPackage && !isCustomMode && selectedMenuPackage.allowedCategories) {
    const allowedCategoryIds = selectedMenuPackage.allowedCategories.map((cat: any) => cat.id);
    if (!allowedCategoryIds.includes(dish.categoryId)) {
      return false;
    }
  }

  return true;
}) || [];
```

**Add Dish Mutation:**
```typescript
const addDishToMenuMutation = useMutation({
  mutationFn: async ({ dishId, quantity }) => {
    const dish = allDishesData?.find((d: any) => d.id === dishId);
    let needsCustomMode = false;

    if (selectedMenuPackage && dish?.categoryId) {
      const allowedCategoryIds = selectedMenuPackage.allowedCategories?.map((cat: any) => cat.id) || [];
      if (!allowedCategoryIds.includes(dish.categoryId)) {
        needsCustomMode = true;
      }
    }

    if (needsCustomMode && selectedMenuPackage) {
      const currentPrice = selectedMenuPackage.price;
      setIsCustomMode(true);
      setCustomPricePerPax(currentPrice.toString());
      setSelectedMenuPackageId("custom");

      await updateMenuPackage(currentMenuId, null, currentPrice, true);
    }

    return addDishToMenu(currentMenuId, dishId, quantity);
  },
  // ...
});
```

### AddBookings Page Updates

**Add Dish Function:**
```typescript
const addDish = (dish: Dish) => {
  const selectedMenuPackage = selectedMenuPackageId
    ? allMenuPackages.find((pkg: any) => pkg.id === selectedMenuPackageId)
    : null;

  setSelectedDishes(prev => {
    if (selectedMenuPackage && !isCustomMode) {
      const allowedCategoryIds = selectedMenuPackage.allowedCategories?.map((cat: any) => cat.id) || [];

      if (!allowedCategoryIds.includes(dish.categoryId)) {
        // Switch to custom mode
        setIsCustomMode(true);
        setCustomPricePerPax(selectedMenuPackage.price.toString());
        setSelectedMenuPackageId(null);
        toast.info(
          `Dish from different category added. Switched to Custom Package mode. Price per pax set to ₱${selectedMenuPackage.price}.`
        );
      }
    }
    // ... add dish logic ...
  });
};
```

## UI Components

### Package Info Display (Regular Package)
```jsx
<div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
  <p className="text-sm font-semibold text-blue-900">{package.name}</p>
  <p className="text-xs text-blue-700">Price: ₱{package.price}</p>
  <p className="text-xs text-blue-700">
    Dishes: {current} / {max} selected
  </p>
  <p className="text-xs text-blue-700">
    Allowed Categories: {categories.join(", ")}
  </p>
</div>
```

### Custom Mode Display
```jsx
<div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
  <p className="text-sm font-semibold text-amber-900">Custom Menu Package</p>
  <p className="text-xs text-amber-700">
    You can select dishes from any category. Set your custom price per pax above.
  </p>
  <p className="text-xs text-amber-700">
    Price Per Pax: ₱{customPricePerPax}
  </p>
</div>
```

## Validation & Error Handling

### Package Mode Validation
- Checks dish count against `maxDishes` limit
- Validates dish category against `allowedCategories`
- Shows error toast if limit exceeded (only in package mode)

### Custom Mode Validation
- No dish count limit
- No category restrictions
- Requires price per pax to be set (numeric, >= 0)

### Error Messages
**Package mode - category restriction:**
```
"This dish is not included in the selected menu package.
Allowed categories: Beef, Chicken"
```

**Package mode - dish limit:**
```
"You can only select 5 dishes for this menu package"
```

**Custom mode - auto-switch notification:**
```
"Dish from different category added. Switched to Custom Package mode.
Price per pax set to ₱100."
```

## Database Persistence

### Saving Custom Package
When saving a booking with custom package:
1. Menu is created with `bookingId`
2. `menuPackagesId` is set to NULL
3. `isCustom` is set to TRUE
4. `pricePerPax` is set to user-entered value
5. Dishes are saved to `MenuDish` table normally

### Loading Custom Package
When loading a booking with custom package:
1. Check `menu.isCustom` flag
2. If true, load `menu.pricePerPax`
3. Set UI to custom mode
4. Show all dishes from all categories

## Benefits

1. **Flexibility**: Users can mix and match dishes from any category
2. **Transparent Pricing**: Custom price per pax is clearly displayed
3. **Seamless UX**: Automatic switching without page reload
4. **Data Integrity**: Custom packages properly saved and restored
5. **No Data Loss**: Previous package price is preserved when switching
6. **Consistency**: Same behavior in both BookingDialog and AddBookings

## Future Enhancements

- Add custom package name field
- Save custom packages as templates
- Track custom package usage statistics
- Add maximum price validation
- Support multiple custom packages per booking
- Add discount applicability to custom packages
