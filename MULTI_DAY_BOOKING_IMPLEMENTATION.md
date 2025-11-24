# Multi-Day Booking System Implementation

## Overview
Implemented a complete multi-day booking system separate from regular single-day bookings with its own database tables and workflow.

## Database Schema Changes

### New Tables Created

#### 1. MultiDayBooking
Main table for multi-day bookings (custom bookings).

```prisma
model MultiDayBooking {
    id                     Int                       @id @default(autoincrement())
    eventName              String
    clientId               Int?
    pavilionId             Int?
    eventType              Int?
    totalPax               Int
    status                 Int
    notes                  String?
    createdById            String?
    createdAt              DateTime                  @default(now())
    client                 Client?                   @relation(fields: [clientId], references: [id])
    pavilion               Pavilion?                 @relation(fields: [pavilionId], references: [id])
    category               EventTypes?               @relation(fields: [eventType], references: [id])
    createdBy              Employee?                 @relation("CreatedMultiDayBookings", fields: [createdById], references: [id], onDelete: SetNull)
    dailySchedules         MultiDaySchedule[]
    additionalCharges      MultiDayAdditionalCharge[]
    scannedDocuments       MultiDayScannedDocument[]
    otherServices          OtherService[]            @relation("MultiDayBookingToOtherService")
    rooms                  Rooms[]                   @relation("MultiDayBookingToRooms")
}
```

**Key Features:**
- Separate from regular `Booking` table
- No package or catering fields (as per custom booking requirement)
- Tracks creator via `createdById`
- Uses same status system as regular bookings

#### 2. MultiDaySchedule
Stores individual day schedules for multi-day bookings.

```prisma
model MultiDaySchedule {
    id                Int             @id @default(autoincrement())
    multiDayBookingId Int
    date              DateTime
    startTime         DateTime
    endTime           DateTime
    multiDayBooking   MultiDayBooking @relation(fields: [multiDayBookingId], references: [id], onDelete: Cascade)
}
```

**Key Features:**
- Each row represents one day's schedule
- `date`: The calendar date for this schedule
- `startTime`: Full DateTime with time in/out
- `endTime`: Full DateTime with time in/out
- Cascade delete when parent booking is deleted

#### 3. MultiDayAdditionalCharge
Custom fees/charges for multi-day bookings.

```prisma
model MultiDayAdditionalCharge {
    id                Int             @id @default(autoincrement())
    multiDayBookingId Int
    name              String
    amount            Float
    note              String?
    multiDayBooking   MultiDayBooking @relation(fields: [multiDayBookingId], references: [id], onDelete: Cascade)
}
```

#### 4. MultiDayScannedDocument
File attachments for multi-day bookings.

```prisma
model MultiDayScannedDocument {
    id                Int             @id @default(autoincrement())
    multiDayBookingId Int
    fileName          String
    fileUrl           String
    uploadedAt        DateTime        @default(now())
    multiDayBooking   MultiDayBooking @relation(fields: [multiDayBookingId], references: [id], onDelete: Cascade)
}
```

### Related Model Updates

Updated the following models to support multi-day bookings:

1. **Client** - Added `multiDayBookings` relation
2. **Pavilion** - Added `multiDayBookings` relation
3. **Employee** - Added `createdMultiDayBookings` relation
4. **EventTypes** - Added `multiDayBookings` relation
5. **OtherService** - Added `multiDayBookings` relation
6. **Rooms** - Added `multiDayBookings` relation

## Server Actions

### Create Actions (`server/MultiDayBooking/pushActions.ts`)

#### createMultiDayBooking()
Creates a new multi-day booking with all related data.

**Parameters:**
```typescript
interface CreateMultiDayBookingInput {
  eventName: string;
  clientId: number;
  pavilionId: string;
  pax: string;
  eventType: number;
  notes?: string;
  dailySchedules: DailyScheduleInput[];
  serviceIds?: number[];
  roomIds?: number[];
  additionalCharges?: AdditionalChargeInput[];
}
```

