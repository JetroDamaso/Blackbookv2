# Page Template - Quick Start Guide

This is a quick reference template for creating new pages in Blackbook v2 that follow the established design system.

## Quick Copy-Paste Template

```tsx
"use client";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { YourIcon, Notebook } from "lucide-react"; // Replace YourIcon with your page icon

export default function YourPage() {
  // Your data fetching and state management here
  const { data, isPending, error } = useQuery({
    queryKey: ["yourData"],
    queryFn: () => fetchYourData(),
  });

  if (isPending) return <div className="container mx-auto py-10">Loading...</div>;
  if (error) return <div className="container mx-auto py-10 text-red-500">Error: {error.message}</div>;

  return (
    <>
      {/* ==================== HEADER SECTION ==================== */}
      <header className="bg-white mb-4 border-b-1 overflow-hidden flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4 w-full">
          <SidebarTrigger className="-ml-1 block md:hidden" />
          <p className="font-semibold text-lg flex items-center gap-2 grow">
            <YourIcon size={18} /> <span>Your Page Title</span>
          </p>
          {/* Optional: Add action buttons */}
          <Button variant="outline">Optional Action</Button>
        </div>
      </header>

      {/* ==================== WIDGET SECTION ==================== */}
      <div className="bg-muted flex flex-wrap gap-2 px-4 pb-2 overflow-x-auto">

        {/* STAT WIDGET - Display metrics/statistics */}
        <div className="flex rounded-md p-4 bg-white border-1 items-center gap-2 min-w-[200px] flex-shrink-0">
          <div className="flex flex-col">
            <p className="text-md">Metric Label</p>
            <p className="text-4xl font-semibold">1,234</p>
            <p className="text-xs">
              Description <span className="text-primary">highlighted text</span>
            </p>
          </div>
        </div>

        {/* EXTENDED STAT WIDGET - Multiple related metrics with separators */}
        <div className="flex rounded-md p-4 bg-white border-1 items-center gap-6 min-w-[400px] flex-shrink-0">
          <div className="flex flex-col">
            <p className="text-md">Metric 1</p>
            <p className="text-4xl font-semibold">123</p>
            <p className="text-xs">75% of total</p>
          </div>
          <div className="h-16 border-1"></div> {/* Separator */}
          <div className="flex flex-col">
            <p className="text-md">Metric 2</p>
            <p className="text-4xl font-semibold">45</p>
            <p className="text-xs">25% of total</p>
          </div>
        </div>

        {/* ACTION WIDGET - Clickable actions */}
        <div
          className="flex flex-col rounded-md p-4 bg-white border-1 items-center gap-2 justify-center cursor-pointer hover:bg-gray-50 transition-colors min-w-[120px] flex-shrink-0"
          onClick={() => window.location.href = "/reports"}
        >
          <Notebook className="size-9 text-blue-600" />
          <p className="text-sm select-none">View Reports</p>
        </div>

      </div>

      {/* ==================== CONTENT SECTION ==================== */}
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-muted overflow-hidden">

        {/* Your main content goes here */}
        {/* Examples: Cards, DataTables, Forms, etc. */}

        {/* Example: Card with content */}
        {/* <Card>
          <CardHeader>
            <CardTitle>Section Title</CardTitle>
          </CardHeader>
          <CardContent>
            Your content here
          </CardContent>
        </Card> */}

        {/* Example: Data Table */}
        {/* <DataTable columns={columns} data={data || []} onRowClick={handleRowClick} /> */}

      </div>
    </>
  );
}
```

---

## Using Reusable Components (Alternative Approach)

If you want to use the new reusable components instead of inline code:

```tsx
"use client";
import { PageHeader } from "@/components/layout/PageHeader";
import { WidgetContainer } from "@/components/layout/WidgetContainer";
import { PageContent } from "@/components/layout/PageContent";
import { StatWidget } from "@/components/ui/stat-widget";
import { ActionWidget } from "@/components/ui/action-widget";
import { YourIcon, Notebook } from "lucide-react";

export default function YourPage() {
  // Your logic here

  return (
    <>
      <PageHeader
        icon={YourIcon}
        title="Your Page Title"
        actions={<Button variant="outline">Action</Button>}
      />

      <WidgetContainer>
        <StatWidget
          label="Metric Label"
          value={1234}
          description={<>Description <span className="text-primary">highlighted</span></>}
        />

        <ActionWidget
          icon={Notebook}
          label="View Reports"
          onClick={() => window.location.href = '/reports'}
        />
      </WidgetContainer>

      <PageContent>
        {/* Your content here */}
      </PageContent>
    </>
  );
}
```

---

## Widget Variations

### Basic Stat Widget
```tsx
<div className="flex rounded-md p-4 bg-white border-1 items-center gap-2 min-w-[200px] flex-shrink-0">
  <div className="flex flex-col">
    <p className="text-md">Label</p>
    <p className="text-4xl font-semibold">Value</p>
    <p className="text-xs">Description</p>
  </div>
</div>
```

