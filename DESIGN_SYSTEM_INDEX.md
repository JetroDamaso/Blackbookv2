# Design System Documentation Index

Welcome to the Blackbook v2 Design System documentation. This index will help you navigate all the design system resources.

---

## 📚 Quick Navigation

### For Quick Start
👉 **[Page Template Guide](templates/page-template.md)** - Copy-paste template and quick reference

### For Comprehensive Understanding
👉 **[Design System Documentation](lib/design-system.md)** - Complete patterns and guidelines

### For Understanding the Changes
👉 **[Reports Design Update](REPORTS_DESIGN_UPDATE.md)** - Before/after comparison

### For Overview
👉 **[Implementation Summary](DESIGN_SYSTEM_SUMMARY.md)** - What was done and why

---

## 📖 Documentation Structure

### 1. Quick Start (Start Here!)
**File:** `templates/page-template.md`

**Use this when:**
- Creating a new page
- Need a quick copy-paste template
- Looking for specific widget examples
- Want reference tables for typography, spacing, colors

**Contains:**
- Ready-to-use page template
- Widget variations (basic, colored, currency, conditional)
- Common patterns (role-based, loading states, etc.)
- Reference tables (typography, spacing, colors, icons)
- Complete working example
- Quick tips

**Time to read:** ~5 minutes to scan, ~15 minutes to understand fully

---

### 2. Complete Design System
**File:** `lib/design-system.md`

**Use this when:**
- Understanding the overall design system
- Learning about all patterns in depth
- Need detailed explanations
- Reference for best practices
- Creating custom components

**Contains:**
- Layout structure patterns
- Page header guidelines
- Widget system (stat and action widgets)
- Typography scale with usage
- Spacing system values
- Color palette
- Component patterns (badges, buttons, tables, cards)
- Interactive states (hover, focus, transitions)
- Icon guidelines
- Responsive behavior
- Best practices (Do's and Don'ts)
- Complete page template example

**Time to read:** ~30 minutes for comprehensive understanding

---

### 3. Reports Page Update Guide
**File:** `REPORTS_DESIGN_UPDATE.md`

**Use this when:**
- Understanding what changed in Reports page
- Learning how to refactor existing pages
- Seeing before/after code comparison
- Understanding the widget system implementation
- Planning to update other pages

**Contains:**
- Overview of the problem and solution
- Key changes made
- Before/after code comparison
- Visual layout diagrams
- Reusable components documentation
- Future development guidelines
- Refactoring approach for existing pages

**Time to read:** ~20 minutes

---

### 4. Implementation Summary
**File:** `DESIGN_SYSTEM_SUMMARY.md`

**Use this when:**
- Want a high-level overview
- Need to understand what was accomplished
- Looking for quick reference to resources
- Planning next steps

**Contains:**
- What was done (analysis, documentation, components, refactor)
- Design patterns identified
- Files created/modified
- Before/after comparison
- Usage guide
- Benefits achieved
- Next steps (optional)
- Resource links

**Time to read:** ~10 minutes

---

## 🧩 Reusable Components

### Layout Components (`components/layout/`)

#### PageHeader.tsx
```tsx
import { PageHeader } from "@/components/layout/PageHeader";
import { FileText } from "lucide-react";

<PageHeader
  icon={FileText}
  title="Your Page"
  actions={<Button>Action</Button>}
/>
```

#### WidgetContainer.tsx
```tsx
import { WidgetContainer } from "@/components/layout/WidgetContainer";

<WidgetContainer>
  {/* Your widgets */}
</WidgetContainer>
```

#### PageContent.tsx
```tsx
import { PageContent } from "@/components/layout/PageContent";

<PageContent>
  {/* Your content */}
</PageContent>
```

### UI Components (`components/ui/`)

#### stat-widget.tsx
```tsx
import { StatWidget } from "@/components/ui/stat-widget";

<StatWidget
  label="Total Items"
  value={123}
  description={<>Your <span className="text-primary">description</span></>}
/>
```

#### action-widget.tsx
```tsx
import { ActionWidget } from "@/components/ui/action-widget";
import { Notebook } from "lucide-react";

<ActionWidget
  icon={Notebook}
  label="View Reports"
  onClick={() => router.push('/reports')}
/>
```

---

## 🎨 Design Patterns Quick Reference

### Layout Structure
```tsx
<>
  <header className="bg-white mb-4 border-b-1 h-16...">
  <div className="bg-muted flex flex-wrap gap-2..."> {/* Widgets */}
  <div className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-muted..."> {/* Content */}
</>
```

### Typography Scale
- **text-lg font-semibold** - Page titles
- **text-4xl font-semibold** - Stat values
- **text-md** - Widget labels
- **text-sm** - Action labels
- **text-xs** - Descriptions

### Spacing
- **gap-2** - Widget container
- **gap-4** - Content sections
- **p-4** - Padding
- **min-w-[200px]** - Stat widgets
- **min-w-[120px]** - Action widgets

### Colors
- **bg-white** - Headers, cards
- **bg-muted** - Content areas
- **text-primary** - Highlights
- **text-blue-600** - Action icons

---

## 🗂️ Example Pages

### Management Pages
- **Bookings:** `app/manage/bookings/page.tsx`
- **Clients:** `app/manage/clients/page.tsx`
- **Pavilion:** `app/manage/pavilion/page.tsx`
- **Inventory:** `app/manage/inventory/page.tsx`
- **Additional Charges:** `app/manage/additional-charges/page.tsx`