**Features:**
- Validates all required fields
- Creates booking and all related data in single transaction
- Tracks creator from session
- Returns complete booking with all relations

#### updateMultiDayBooking()
Updates an existing multi-day booking.

#### deleteMultiDayBooking()
Archives a multi-day booking (sets status to 5).

### Read Actions (`server/MultiDayBooking/pullActions.ts`)

#### getAllMultiDayBookings()
Fetches all non-archived multi-day bookings with all relations.

#### getMultiDayBookingById()
Fetches a single multi-day booking by ID with all relations.

## UI Changes

### 1. Check Schedule Dialog (`components/modules/checkScheduleDialog.tsx`)

#### Time Picker Visibility
Time pickers are now hidden when custom booking checkbox is checked:

```tsx
{/* Time pickers - hide when custom booking is enabled */}
{!isCustomBooking && (
  <div className="grid grid-cols-2 gap-4">
    {/* Start Time and End Time pickers */}
  </div>
)}
```

**Reasoning:** Custom multi-day bookings set individual times for each day, so the general time picker is not needed.

#### URL Parameter Passing
When custom booking is enabled, the dialog passes these parameters to multi-day booking page:

- `startDate` - Start date of date range
- `endDate` - End date of date range
- `pavilionId` - Selected pavilion (pre-filled)
- `eventName` - Event name (pre-filled)
- `eventTypeId` - Event type (pre-filled)
- `pax` - Number of guests (pre-filled)

**Example URL:**
```
/multi-day-booking?startDate=2025-11-20&endDate=2025-11-22&pavilionId=1&eventName=Wedding&eventTypeId=2&pax=100
```

### 2. Multi-Day Booking Page (`app/multi-day-booking/page.tsx`)

#### Pre-filled Values from URL
The page now reads and applies URL parameters:

```typescript
const eventNameParam = searchParams.get("eventName");
const eventTypeIdParam = searchParams.get("eventTypeId");
const paxParam = searchParams.get("pax");

const [eventName, setEventName] = useState(eventNameParam || "");
const [numPax, setNumPax] = useState(paxParam || "");
const [selectedEventType, setSelectedEventType] = useState(eventTypeIdParam || "");
```

#### Form Validation
Comprehensive validation before submission:

1. Client selection (existing client or new client validation)
2. Pavilion selection
3. Event name required
4. Valid number of guests
5. At least one daily schedule
6. All daily schedules must have times set

#### Booking Creation Logic
The `handleSubmit` function now:

1. Validates all fields
2. Combines date with time for each schedule
3. Handles midnight-crossing events (end time before start time)
4. Prepares additional charges
5. Calls `createMultiDayBooking` server action
6. Shows success/error toasts
7. Redirects to calendar on success

#### New Client Form IDs
Added IDs to new client form fields for validation:

- `newClientFirstName`
- `newClientLastName`
- `newClientEmail`
- `newClientPhone`

## Workflow

### Creating a Custom Multi-Day Booking

1. **Calendar Selection:**
   - User selects a date range in calendar
   - Opens check schedule dialog

2. **Check Schedule Dialog:**
   - User fills in pavilion, event name, event type, pax
   - User checks "Custom Multi-Day Booking" checkbox
   - Time pickers are hidden
   - Clicks "Proceed"

3. **Multi-Day Booking Page:**
   - All values from dialog are pre-filled
   - Pavilion, event name, event type, pax are set
   - User selects/creates client
   - User sets individual start/end times for each day
   - User can add:
     - 3rd party services
     - Rooms
     - Additional fees
     - Documents
     - Notes
   - User clicks "Create Multi-Day Booking"

4. **Server Processing:**
   - Creates `MultiDayBooking` record
   - Creates `MultiDaySchedule` records for each day
   - Connects services and rooms
   - Creates additional charges if any
   - Returns success