### Stat Widget with Colored Value
```tsx
<div className="flex rounded-md p-4 bg-white border-1 items-center gap-2 min-w-[200px] flex-shrink-0">
  <div className="flex flex-col">
    <p className="text-md">Low Stock Alert</p>
    <p className="text-4xl font-semibold text-orange-500">5</p>
    <p className="text-xs">Items <span className="text-orange-500">below 10</span></p>
  </div>
</div>
```

### Stat Widget with Currency
```tsx
<div className="flex rounded-md p-4 bg-white border-1 items-center gap-2 min-w-[200px] flex-shrink-0">
  <div className="flex flex-col">
    <p className="text-md">Total Revenue</p>
    <p className="text-4xl font-semibold">
      ₱{value.toLocaleString("en-PH", { minimumFractionDigits: 0 })}
    </p>
    <p className="text-xs">This <span className="text-primary">month</span></p>
  </div>
</div>
```

### Conditional Widget (Show only when data exists)
```tsx
{data && (
  <div className="flex rounded-md p-4 bg-white border-1 items-center gap-2 min-w-[200px] flex-shrink-0">
    <div className="flex flex-col">
      <p className="text-md">Conditional Stat</p>
      <p className="text-4xl font-semibold">{data.value}</p>
      <p className="text-xs">Only shown when data exists</p>
    </div>
  </div>
)}
```

---

## Common Patterns

### Role-Based Widgets
```tsx
const userRole = session?.user?.role;

const renderWidgets = () => {
  if (userRole === "Owner") {
    return (
      <>
        <StatWidget label="Owner Metric" value={123} />
        {/* Owner-specific widgets */}
      </>
    );
  }

  if (userRole === "Manager") {
    return (
      <>
        <StatWidget label="Manager Metric" value={456} />
        {/* Manager-specific widgets */}
      </>
    );
  }

  // Default widgets for all roles
  return (
    <>
      <StatWidget label="Default Metric" value={789} />
    </>
  );
};

// In JSX:
<WidgetContainer>
  {renderWidgets()}
  {/* Common action widgets */}
  <ActionWidget ... />
</WidgetContainer>
```

### Widgets with Icons
```tsx
<div className="flex rounded-md p-4 bg-white border-1 items-center gap-2 min-w-[200px] flex-shrink-0">
  <IconComponent className="size-12 text-blue-600" />
  <div className="flex flex-col">
    <p className="text-md">With Icon</p>
    <p className="text-4xl font-semibold">123</p>
    <p className="text-xs">Description</p>
  </div>
</div>
```

### Loading State
```tsx
if (isPending) {
  return (
    <div className="container mx-auto py-10">
      <div className="text-center">Loading...</div>
    </div>
  );
}
```

### Error State
```tsx
if (error) {
  return (
    <div className="container mx-auto py-10">
      <div className="text-center text-red-500">
        Error: {error.message}
      </div>
    </div>
  );
}
```

---

## Design System Checklist

Before committing your new page, verify:

- [ ] Root element is fragment (`<>`) not a div container
- [ ] Header uses standard pattern with SidebarTrigger
- [ ] Header icon is `size={18}`
- [ ] Header title is `font-semibold text-lg`
- [ ] Widget container has `bg-muted` background
- [ ] Widgets have `min-w-[...]` and `flex-shrink-0`
- [ ] Widget labels use `text-md`
- [ ] Widget values use `text-4xl font-semibold`
- [ ] Widget descriptions use `text-xs`
- [ ] Action widget icons are `size-9`
- [ ] Action widgets have hover state (`hover:bg-gray-50 transition-colors`)
- [ ] Content area has `bg-muted` background
- [ ] Content area uses `gap-4` spacing
- [ ] Cards on muted background provide good contrast

---

## Typography Reference

| Element | Class | Example |
|---------|-------|---------|
| Page Title (Header) | `text-lg font-semibold` | "Reports" |
| Widget Value | `text-4xl font-semibold` | "1,234" |
| Widget Label | `text-md` | "Total Items" |
| Widget Description | `text-xs` | "In inventory" |
| Action Label | `text-sm select-none` | "View Reports" |
| Highlight Text | `text-primary` | Important values |

---

## Spacing Reference

| Property | Class | Value | Usage |
|----------|-------|-------|-------|
| Header Height | `h-16` | 4rem (64px) | Fixed header height |
| Header Margin | `mb-4` | 1rem (16px) | Space below header |
| Widget Gap | `gap-2` | 0.5rem (8px) | Between widgets |
| Content Gap | `gap-4` | 1rem (16px) | Between content sections |
| Widget Padding | `p-4` | 1rem (16px) | Inside widget cards |
| Content Padding | `p-4 pt-0` | 1rem (16px) / 0 | Content area padding |
| Widget Container | `px-4 pb-2` | 1rem / 0.5rem | Horizontal + bottom |