### Updated Pages
- **Reports:** `app/(reports)/reports/page.tsx` (Updated to match design system)

### Reference Pages
- **Dashboard:** `app/dashboard/page.tsx` (Basic layout)

---

## ✅ Checklist for New Pages

Before committing a new page, verify:

- [ ] Root element is fragment (`<>`) not container div
- [ ] Header includes SidebarTrigger for mobile
- [ ] Header icon is `size={18}`
- [ ] Header title is `font-semibold text-lg`
- [ ] Widget container has `bg-muted` background
- [ ] Widgets have `min-w-[...]` and `flex-shrink-0`
- [ ] Stat values use `text-4xl font-semibold`
- [ ] Widget labels use `text-md`
- [ ] Widget descriptions use `text-xs`
- [ ] Action widgets have hover states
- [ ] Content area has `bg-muted` background
- [ ] Content uses `gap-4` spacing
- [ ] All interactive elements have transitions

---

## 🚀 Getting Started

### If you're creating a NEW page:
1. Open `templates/page-template.md`
2. Copy the template code
3. Replace placeholders with your content
4. Verify against the checklist
5. Test mobile responsiveness

### If you're LEARNING the design system:
1. Start with `DESIGN_SYSTEM_SUMMARY.md` for overview
2. Read `lib/design-system.md` for comprehensive patterns
3. Look at example pages to see patterns in action
4. Keep `templates/page-template.md` open for reference

### If you're REFACTORING an existing page:
1. Read `REPORTS_DESIGN_UPDATE.md` for before/after comparison
2. Identify current patterns in your page
3. Replace with design system patterns
4. Consider using reusable components
5. Verify against the checklist

---

## 📊 Design System at a Glance

### Structure
```
Fragment Root
├─ Header Section (bg-white, h-16)
│   ├─ SidebarTrigger (mobile)
│   ├─ Icon + Title (text-lg font-semibold)
│   └─ Optional Actions
│
├─ Widget Section (bg-muted)
│   ├─ Stat Widgets (min-w-[200px])
│   │   ├─ Label (text-md)
│   │   ├─ Value (text-4xl font-semibold)
│   │   └─ Description (text-xs)
│   └─ Action Widgets (min-w-[120px])
│       ├─ Icon (size-9)
│       └─ Label (text-sm)
│
└─ Content Section (bg-muted, gap-4)
    ├─ Cards (bg-white)
    ├─ Tables
    └─ Other Content
```

### Key Principles
1. **Consistency** - Same patterns across all pages
2. **Hierarchy** - Clear visual hierarchy with typography
3. **Spacing** - Consistent gap and padding values
4. **Colors** - Limited palette with clear purpose
5. **Responsive** - Mobile-first with SidebarTrigger
6. **Interactive** - Hover states on clickable elements
7. **Flexible** - Widget system adapts to content
8. **Accessible** - Semantic HTML and clear focus states

---

## 🎯 Common Use Cases

### Creating a basic stats page
1. Use PageHeader for title
2. Add 2-3 StatWidgets showing key metrics
3. Add ActionWidget linking to related pages
4. Add DataTable or Cards in content section

### Creating a management page
1. Use PageHeader with optional action button
2. Add multiple StatWidgets for metrics
3. Add role-based widget rendering if needed
4. Add DataTable with columns and sorting

### Creating a dashboard
1. Use PageHeader
2. Add high-level StatWidgets
3. Add ActionWidgets for common tasks
4. Add Cards with charts or summaries

### Adding widgets to existing page
1. Identify key metrics to display
2. Calculate values from data
3. Use StatWidget for each metric
4. Add conditional rendering if needed

---

## 💡 Tips & Best Practices

### Do's ✅
- Use the template as starting point
- Follow typography scale
- Add hover states to clickable elements
- Test mobile responsiveness
- Use semantic icons
- Keep widget labels concise
- Add loading and error states
- Use conditional rendering for dynamic widgets

### Don'ts ❌
- Don't use arbitrary text sizes
- Don't skip the muted background
- Don't use container mx-auto for pages
- Don't mix spacing values
- Don't forget flex-shrink-0 on widgets
- Don't skip SidebarTrigger in header
- Don't use different border classes

---

## 🔧 Troubleshooting

### Widget section not scrolling horizontally?
- Check for `overflow-x-auto` on container
- Verify widgets have `flex-shrink-0`
- Ensure minimum widths are set

### Header not aligned properly?
- Verify `h-16` height
- Check `mb-4` margin bottom
- Ensure proper flex alignment

### Content area background not showing?
- Add `bg-muted` to content div
- Check for conflicting background colors

### Widgets shrinking on mobile?
- Add `min-w-[...]` to widgets
- Add `flex-shrink-0` class
- Verify `overflow-x-auto` on container

---

## 📞 Support

For questions or clarifications:
1. Check this index for the right documentation
2. Review the appropriate guide
3. Look at example pages for implementation
4. Use reusable components when possible

---

## 📝 Document Versions

- **Design System:** v1.0 (Current)
- **Reports Update:** v1.0 (Current)
- **Page Template:** v1.0 (Current)
- **This Index:** v1.0 (Current)

---

**Last Updated:** 2024
**Maintained By:** Development Team
