# Multi-Day Booking System

## Overview
The multi-day booking system allows users to create bookings that span multiple days. **Each day in the range gets its own individual start time and end time**, which are configured in the CheckSchedule dialog before proceeding to the full booking form.

## How It Works

### 1. User Flow for Multi-Day Booking

**Step 1:** Go to the Calendar page (http://localhost:3002/calendar)

**Step 2:** Select a date range by clicking and dragging across multiple dates

**Step 3:** Click "Add Booking" button to open the CheckSchedule dialog

**Step 4:** In the CheckSchedule dialog:
- View the selected date range
- **Select a pavilion** (required)
- **Set start time and end time for EACH DAY individually** ⭐
  - Each day shows its date (e.g., "Mon, Oct 27, 2025")
  - Each day has its own start time input (default 09:00)
  - Each day has its own end time input (default 17:00)
  - Scrollable list if multiple days are selected
- Review any booking conflicts if present

**Step 5:** Click "Continue" to navigate to the multi-day booking form

**Step 6:** The multi-day booking form shows:
- Pre-selected pavilion from the dialog
- Daily schedules with the **exact times configured in the dialog**
- Users can still customize each day's start/end time if needed
- Add custom fees, event details, etc.

### 2. CheckSchedule Dialog Updates

The dialog now includes:
- **Date range display** showing start and end dates with count
- **Pavilion selection dropdown** (required)
- **Individual time inputs for each day** in a scrollable area ⭐
  - Each day card shows:
    - Date with day of week
    - Start time input
    - End time input
  - All times default to 09:00 - 17:00
  - Each day can have different times
- **Conflict detection** for nearby bookings
- **Smart routing**:
  - Single date → regular booking page (`/bookings/create-booking`)
  - Date range → multi-day booking page (`/multi-day-booking`)

### 3. Multi-Day Booking Form Features

The form (`/app/multi-day-booking/page.tsx`) includes:

#### Header Information
- Event date range display
- Selected pavilion name display
- Cancel button to return to calendar

#### Daily Schedules Section
- **Pre-populated with times from CheckSchedule dialog** ⭐
- Each day shows:
  - Date (read-only, formatted as "Day, Month DD, YYYY")
  - Start Time (editable, inherited from dialog)
  - End Time (editable, inherited from dialog)
- Users can still customize the time in/out for each day if they need to adjust

#### Custom Fees Section
- Add multiple fees with:
  - Fee Name (e.g., "Venue Rental - Day 1")
  - Amount (numeric)
  - Note (optional)
- Automatic total calculation
- Add/Remove fees dynamically

#### Basic Information (To Be Expanded)
- Event Name
- Notes
- *More fields coming: Client, Catering, Dishes, Inventory, Rooms, Documents*

## URL Parameters

### From CheckSchedule Dialog to Multi-Day Booking:
```
/multi-day-booking?startDate=2025-10-27&endDate=2025-10-30&pavilionId=1&schedules=%5B%7B%22date%22%3A%222025-10-27%22%2C%22startTime%22%3A%2209%3A00%22%2C%22endTime%22%3A%2218%3A00%22%7D...
```

Parameters:
- `startDate`: Start date of the range (YYYY-MM-DD)
- `endDate`: End date of the range (YYYY-MM-DD)
- `pavilionId`: Selected pavilion ID
- `schedules`: JSON-encoded array of daily schedules ⭐

**schedules format**:
```json
[
  {
    "date": "2025-10-27",
    "startTime": "09:00",
    "endTime": "18:00"
  },
  {
    "date": "2025-10-28",
    "startTime": "10:00",
    "endTime": "17:00"
  }
]
```

## Technical Implementation

### CheckSchedule Dialog Changes

**File**: `components/modules/checkScheduleDialog.tsx`

**Added**:
1. `dailySchedules` state to track individual times for each day
2. `useEffect` to initialize schedules when date range is selected
3. Scrollable area with individual time inputs for each day
4. JSON encoding of schedules in URL parameters

**Key Code**:
```typescript
// State for multi-day schedules
const [dailySchedules, setDailySchedules] = useState<Array<{
  date: selected;
  startTime: { hour: number; minute: number; second?: number } | null;
  endTime: { hour: number; minute: number; second?: number } | null;
}>>([]);

// Initialize schedules for each day
useEffect(() => {
  if (dateRange && selectedDates.length > 0) {
    const schedules = selectedDates.map(date => ({
      date,
      startTime: { hour: 9, minute: 0, second: 0 },
      endTime: { hour: 17, minute: 0, second: 0 }
    }));
    setDailySchedules(schedules);
  }
}, [dateRange, selectedDates]);

// Encode and pass to multi-day booking
const schedulesData = dailySchedules.map(schedule => ({
  date: `${schedule.date.year}-${String(schedule.date.month + 1).padStart(2, "0")}-${String(schedule.date.day).padStart(2, "0")}`,
  startTime: `${String(schedule.startTime?.hour || 9).padStart(2, "0")}:${String(schedule.startTime?.minute || 0).padStart(2, "0")}`,
  endTime: `${String(schedule.endTime?.hour || 17).padStart(2, "0")}:${String(schedule.endTime?.minute || 0).padStart(2, "0")}`
}));
params.set("schedules", JSON.stringify(schedulesData));
```

**UI Code**:
```tsx
<ScrollArea className="max-h-[300px]">
  {dailySchedules.map((schedule, index) => (
    <div key={index} className="border rounded-lg p-3">
      <div className="flex items-center gap-2">
        <CalendarIcon />
        <span>{dateObj.toLocaleDateString()}</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input type="time" value={startTime} onChange={...} />
        <Input type="time" value={endTime} onChange={...} />
      </div>
    </div>
  ))}
</ScrollArea>
```

### Multi-Day Booking Form Changes

**File**: `app/multi-day-booking/page.tsx`

**Added**:
1. Parse `schedules` parameter from URL
2. Populate daily schedules with exact times from dialog
3. Fallback to default times if parsing fails

**Code**:
```typescript
const schedulesParam = searchParams.get("schedules");

useEffect(() => {
  if (startDateParam && endDateParam) {
    const start = new Date(startDateParam);
    const end = new Date(endDateParam);
    setDateRange({ start, end });

    if (schedulesParam) {
      try {
        const parsedSchedules = JSON.parse(schedulesParam);
        const schedules = parsedSchedules.map((s: any) => ({
          date: new Date(s.date),
          startTime: s.startTime,
          endTime: s.endTime,
        }));
        setDailySchedules(schedules);
      } catch (error) {
        generateDefaultSchedules(start, end);
      }
    }
  }
}, [startDateParam, endDateParam, schedulesParam]);
```

## Current Implementation Status

### ✅ Completed
- Calendar date range selection
- CheckSchedule dialog integration
- Pavilion selection in dialog
- **Individual time input for EACH DAY in dialog** ⭐
- Scrollable list for multiple days
- JSON encoding of all schedule data
- Automatic navigation with all parameters
- Daily schedules pre-populated with dialog times
- Individual time editing in booking form
- Pavilion display in form header
- Custom fees management
- Basic form structure

### 🚧 To Do
- Add full booking form fields (Client, Catering, Dishes, etc.)
- Database schema for multi-day bookings
- Server actions for CRUD operations
- Form submission and data persistence
- Display multi-day bookings on calendar
- Edit/Delete multi-day bookings
- Validation and conflict checking

## Example Workflow

### Scenario: 3-Day Event with Different Times

1. **Select dates**: Oct 27, 28, 29 (3 days)
2. **Click "Add Booking"**
3. **In CheckSchedule dialog**:
   - Select pavilion: "Main Hall"
   - Day 1 (Mon, Oct 27): 09:00 - 18:00
   - Day 2 (Tue, Oct 28): 10:00 - 20:00
   - Day 3 (Wed, Oct 29): 08:00 - 17:00
4. **Click "Continue"**
5. **Form loads** with:
   - Pavilion: Main Hall
   - Monday schedule: 09:00 - 18:00
   - Tuesday schedule: 10:00 - 20:00
   - Wednesday schedule: 08:00 - 17:00
6. **User can still adjust** any time if needed
7. **Add fees, details, and submit**

## Testing the Flow

1. **Start the server**: `npm run dev`
2. **Open calendar**: http://localhost:3002/calendar
3. **Select date range**: Click and drag to select 3-4 dates
4. **Click "Add Booking"**: Opens CheckSchedule dialog
5. **Configure pavilion and times**:
   - Select a pavilion
   - Scroll through the list of days
   - Set different start/end times for each day
   - Example: Day 1 (09:00-17:00), Day 2 (10:00-18:00), Day 3 (08:00-16:00)
6. **Click "Continue"**: Navigates to multi-day booking form
7. **Verify**:
   - Pavilion name appears in header
   - Each day shows the exact time you set in the dialog
   - Times are different for each day as configured
8. **Customize**: Further adjust times if needed
9. **Add fees**: Add custom fees for the booking
10. **Fill details**: Add event name and notes

## Benefits of This Approach

1. ✅ **Complete control**: Each day gets its own time schedule
2. ✅ **User-friendly**: Set times in one place before proceeding
3. ✅ **Flexible**: Different times for setup, event, and cleanup days
4. ✅ **Scrollable**: Handles long date ranges gracefully
5. ✅ **Pre-configured**: Form loads with exact times from dialog
6. ✅ **Still editable**: Can adjust in form if needed
7. ✅ **Visual feedback**: See all days and times at a glance

---

**Created:** October 27, 2025
**Updated:** October 27, 2025 - Added individual time inputs for each day
**Status:** Individual daily time inputs complete, ready for full form expansion