5. **Redirect:**
   - User is redirected to calendar
   - Multi-day booking appears as separate events (one per day)

## Differences from Regular Bookings

| Feature | Regular Booking | Multi-Day Booking |
|---------|----------------|-------------------|
| Database Table | `Booking` | `MultiDayBooking` |
| Package Support | ✅ Yes | ❌ No |
| Catering Support | ✅ Yes | ❌ No |
| Time Configuration | Single start/end | Individual per day |
| Daily Schedules Table | N/A | `MultiDaySchedule` |
| Additional Charges | `AdditionalCharge` | `MultiDayAdditionalCharge` |
| Documents | `ScannedDocument` | `MultiDayScannedDocument` |

## Migration Steps

To apply these changes to your database:

```bash
# Push schema changes
npx prisma db push

# Generate Prisma client
npx prisma generate
```

## Testing Checklist

### Database
- [ ] All new tables created successfully
- [ ] Relations work correctly
- [ ] Can insert multi-day booking
- [ ] Cascade delete works

### Check Schedule Dialog
- [ ] Custom booking checkbox appears for date ranges
- [ ] Time pickers hide when checkbox is checked
- [ ] All parameters pass correctly to multi-day page
- [ ] Regular bookings still work normally

### Multi-Day Booking Page
- [ ] URL parameters are read and applied correctly
- [ ] Pavilion is pre-selected
- [ ] Event name is pre-filled
- [ ] Event type is pre-selected
- [ ] Pax count is pre-filled
- [ ] Can select existing client
- [ ] New client form has validation
- [ ] Can set individual times for each day
- [ ] Can add services
- [ ] Can add rooms
- [ ] Can add fees
- [ ] Can add notes
- [ ] Validation works correctly
- [ ] Booking creates successfully
- [ ] Redirects to calendar after creation

### Calendar Display
- [ ] Multi-day bookings appear on calendar
- [ ] Each day shows as separate event
- [ ] Events are properly colored/labeled
- [ ] Can distinguish from regular bookings

## Status Codes

Multi-day bookings use the same status system as regular bookings:

1. **Pending** - Newly created booking
2. **Confirmed** - Booking confirmed
3. **In Progress** - Event is happening
4. **Completed** - Event finished
5. **Archived** - Booking archived/deleted
6. **Cancelled** - Booking cancelled
7. **Rescheduled** - Booking rescheduled
8. **No Show** - Client didn't show up

## Future Enhancements

1. **Calendar Integration:**
   - Display multi-day bookings differently in calendar
   - Add visual indicators for multi-day bookings
   - Show day number (Day 1, Day 2, etc.)

2. **Billing System:**
   - Create billing/payment system for multi-day bookings
   - Calculate costs based on daily schedules
   - Support partial payments

3. **Notifications:**
   - Send notifications for multi-day bookings
   - Daily reminders during multi-day event

4. **Reports:**
   - Include multi-day bookings in reports
   - Separate analytics for multi-day vs single-day

5. **Client Creation:**
   - Implement inline client creation in multi-day booking form
   - Create client and booking in single flow

## Files Changed

### New Files:
- `server/MultiDayBooking/pushActions.ts` - Create/update/delete actions
- `server/MultiDayBooking/pullActions.ts` - Read actions
- `MULTI_DAY_BOOKING_IMPLEMENTATION.md` - This documentation

### Modified Files:
- `prisma/schema.prisma` - Added new models and relations
- `components/modules/checkScheduleDialog.tsx` - Hide time pickers, pass parameters
- `app/multi-day-booking/page.tsx` - Read URL params, implement creation logic

## Notes

- Multi-day bookings are completely separate from regular bookings
- No conflicts with existing booking system
- Can coexist with regular bookings
- Uses same clients, pavilions, services, rooms
- Different table structure for better data organization
- Easier to query and manage multi-day specific features