---

## Color Reference

| Element | Class | Color |
|---------|-------|-------|
| Header Background | `bg-white` | White |
| Header Border | `border-b-1` | Border color |
| Widget Container | `bg-muted` | Light gray |
| Widget Card | `bg-white` | White |
| Widget Border | `border-1` | Border color |
| Content Area | `bg-muted` | Light gray |
| Primary Highlight | `text-primary` | Brand color |
| Action Icon | `text-blue-600` | Blue |
| Warning/Alert | `text-orange-500` | Orange |

---

## Icon Size Reference

| Usage | Class | Size |
|-------|-------|------|
| Header Icon | `size={18}` | 18px |
| Action Widget Icon | `size-9` | 2.25rem (36px) |
| Table Sort Icon | `h-4 w-4` | 1rem (16px) |
| Widget Icon (large) | `size-12` | 3rem (48px) |

---

## Common Icons

```tsx
import {
  FileText,        // Reports
  CalendarCheck,   // Bookings
  Users,           // Clients
  Castle,          // Pavilion
  Wine,            // Inventory
  DollarSign,      // Additional Charges
  BarChart3,       // Charts/Analytics
  TrendingUp,      // Dashboard
  Notebook,        // Notes/Reports
  Settings,        // Settings
  Package,         // Packages
  CreditCard,      // Payments
} from "lucide-react";
```

---

## Full Example: Event Types Page

```tsx
"use client";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Notebook } from "lucide-react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { getAllEventTypes } from "@/server/EventTypes/Actions/pullActions";

export default function ManageEventTypes() {
  const { isPending, error, data } = useQuery({
    queryKey: ["allEventTypes"],
    queryFn: () => getAllEventTypes(),
  });

  if (isPending) return <div className="container mx-auto py-10">Loading...</div>;
  if (error) return <div className="container mx-auto py-10 text-red-500">Error: {error.message}</div>;

  const totalEventTypes = data?.length || 0;
  const activeEvents = data?.filter(et => et.isActive).length || 0;

  return (
    <>
      {/* Header */}
      <header className="bg-white mb-4 border-b-1 overflow-hidden flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4 w-full">
          <SidebarTrigger className="-ml-1 block md:hidden" />
          <p className="font-semibold text-lg flex items-center gap-2 grow">
            <Calendar size={18} /> <span>Event Types</span>
          </p>
        </div>
      </header>

      {/* Widgets */}
      <div className="bg-muted flex flex-wrap gap-2 px-4 pb-2 overflow-x-auto">
        <div className="flex rounded-md p-4 bg-white border-1 items-center gap-2 min-w-[200px] flex-shrink-0">
          <div className="flex flex-col">
            <p className="text-md">Total Event Types</p>
            <p className="text-4xl font-semibold">{totalEventTypes}</p>
            <p className="text-xs">Available <span className="text-primary">types</span></p>
          </div>
        </div>

        <div className="flex rounded-md p-4 bg-white border-1 items-center gap-2 min-w-[200px] flex-shrink-0">
          <div className="flex flex-col">
            <p className="text-md">Active Types</p>
            <p className="text-4xl font-semibold">{activeEvents}</p>
            <p className="text-xs">Currently <span className="text-primary">in use</span></p>
          </div>
        </div>

        <div
          className="flex flex-col rounded-md p-4 bg-white border-1 items-center gap-2 justify-center cursor-pointer hover:bg-gray-50 transition-colors min-w-[120px] flex-shrink-0"
          onClick={() => window.location.href = "/reports"}
        >
          <Notebook className="size-9 text-blue-600" />
          <p className="text-sm select-none">View Reports</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-muted overflow-hidden">
        <DataTable columns={columns} data={data || []} />
      </div>
    </>
  );
}
```

---

## Quick Tips

1. **Always use fragments** (`<>`) as the root element for page components
2. **Don't skip the widget section** - even if you only have one widget, it provides visual consistency
3. **Use conditional rendering** for widgets that depend on data
4. **Keep action widgets at the end** of the widget section
5. **Use semantic icons** that match the page purpose
6. **Test mobile responsiveness** - ensure SidebarTrigger works properly
7. **Follow the typography scale** - don't use arbitrary text sizes
8. **Add hover states** to interactive elements
9. **Use loading and error states** for better UX
10. **Reference existing pages** when in doubt

---

## Additional Resources

- **Design System Documentation:** `lib/design-system.md`
- **Reusable Components:** `components/layout/*` and `components/ui/*-widget.tsx`
- **Example Pages:** `app/manage/bookings/page.tsx`, `app/manage/clients/page.tsx`
- **Reports Update Guide:** `REPORTS_DESIGN_UPDATE.md`

---

**Happy coding! 🚀**
