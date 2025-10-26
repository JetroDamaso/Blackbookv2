# Reports Page Design Update - Before & After Comparison

This document shows the transformation of the Reports page to match the established design system used throughout the Blackbook v2 application.

## Table of Contents
1. [Overview](#overview)
2. [Key Changes](#key-changes)
3. [Before & After Code](#before--after-code)
4. [Visual Comparison](#visual-comparison)
5. [Reusable Components Created](#reusable-components-created)
6. [Future Development](#future-development)

---

## Overview

### Problem
The original Reports page used a generic container-based layout (`container mx-auto py-6`) that didn't match the design patterns used in other management pages (Bookings, Clients, Pavilion, Inventory).

### Solution
Refactored the Reports page to follow the established design system:
- Integrated with SidebarProvider layout (already in place via ConditionalLayout)
- Added standard page header with SidebarTrigger
- Implemented widget system for quick stats and actions
- Updated content area styling to match other pages
- Created reusable components for consistency

---

## Key Changes

### 1. Layout Structure
**Before:**
```tsx
<div className="container mx-auto py-6 space-y-6">
  {/* Page content */}
</div>
```

**After:**
```tsx
<>
  <header className="bg-white mb-4 border-b-1...">
    {/* Header with SidebarTrigger */}
  </header>

  <div className="bg-muted flex flex-wrap gap-2 px-4 pb-2...">
    {/* Widgets */}
  </div>

  <div className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-muted...">
    {/* Content */}
  </div>
</>
```

### 2. Page Header
**Before:**
- Simple `<h1>` and `<p>` tags
- No sidebar integration
- No consistent styling

**After:**
- Standardized header component
- SidebarTrigger for mobile navigation
- Icon + title pattern matching other pages
- Proper height and spacing (`h-16`, `mb-4`)

### 3. Widget Section (NEW)
Added a widget section showing:
- **Report Type Widget**: Shows selected report type
- **Total Bookings Widget**: Shows number of bookings in generated report
- **Revenue Widget**: Shows total revenue when applicable
- **Action Widgets**: Quick links to Bookings and Dashboard

### 4. Content Area
**Before:**
```tsx
<div>
  <h2 className="text-2xl font-bold tracking-tight mb-4">Report Results</h2>
  <ReportDisplay ... />
</div>
```

**After:**
```tsx
<div className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-muted overflow-hidden">
  <Card>...</Card>
  <ReportDisplay ... />
</div>
```

### 5. Styling Updates

| Element | Before | After |
|---------|--------|-------|
| **Root Container** | `container mx-auto py-6` | Fragment with header, widgets, content |
| **Background** | Default (white) | `bg-muted` for content areas |
| **Spacing** | `space-y-6` | `gap-4` with proper padding |
| **Header** | N/A | `bg-white border-b-1 h-16` |
| **Title** | `text-3xl font-bold` | `text-lg font-semibold` (in header) |

---

## Before & After Code

### BEFORE (Original Implementation)

```tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { validateReportParams } from "@/lib/reports/utils";
import type { ReportType, Report, ReportParams } from "@/lib/reports/types";
import { ReportTypeSelector } from "@/components/reports/ReportTypeSelector";
import { ReportFilters } from "@/components/reports/ReportFilters";
import { ReportDisplay } from "@/components/reports/ReportDisplay";
import { Loader2 } from "lucide-react";

export default function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType | "">("");
  const [filters, setFilters] = useState<any>({});
  const [shouldGenerate, setShouldGenerate] = useState(false);
  const [reportParams, setReportParams] = useState<ReportParams | null>(null);

  // ... query hooks ...

  const handleGenerateReport = () => {
    // ... logic ...
  };

  const handleReportTypeChange = (type: ReportType) => {
    // ... logic ...
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">Generate custom reports based on your selection</p>
      </div>

      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Report Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ReportTypeSelector value={reportType} onChange={handleReportTypeChange} />
          <ReportFilters ... />
          <Button onClick={handleGenerateReport} ...>
            Generate Report
          </Button>
        </CardContent>
      </Card>

      {/* Report Results */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4">Report Results</h2>
        {error && <Card className="border-destructive">...</Card>}
        <ReportDisplay report={report || null} isLoading={isGenerating} />
      </div>
    </div>
  );
}
```

### AFTER (Updated Implementation)

```tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { toast } from "sonner";
import { validateReportParams } from "@/lib/reports/utils";
import type { ReportType, Report, ReportParams } from "@/lib/reports/types";
import { ReportTypeSelector } from "@/components/reports/ReportTypeSelector";
import { ReportFilters } from "@/components/reports/ReportFilters";
import { ReportDisplay } from "@/components/reports/ReportDisplay";
import { Loader2, FileText, BarChart3, TrendingUp } from "lucide-react";

export default function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType | "">("");
  const [filters, setFilters] = useState<any>({});
  const [shouldGenerate, setShouldGenerate] = useState(false);
  const [reportParams, setReportParams] = useState<ReportParams | null>(null);

  // ... query hooks ...

  const handleGenerateReport = () => {
    // ... logic ...
  };

  const handleReportTypeChange = (type: ReportType) => {
    // ... logic ...
  };

  // Calculate quick stats from report data
  const totalBookings = report?.bookings?.length || 0;
  const totalRevenue = report?.summary?.totalRevenue || 0;
  const averageRevenue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

  return (
    <>
      {/* Header Section */}
      <header className="bg-white mb-4 border-b-1 overflow-hidden flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4 w-full">
          <SidebarTrigger className="-ml-1 block md:hidden" />
          <p className="font-semibold text-lg flex items-center gap-2 grow">
            <FileText size={18} /> <span>Reports</span>
          </p>
        </div>
      </header>

      {/* Widget Section */}
      <div className="bg-muted flex flex-wrap gap-2 px-4 pb-2 overflow-x-auto">
        {/* Report Type Widget */}
        <div className="flex rounded-md p-4 bg-white border-1 items-center gap-2 min-w-[200px] flex-shrink-0">
          <div className="flex flex-col">
            <p className="text-md">Report Type</p>
            <p className="text-4xl font-semibold">{reportType ? "1" : "0"}</p>
            <p className="text-xs">
              {reportType ? (
                <>
                  Selected: <span className="text-primary">{reportType.replace(/_/g, " ")}</span>
                </>
              ) : (
                "No report selected"
              )}
            </p>
          </div>
        </div>

        {/* Total Bookings Widget (conditional) */}
        {report && (
          <div className="flex rounded-md p-4 bg-white border-1 items-center gap-2 min-w-[200px] flex-shrink-0">
            <div className="flex flex-col">
              <p className="text-md">Total Bookings</p>
              <p className="text-4xl font-semibold">{totalBookings}</p>
              <p className="text-xs">
                In this <span className="text-primary">report</span>
              </p>
            </div>
          </div>
        )}

        {/* Revenue Widget (conditional) */}
        {report && totalRevenue > 0 && (
          <div className="flex rounded-md p-4 bg-white border-1 items-center gap-2 min-w-[200px] flex-shrink-0">
            <div className="flex flex-col">
              <p className="text-md">Total Revenue</p>
              <p className="text-4xl font-semibold">
                ₱{totalRevenue.toLocaleString("en-PH", { minimumFractionDigits: 0 })}
              </p>
              <p className="text-xs">
                Average:{" "}
                <span className="text-primary">
                  ₱{averageRevenue.toLocaleString("en-PH", { minimumFractionDigits: 0 })}
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Action Widgets */}
        <div
          className="flex flex-col rounded-md p-4 bg-white border-1 items-center gap-2 justify-center cursor-pointer hover:bg-gray-50 transition-colors min-w-[120px] flex-shrink-0"
          onClick={() => (window.location.href = "/manage/bookings")}
        >
          <BarChart3 className="size-9 text-blue-600" />
          <p className="text-sm select-none">All Bookings</p>
        </div>

        <div
          className="flex flex-col rounded-md p-4 bg-white border-1 items-center gap-2 justify-center cursor-pointer hover:bg-gray-50 transition-colors min-w-[120px] flex-shrink-0"
          onClick={() => (window.location.href = "/dashboard")}
        >
          <TrendingUp className="size-9 text-blue-600" />
          <p className="text-sm select-none">Dashboard</p>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-muted overflow-hidden">
        {/* Report Configuration Card */}
        <Card>
          <CardHeader>
            <CardTitle>Report Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ReportTypeSelector value={reportType} onChange={handleReportTypeChange} />
            <ReportFilters ... />
            <Button onClick={handleGenerateReport} ...>
              {isGenerating ? "Generating..." : "Generate Report"}
            </Button>
          </CardContent>
        </Card>

        {/* Report Results */}
        {error && <Card className="border-destructive">...</Card>}
        <ReportDisplay report={report || null} isLoading={isGenerating} />
      </div>
    </>
  );
}
```

---

## Visual Comparison

### Layout Structure

**BEFORE:**
```
┌─────────────────────────────────────────┐
│  [No Sidebar Integration]               │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  Reports                          │ │ <- Plain heading
│  │  Generate custom reports...       │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  Report Configuration Card        │ │
│  │  [Dropdowns and filters]          │ │
│  │  [Generate Button]                │ │
│  └───────────────────────────────────┘ │
│                                         │
│  Report Results                         │ <- Plain heading
│  ┌───────────────────────────────────┐ │
│  │  [Report Display]                 │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**AFTER:**
```
┌─────────────────────────────────────────┐
│ ┌─────────────────────────────────────┐ │
│ │ 🔲 📄 Reports                       │ │ <- Integrated header
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌───┬───┬───┬───┬───┐                  │
│ │RT │TB │TR │AB │DB │                  │ <- Widget bar
│ └───┴───┴───┴───┴───┘                  │
│                                         │
│ ╔═════════════════════════════════════╗ │
│ ║ Report Configuration Card           ║ │
│ ║ [Dropdowns and filters]             ║ │
│ ║ [Generate Button]                   ║ │
│ ╚═════════════════════════════════════╝ │
│                                         │
│ ╔═════════════════════════════════════╗ │
│ ║ [Report Display]                    ║ │
│ ╚═════════════════════════════════════╝ │
└─────────────────────────────────────────┘

RT = Report Type Widget
TB = Total Bookings Widget
TR = Total Revenue Widget
AB = All Bookings Action
DB = Dashboard Action
```

### Widget Section Details

**Widget Types:**

1. **Stat Widget (Report Type):**
   ```
   ┌─────────────────┐
   │ Report Type     │ <- text-md
   │                 │
   │      1          │ <- text-4xl font-semibold
   │                 │
   │ Selected: XYZ   │ <- text-xs (with text-primary)
   └─────────────────┘
   ```

2. **Action Widget:**
   ```
   ┌───────────┐
   │           │
   │    📊     │ <- Icon (size-9)
   │           │
   │ View Data │ <- text-sm
   └───────────┘
   (Hover: bg-gray-50)
   ```

### Color Scheme

**BEFORE:**
- Background: White (default)
- Content: White cards on white background

**AFTER:**
- Header: `bg-white` with `border-b-1`
- Widget area: `bg-muted`
- Content area: `bg-muted`
- Cards: `bg-white` on muted background (better contrast)

---

## Reusable Components Created

### 1. PageHeader Component
**Location:** `components/layout/PageHeader.tsx`

**Purpose:** Standardized page header with icon, title, and optional actions

**Usage:**
```tsx
import { PageHeader } from "@/components/layout/PageHeader";
import { FileText } from "lucide-react";

<PageHeader
  icon={FileText}
  title="Reports"
  actions={<Button variant="outline">Export</Button>}
/>
```

**Features:**
- Integrated SidebarTrigger for mobile
- Consistent height (`h-16`)
- Proper spacing and layout
- Responsive behavior

### 2. WidgetContainer Component
**Location:** `components/layout/WidgetContainer.tsx`

**Purpose:** Container for stat and action widgets

**Usage:**
```tsx
import { WidgetContainer } from "@/components/layout/WidgetContainer";

<WidgetContainer>
  <StatWidget ... />
  <ActionWidget ... />
</WidgetContainer>
```

**Features:**
- Horizontal scroll support
- Consistent spacing (`gap-2`)
- Proper background (`bg-muted`)

### 3. PageContent Component
**Location:** `components/layout/PageContent.tsx`

**Purpose:** Main content area wrapper

**Usage:**
```tsx
import { PageContent } from "@/components/layout/PageContent";

<PageContent>
  <Card>...</Card>
  <DataTable ... />
</PageContent>
```

**Features:**
- Consistent padding (`p-4 pt-0`)
- Proper background (`bg-muted`)
- Overflow handling

### 4. StatWidget Component
**Location:** `components/ui/stat-widget.tsx`

**Purpose:** Display statistics and metrics

**Usage:**
```tsx
import { StatWidget } from "@/components/ui/stat-widget";

<StatWidget
  label="Total Bookings"
  value={1234}
  description={<>Active <span className="text-primary">bookings</span></>}
/>
```

**Features:**
- Consistent styling
- Typography scale (text-md, text-4xl, text-xs)
- Optional description with custom formatting

### 5. ActionWidget Component
**Location:** `components/ui/action-widget.tsx`

**Purpose:** Clickable action buttons with icons

**Usage:**
```tsx
import { ActionWidget } from "@/components/ui/action-widget";
import { Notebook } from "lucide-react";

<ActionWidget
  icon={Notebook}
  label="View Reports"
  onClick={() => router.push('/reports')}
  iconColor="text-blue-600"
/>
```

**Features:**
- Hover states
- Consistent icon sizing
- Proper cursor and transitions

---

## Future Development

### Using the New Components

For **new pages**, you can now use these reusable components:

```tsx
"use client";
import { PageHeader } from "@/components/layout/PageHeader";
import { WidgetContainer } from "@/components/layout/WidgetContainer";
import { PageContent } from "@/components/layout/PageContent";
import { StatWidget } from "@/components/ui/stat-widget";
import { ActionWidget } from "@/components/ui/action-widget";
import { YourIcon, Notebook } from "lucide-react";

export default function YourPage() {
  return (
    <>
      <PageHeader icon={YourIcon} title="Your Page" />

      <WidgetContainer>
        <StatWidget
          label="Total Items"
          value={123}
          description={<>Description <span className="text-primary">here</span></>}
        />
        <ActionWidget
          icon={Notebook}
          label="Reports"
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

### Refactoring Existing Pages

**Recommended approach for existing pages:**

1. **Keep functionality intact** - Don't change the business logic
2. **Extract widget sections** - Replace inline widget divs with `<StatWidget>` and `<ActionWidget>`
3. **Replace header** - Use `<PageHeader>` component
4. **Wrap content** - Use `<PageContent>` wrapper

**Example refactor for Bookings page:**

**Before:**
```tsx
<header className="bg-white mb-4 border-b-1...">
  <div className="flex items-center gap-2 px-4 w-full">
    <SidebarTrigger className="-ml-1 block md:hidden" />
    <p className="font-semibold text-lg flex items-center gap-2 grow">
      <CalendarCheck size={18} /> <span>Bookings</span>
    </p>
  </div>
</header>
```

**After:**
```tsx
import { PageHeader } from "@/components/layout/PageHeader";
import { CalendarCheck } from "lucide-react";

<PageHeader icon={CalendarCheck} title="Bookings" />
```

### Template for New Pages

A complete template is available in the design system documentation (`lib/design-system.md`).

Key sections:
- Header with SidebarTrigger
- Widget area (optional)
- Content area with cards/tables

### Design System Checklist

When creating a new page, ensure:

- ✅ Uses fragment (`<>`) as root element (not `<div className="container">`)
- ✅ Includes `<PageHeader>` with proper icon and title
- ✅ Widget section uses `bg-muted` background
- ✅ Widgets have `min-w-[...]` and `flex-shrink-0`
- ✅ Content area has `bg-muted` background
- ✅ Proper spacing (`gap-2` for widgets, `gap-4` for content)
- ✅ Typography follows scale (text-4xl for stats, text-md for labels)
- ✅ Interactive elements have hover states
- ✅ Icons use consistent sizing (size={18} for headers, size-9 for actions)

---

## Summary

### Changes Made
1. ✅ Updated Reports page layout structure
2. ✅ Added standard page header with SidebarTrigger
3. ✅ Implemented widget system with stat and action widgets
4. ✅ Updated content area styling
5. ✅ Created 5 reusable components
6. ✅ Documented design system patterns
7. ✅ Created before/after comparison

### Benefits
- **Visual Consistency**: Reports page now matches other management pages
- **Better UX**: Widget system provides quick insights and actions
- **Maintainability**: Reusable components reduce code duplication
- **Scalability**: Easy to create new pages following the pattern
- **Mobile Support**: Integrated SidebarTrigger for responsive navigation

### Next Steps
1. **Test the updated Reports page** to ensure all functionality works
2. **Consider refactoring other pages** to use the new reusable components
3. **Use the template** when creating new pages
4. **Update documentation** as new patterns emerge

---

## References

- **Design System:** `lib/design-system.md`
- **Updated Reports Page:** `app/(reports)/reports/page.tsx`
- **Reusable Components:** `components/layout/*` and `components/ui/*-widget.tsx`
- **Existing Pages:** `app/manage/bookings/page.tsx`, `app/manage/clients/page.tsx`, etc.
