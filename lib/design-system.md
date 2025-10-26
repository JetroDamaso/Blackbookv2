# Design System Documentation

This document outlines the design patterns and styling conventions used throughout the Blackbook v2 application to ensure visual consistency across all pages.

## Table of Contents
1. [Layout Structure](#layout-structure)
2. [Page Header Pattern](#page-header-pattern)
3. [Widget System](#widget-system)
4. [Typography Scale](#typography-scale)
5. [Spacing System](#spacing-system)
6. [Color Palette](#color-palette)
7. [Component Patterns](#component-patterns)
8. [Interactive States](#interactive-states)

---

## Layout Structure

### Standard Page Layout
All pages follow the SidebarProvider pattern with SidebarInset structure:

```tsx
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function Page() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header Section */}
        <header className="...">
          {/* Header content */}
        </header>

        {/* Widget Section (optional) */}
        <div className="bg-muted flex flex-wrap gap-2 px-4 pb-2 overflow-x-auto">
          {/* Widgets */}
        </div>

        {/* Content Section */}
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-muted overflow-hidden">
          {/* Main content */}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
```

**Key Classes:**
- Layout wrapper: `SidebarProvider` → `SidebarInset`
- Content background: `bg-muted`
- Content padding: `p-4` (with `pt-0` for top)
- Content layout: `flex flex-1 flex-col gap-4`
- Overflow handling: `overflow-hidden` on content container

---

## Page Header Pattern

### Standard Header Structure
```tsx
<header className="bg-white mb-4 border-b-1 overflow-hidden flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
  <div className="flex items-center gap-2 px-4 w-full">
    <SidebarTrigger className="-ml-1 block md:hidden" />
    <p className="font-semibold text-lg flex items-center gap-2 grow">
      <IconComponent size={18} /> <span>Page Title</span>
    </p>
    {/* Optional: Action buttons */}
    <Button variant="outline">Action</Button>
  </div>
</header>
```

**Key Classes:**
- Background: `bg-white`
- Border: `border-b-1` (bottom border)
- Height: `h-16` (fixed height)
- Margin: `mb-4` (bottom margin)
- Layout: `flex items-center gap-2`
- Shrink behavior: `shrink-0` (prevent shrinking)
- Responsive: `group-has-data-[collapsible=icon]/sidebar-wrapper:h-12`

**Title Pattern:**
- Font: `font-semibold text-lg`
- Icon size: `size={18}` (Lucide icons)
- Layout: `flex items-center gap-2`
- Flex grow: `grow` (takes available space)

---

## Widget System

### Widget Container
Widgets are displayed in a horizontal scrollable container below the header:

```tsx
<div className="bg-muted flex flex-wrap gap-2 px-4 pb-2 overflow-x-auto">
  {/* Stat widgets */}
  {/* Action widgets */}
</div>
```

**Key Classes:**
- Background: `bg-muted`
- Layout: `flex flex-wrap gap-2`
- Padding: `px-4 pb-2`
- Scroll: `overflow-x-auto` (horizontal scroll if needed)

### Stat Widget (Information Display)
Display statistics and metrics:

```tsx
<div className="flex rounded-md p-4 bg-white border-1 items-center gap-2 min-w-[200px] flex-shrink-0">
  <div className="flex flex-col">
    <p className="text-md">Label</p>
    <p className="text-4xl font-semibold">1,234</p>
    <p className="text-xs">
      Description <span className="text-primary">highlighted</span>
    </p>
  </div>
</div>
```

**Key Classes:**
- Container: `flex rounded-md p-4 bg-white border-1 items-center gap-2`
- Sizing: `min-w-[200px] flex-shrink-0` (minimum width, no shrinking)
- Content: `flex flex-col` (vertical layout)

**Text Hierarchy:**
1. Label: `text-md` (medium size)
2. Main value: `text-4xl font-semibold` (large, bold)
3. Description: `text-xs` (extra small)
4. Highlights: `text-primary` (accent color)

### Extended Stat Widget (Multiple Metrics)
For displaying multiple related metrics with visual separators:

```tsx
<div className="flex rounded-md p-4 bg-white border-1 items-center gap-6 min-w-[400px] flex-shrink-0">
  <div className="flex flex-col">
    <p className="text-md">Metric 1</p>
    <p className="text-4xl font-semibold flex items-center">
      123 <Dot className="text-orange-500 size-12 -ml-3" />
    </p>
    <p className="text-xs">75% of total</p>
  </div>
  <div className="h-16 border-1"></div>
  <div className="flex flex-col">
    <p className="text-md">Metric 2</p>
    <p className="text-4xl font-semibold flex items-center">
      45 <Dot className="text-teal-500 size-12 -ml-3" />
    </p>
    <p className="text-xs">25% of total</p>
  </div>
  {/* Additional metrics... */}
</div>
```

**Key Classes:**
- Gap between metrics: `gap-6`
- Separator: `h-16 border-1` (vertical divider)
- Colored dots: `text-{color}-500 size-12 -ml-3`
- Minimum width: `min-w-[400px]` for extended widgets

### Action Widget (Interactive)
For clickable actions and navigation:

```tsx
<div
  className="flex flex-col rounded-md p-4 bg-white border-1 items-center gap-2 justify-center cursor-pointer hover:bg-gray-50 transition-colors min-w-[120px] flex-shrink-0"
  onClick={() => handleAction()}
>
  <IconComponent className="size-9 text-blue-600" />
  <p className="text-sm select-none">Action Label</p>
</div>
```

**Key Classes:**
- Base: Same as stat widget
- Interactive: `cursor-pointer hover:bg-gray-50 transition-colors`
- Icon: `size-9 text-blue-600` (larger icon, blue color)
- Text: `text-sm select-none`
- Sizing: `min-w-[120px]` (narrower than stat widgets)
- Layout: `justify-center` (center content)

---

## Typography Scale

### Hierarchy
The application uses a consistent typography scale:

| Element | Class | Usage |
|---------|-------|-------|
| **Page Title** | `text-lg font-semibold` | Main page headers |
| **Main Stat** | `text-4xl font-semibold` | Large numbers/metrics |
| **Widget Label** | `text-md` | Widget titles |
| **Body Text** | `text-sm` | Action labels, buttons |
| **Secondary Text** | `text-xs` | Descriptions, metadata |

### Font Weights
- **Semibold** (`font-semibold`): Page titles, stat values
- **Medium** (`font-medium`): Table data, emphasized text
- **Regular** (default): Body text, descriptions

### Text Colors
- **Default**: Inherits from theme (black/white based on theme)
- **Primary**: `text-primary` - Brand color for highlights
- **Muted**: `text-muted-foreground` - Less important text
- **Colored**: `text-{color}-500` - Status indicators (orange, blue, teal, etc.)

---

## Spacing System

### Gap Spacing
- **gap-2**: `0.5rem` (8px) - Widget container, tight spacing
- **gap-4**: `1rem` (16px) - Content sections, moderate spacing
- **gap-6**: `1.5rem` (24px) - Extended widget metrics

### Padding
- **p-4**: `1rem` (16px) - Widget cards, content areas
- **px-4**: Horizontal only - Widget container, header
- **pb-2**: `0.5rem` (8px) - Bottom only for widget container
- **pt-0**: Remove top padding from content section

### Margin
- **mb-4**: `1rem` (16px) - Header bottom margin
- **-ml-1**: `-0.25rem` (-4px) - SidebarTrigger negative margin
- **-ml-3**: `-0.75rem` (-12px) - Dot icon overlap

### Sizing
- **h-16**: `4rem` (64px) - Header height
- **h-12**: `3rem` (48px) - Collapsed sidebar header
- **min-w-[200px]**: Minimum width for stat widgets
- **min-w-[120px]**: Minimum width for action widgets
- **min-w-[400px]**: Minimum width for extended widgets

---

## Color Palette

### Background Colors
- **White**: `bg-white` - Headers, widget cards
- **Muted**: `bg-muted` - Content areas, widget container
- **Muted/50**: `bg-muted/50` - Subtle backgrounds (dashboard)
- **Gray-50**: `bg-gray-50` - Hover state for action widgets

### Border Colors
- **Default**: `border-1` - Standard borders (uses theme border color)
- **Bottom**: `border-b-1` - Header bottom border

### Accent Colors
- **Primary**: `text-primary` - Brand color highlights
- **Blue-600**: `text-blue-600` - Action widget icons
- **Orange-500**: `text-orange-500` - Warnings, low stock alerts
- **Teal-500**: `text-teal-500` - Secondary metrics
- **Cyan-500**: `text-cyan-500` - Tertiary metrics

### Status Colors
Status badges and indicators:
- **Active/Default**: Primary color
- **Completed/Success**: Green
- **Cancelled/Error**: Red (destructive)
- **Pending**: Secondary/gray

---

## Component Patterns

### Badge Component
Status indicators using the Shadcn Badge component:

```tsx
import { Badge } from "@/components/ui/badge";

// Status badge
<Badge variant={status === 1 ? "default" : "secondary"}>
  {statusText}
</Badge>
```

**Variants:**
- `default`: Primary brand color
- `secondary`: Gray/muted
- `destructive`: Red for errors/cancelled
- `outline`: Bordered variant

**Key Classes:**
- `rounded-full` - Fully rounded
- `px-1.5 text-xs font-medium` - Compact sizing
- `w-fit whitespace-nowrap shrink-0` - Size to content

### Button Component
Standard button component with consistent styling:

```tsx
import { Button } from "@/components/ui/button";

// Column header sort button
<Button variant="ghost" onClick={handleClick}>
  Label
  <ArrowUpDown className="ml-2 h-4 w-4" />
</Button>
```

**Variants:**
- `default`: Primary brand color with shadow
- `outline`: Bordered with subtle shadow
- `ghost`: Transparent, hover effect only
- `secondary`: Gray background
- `destructive`: Red for dangerous actions
- `link`: Text link style

**Sizes:**
- `default`: `h-9 px-4 py-2`
- `sm`: `h-8 px-3 text-xs`
- `lg`: `h-10 px-8`
- `icon`: `size-9` (square)

### Data Table Pattern
Tables use TanStack Table with consistent column styling:

```tsx
import { DataTable } from "./data-table";
import { columns } from "./columns";

<DataTable
  columns={columns}
  data={data || []}
  onRowClick={handleRowClick}
/>
```

**Column Headers:**
- Use `Button variant="ghost"` for sortable columns
- Include `ArrowUpDown` icon for sort indicators
- Size: `h-4 w-4` with `ml-2` margin

**Cell Formatting:**
- `font-medium`: Important data (names, IDs)
- `text-center`: Numeric data alignment
- `text-right`: Currency/balance alignment

### Card Pattern
For larger content sections:

```tsx
<div className="rounded-xl bg-white border-1 p-6">
  {/* Card content */}
</div>
```

**Key Classes:**
- Rounded: `rounded-xl` (larger radius for cards vs `rounded-md` for widgets)
- Background: `bg-white`
- Border: `border-1`
- Padding: `p-6` (larger padding than widgets)

---

## Interactive States

### Hover States
- **Action Widgets**: `hover:bg-gray-50` with `transition-colors`
- **Buttons**: Defined in `buttonVariants` (e.g., `hover:bg-primary/90`)
- **Table Rows**: Custom hover states in DataTable component

### Focus States
- **Buttons**: `focus-visible:ring-ring/50 focus-visible:ring-[3px]`
- **Inputs**: Similar ring styling for consistency
- **Outline**: `outline-none` to rely on ring only

### Transitions
- **Colors**: `transition-colors` for background/text changes
- **Combined**: `transition-[color,box-shadow]` for buttons/badges
- **Size**: `transition-[width,height]` for header responsive behavior

### Cursor States
- **Clickable**: `cursor-pointer` for action widgets
- **Non-selectable**: `select-none` for UI labels in action widgets

---

## Icon Guidelines

### Lucide React Icons
All icons use Lucide React library:

```tsx
import { IconName } from "lucide-react";

// Header icon
<IconName size={18} />

// Action widget icon
<IconName className="size-9 text-blue-600" />

// Dot indicator
<Dot className="text-orange-500 size-12 -ml-3" />
```

**Standard Sizes:**
- **size={18}**: Page title headers
- **size-9**: Action widget icons
- **size-12**: Dot indicators in stats
- **h-4 w-4**: Table sort icons

**Icon Colors:**
- **text-blue-600**: Standard action widgets
- **text-primary**: Primary actions
- **text-{color}-500**: Status/category indicators

---

## Responsive Behavior

### Mobile Considerations
- **SidebarTrigger**: `block md:hidden` - Show only on mobile
- **Header Height**: Responsive with `group-has-data-[collapsible=icon]` states
- **Widget Container**: `overflow-x-auto` for horizontal scrolling
- **Widget Sizing**: `min-w-[...]` prevents shrinking on small screens
- **Flex Wrap**: `flex-wrap` allows widgets to stack on narrow screens

### Flex Shrink/Grow
- **Header**: `shrink-0` prevents height collapse
- **Widgets**: `flex-shrink-0` prevents width compression
- **Title**: `grow` takes available horizontal space

---

## Best Practices

### Do's ✅
- Use SidebarProvider layout for all pages
- Include SidebarTrigger in header for mobile
- Use consistent widget styling (rounded-md p-4 bg-white border-1)
- Follow typography scale (text-4xl for stats, text-md for labels, text-xs for descriptions)
- Apply `bg-muted` to content areas
- Use `gap-2` in widget container, `gap-4` in content area
- Add hover states to clickable elements
- Use `flex-shrink-0` on widgets to prevent compression
- Include minimum widths on widgets

### Don'ts ❌
- Don't use `container mx-auto` for page layouts
- Don't mix spacing values (stick to gap-2, gap-4, gap-6)
- Don't use arbitrary text sizes (use the scale)
- Don't forget `overflow-x-auto` on widget container
- Don't use different padding values for widgets
- Don't forget `transition-colors` on interactive elements
- Don't use different border classes (use border-1 consistently)
- Don't skip the muted background on content areas

---

## Example: Complete Page Template

```tsx
"use client";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { IconName, Notebook } from "lucide-react";

export default function PageName() {
  const { data, isPending, error } = useQuery({
    queryKey: ["data"],
    queryFn: () => fetchData(),
  });

  if (isPending) return <div className="container mx-auto py-10">Loading...</div>;
  if (error) return <div className="container mx-auto py-10 text-red-500">Error: {error.message}</div>;

  return (
    <>
      {/* Header Section */}
      <header className="bg-white mb-4 border-b-1 overflow-hidden flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4 w-full">
          <SidebarTrigger className="-ml-1 block md:hidden" />
          <p className="font-semibold text-lg flex items-center gap-2 grow">
            <IconName size={18} /> <span>Page Title</span>
          </p>
          <Button variant="outline">Optional Action</Button>
        </div>
      </header>

      {/* Widget Section */}
      <div className="bg-muted flex flex-wrap gap-2 px-4 pb-2 overflow-x-auto">
        {/* Stat Widget */}
        <div className="flex rounded-md p-4 bg-white border-1 items-center gap-2 min-w-[200px] flex-shrink-0">
          <div className="flex flex-col">
            <p className="text-md">Total Items</p>
            <p className="text-4xl font-semibold">1,234</p>
            <p className="text-xs">
              Description <span className="text-primary">highlighted</span>
            </p>
          </div>
        </div>

        {/* Action Widget */}
        <div
          className="flex flex-col rounded-md p-4 bg-white border-1 items-center gap-2 justify-center cursor-pointer hover:bg-gray-50 transition-colors min-w-[120px] flex-shrink-0"
          onClick={() => window.location.href = "/reports"}
        >
          <Notebook className="size-9 text-blue-600" />
          <p className="text-sm select-none">View Reports</p>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-muted overflow-hidden">
        {/* Main content goes here (tables, cards, etc.) */}
      </div>
    </>
  );
}
```

---

## Changelog

**Version 1.0** (Current)
- Initial design system documentation
- Extracted patterns from existing pages (bookings, clients, pavilion, inventory, additional-charges)
- Documented layout structure, widgets, typography, spacing, colors, components, and interactive states
