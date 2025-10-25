# Inventory Management Implementation - Select Inventory Dialog

## Summary
Replaced the previous "Manage Inventory" dialog with a more user-friendly "Select Inventory Items" dialog that matches the pattern used in the booking creation form.

## Changes Made

### 1. **Updated Dialog Title and Approach**
Changed from "Manage Inventory" to "Select Inventory Items" with a focus on selection rather than individual CRUD operations.

### 2. **Simplified State Management**
```tsx
// Now using selectedInventoryItems array (matching booking form pattern)
const [selectedInventoryItems, setSelectedInventoryItems] = useState<
  { id: number; quantity: number }[]
>([]);

// Separate filter states for left and right columns
const [selectedItemsCategoryFilter, setSelectedItemsCategoryFilter] = useState("all");
const [selectedItemsSearchQuery, setSelectedItemsSearchQuery] = useState("");
const [selectedInventoryCategoryFilter, setSelectedInventoryCategoryFilter] = useState("all");
const [inventorySearchQuery, setInventorySearchQuery] = useState("");
```

### 3. **Inventory Handlers**
Implemented local state handlers (changes not saved until "Save" clicked):

```tsx
const addInventoryItem = (inventoryId: number, quantity: number = 1) => {
  // Adds item to selection or increments quantity if already selected
};

const removeInventoryItem = (inventoryId: number) => {
  // Removes item from selection
};

const updateInventoryQuantity = (inventoryId: number, quantity: number) => {
  // Updates quantity or removes if quantity <= 0
};
```

### 4. **Bulk Save Functionality**
Replaced individual mutations with a bulk save operation:

```tsx
const saveInventoryChanges = async () => {
  // Calculate diff between current booking inventory and selected items
  // Execute removes, adds, and updates in batch
  // Show single success/error toast
  // Close dialog on success
};
```

### 5. **Two-Column Dialog Layout**

#### Left Column: Selected Items
- Shows currently selected inventory items
- Category filter dropdown
- Search input with clear button
- Table with: Item Name, Category, Quantity, Actions
- Remove button for each item
- Empty state message when no items selected

#### Right Column: Available Items
- Shows all available inventory
- Category filter dropdown
- Search input with clear button
- Table with: Item Name, Category, Available, Selected, Actions
- **Inline controls** for each item:
  - **Plus button**: Add 1 to quantity (disabled when at max)
  - **Number input**: Edit quantity directly (shows only when selected)
  - **Remove button**: Remove from selection (shows only when selected)
- Highlights selected items with blue background
- Shows "Low Stock" warning for items with < 5 available
- Empty state with context-aware message

### 6. **Auto-Sync with Booking Data**
```tsx
React.useEffect(() => {
  if (isInventoryDialogOpen && bookingInventory) {
    const items = bookingInventory.map((item: any) => ({
      id: item.inventoryId,
      quantity: item.quantity || 1,
    }));
    setSelectedInventoryItems(items);
  }
}, [isInventoryDialogOpen, bookingInventory]);
```

### 7. **Footer with Summary and Actions**
- Shows count of selected items and total quantity
- **Cancel button**: Closes dialog without saving
- **Save button**: Applies all changes at once
  - Disabled when no items selected
  - Shows count in button text

## Key Features

### User Experience
1. **Non-destructive editing**: Changes aren't saved until "Save" is clicked
2. **Visual feedback**: Selected items highlighted in blue on right side
3. **Stock warnings**: Low stock items clearly marked
4. **Search & filter**: Both columns independently searchable/filterable
5. **Inline quantity editing**: No need for separate add/edit dialogs
6. **Clear reset buttons**: Easy to clear filters

### Performance
1. **Batch operations**: All changes saved in one transaction
2. **Optimistic updates**: Query invalidation after successful save
3. **Lazy loading**: Inventory data only loaded when dialog opens

### Data Integrity
1. **Quantity validation**: Prevents invalid quantities (< 0)
2. **Auto-cleanup**: Removing quantity to 0 removes the item
3. **Conflict prevention**: Plus button disabled when at max available

## Dialog Structure

```
┌─────────────────────────────────────────────────────────┐
│  Select Inventory Items                            [X]  │
│  Choose inventory items needed for this booking         │
├─────────────────────┬───────────────────────────────────┤
│ Selected Items      │ Available Items                   │
│ ├─ Category filter  │ ├─ Category filter                │
│ ├─ Search + Clear   │ ├─ Search + Clear                 │
│ └─ Table:           │ └─ Table:                         │
│    • Item Name      │    • Item Name                    │
│    • Category       │    • Category                     │
│    • Quantity       │    • Available (with warnings)    │
│    • [Remove]       │    • Selected quantity            │
│                     │    • [+] [Input] [Remove]         │
└─────────────────────┴───────────────────────────────────┘
│ X item(s) selected • Total quantity: Y   [Cancel] [Save]│
└─────────────────────────────────────────────────────────┘
```

## Differences from Previous Implementation

| Aspect | Previous (Manage) | Current (Select) |
|--------|------------------|------------------|
| **Approach** | CRUD operations | Selection-based |
| **Save behavior** | Immediate | Batch on "Save" |
| **Add item** | Dropdown + button | Inline + button |
| **Edit quantity** | Inline input in left | Inline input in right |
| **Remove item** | Left column only | Both columns |
| **Visual feedback** | Separate tables | Highlighted rows |
| **User flow** | Multi-step | Single-step |

## Files Modified
- `components/(Calendar)/BookingDialog.tsx`

## Testing Checklist
✅ Open booking dialog and click inventory "Manage" button
✅ Verify dialog opens with current booking inventory pre-selected
✅ Test category filters on both columns independently
✅ Test search functionality on both columns
✅ Add new items using + button
✅ Edit quantities using inline number input
✅ Remove items using trash button
✅ Verify selected items show in blue on right side
✅ Verify "Low Stock" warning appears
✅ Click Cancel - changes should not be saved
✅ Click Save - changes should persist
✅ Check toast notifications
✅ Verify booking inventory accordion updates after save
✅ Test with empty inventory
✅ Test filter reset buttons

## Benefits
1. ✨ **Familiar UX**: Matches the booking creation form
2. 🎯 **Fewer clicks**: Inline controls reduce steps
3. 💾 **Non-destructive**: Can cancel without saving
4. 🚀 **Better performance**: Batch operations instead of individual API calls
5. 📊 **Better visibility**: See selected vs available side-by-side
6. ⚠️ **Stock awareness**: Clear warnings for low/unavailable stock
7. 🔍 **Better search**: Independent filters for each column
