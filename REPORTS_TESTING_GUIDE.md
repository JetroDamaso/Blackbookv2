# Reports System Testing Guide

## Prerequisites
1. Ensure database has sample data:
   - At least 5-10 bookings
   - Multiple venues (pavilions)
   - Multiple event types
   - Multiple clients
   - Some bookings with payments
   - Mix of booking statuses

## Testing Each Report Type

### 1. Monthly Report
**Steps:**
1. Navigate to `/reports`
2. Select "Monthly Report" from dropdown
3. Select a month (e.g., "January")
4. Enter a year (e.g., "2025")
5. Click "Generate Report"

**Expected Result:**
- Report shows all bookings from January 2025
- Summary cards display correct totals
- Breakdown tables show status/venue/event type distributions
- Financial section shows revenue for that month
- Client stats show clients active in January
- Detailed bookings list shows only January bookings

### 2. Yearly Report
**Steps:**
1. Select "Yearly Report"
2. Enter year "2025"
3. Click "Generate Report"

**Expected Result:**
- Report shows all bookings from 2025
- Monthly breakdown table appears (Jan-Dec with revenue per month)
- Annual totals in summary cards
- Full year statistics

### 3. Date Range Report
**Steps:**
1. Select "Date Range Report"
2. Click "Start Date" and pick January 1, 2025
3. Click "End Date" and pick February 28, 2025
4. Click "Generate Report"

**Expected Result:**
- Report shows bookings between Jan 1 - Feb 28, 2025
- Date range displayed in header
- All data filtered to that range

**Edge Cases to Test:**
- Same start and end date (should work)
- Very large date range (should work)
- End date before start date (should show validation error)

### 4. Booking Status Report
**Steps:**
1. Select "Booking Status Report"
2. Check one or more statuses (e.g., "Confirmed" + "Completed")
3. Optionally select a date range
4. Click "Generate Report"

**Expected Result:**
- Only bookings with selected statuses appear
- If date range selected, also filtered by dates
- Status breakdown shows only checked statuses

**Variations to Test:**
- Single status only
- Multiple statuses
- All statuses checked
- With date range
- Without date range

### 5. Selected Bookings Report
**Steps:**
1. Select "Selected Bookings Report"
2. Wait for bookings table to load
3. Use search box to find specific bookings
4. Check boxes next to 2-3 bookings
5. Click "Generate Report"

**Expected Result:**
- Report shows ONLY the selected bookings
- Count matches number selected
- Search functionality filters table correctly
- "X booking(s) selected" counter updates

**Tests:**
- Select 1 booking
- Select multiple bookings
- Use search and select
- Try "Select All" checkbox
- Deselect some bookings

### 6. Venue Performance Report
**Steps:**
1. Select "Venue Performance Report"
2. Check one or more venues (e.g., "Grand Pavilion")
3. Select start date
4. Select end date
5. Click "Generate Report"

**Expected Result:**
- Only bookings at selected venues
- Revenue by venue table shows selected venues
- Booking breakdown by venue accurate
- Must have date range selected (validation)

**Edge Cases:**
- No venues selected (should show validation error)
- All venues selected
- Single venue
- Date range missing (should show error)

### 7. Event Type Analysis
**Steps:**
1. Select "Event Type Analysis"
2. Check one or more event types (e.g., "Wedding" + "Birthday")
3. Select start and end dates
4. Click "Generate Report"

**Expected Result:**
- Only bookings with selected event types
- Event type breakdown shows selected types
- Revenue grouped by event type
- Date range required

**Tests:**
- Single event type
- Multiple event types
- All event types
- Missing date range (validation error)

### 8. Client Report
**Steps:**
1. Select "Client Report"
2. Scroll through client list and check 1-3 clients
3. Optionally select date range
4. Click "Generate Report"

**Expected Result:**
- Only bookings for selected clients
- Client stats show selected clients as "total"
- Optional date range works
- Top clients table shows selected clients

**Variations:**
- Single client
- Multiple clients
- With date range
- Without date range (all-time)

## Export Functionality Testing

### Print Test
1. Generate any report
2. Click "Print" button
3. Check print preview

**Expected:**
- Clean layout without sidebar/navigation
- All data visible
- Proper page breaks
- Headers/footers minimal
- Colors preserved

### CSV Export Test
1. Generate any report
2. Click "Export CSV"
3. Open downloaded file in Excel/Google Sheets

**Expected:**
- File downloads automatically
- Filename includes report type and date
- Opens correctly in Excel
- Contains booking details
- Proper column headers

### Excel Export Test
1. Generate any report
2. Click "Export Excel"
3. Open downloaded file

**Expected:**
- Multiple sections in file
- Summary section
- Breakdown sections
- Detailed bookings section
- Proper formatting

## Validation Testing

### Required Fields
Test that validation catches:
1. No report type selected → Error
2. Monthly: Missing month → Error
3. Monthly: Missing year → Error
4. Yearly: Missing year → Error
5. Date Range: Missing start date → Error
6. Date Range: Missing end date → Error
7. Date Range: End before start → Error
8. Status: No statuses selected → Error
9. Selected: No bookings selected → Error
10. Venue: No venues selected → Error
11. Venue: Missing date range → Error
12. Event Type: No types selected → Error
13. Event Type: Missing date range → Error
14. Client: No clients selected → Error

## Performance Testing

### Large Dataset
1. Generate report with many results (50+ bookings)
2. Check loading time
3. Verify pagination/scrolling works
4. Export should handle large data

### Empty Results
1. Generate report for time period with no bookings
2. Should show "No bookings found" message
3. Summary cards should show zeros
4. No errors should occur

## UI/UX Testing

### Responsive Design
Test on different screen sizes:
- Desktop (1920x1080)
- Tablet (768px)
- Mobile (375px)

**Check:**
- Filters stack properly
- Summary cards responsive grid
- Tables scrollable on small screens
- Date pickers accessible on mobile

### Loading States
1. Observe loading spinner when generating
2. Skeleton loaders should appear
3. Generate button disabled during load
4. No duplicate requests

### Error Handling
1. Disconnect internet
2. Try to generate report
3. Should show user-friendly error message
4. Can retry after reconnection

## Data Accuracy Testing

### Revenue Calculations
1. Pick a specific booking in report
2. Manually calculate: original price, payments, balance
3. Verify matches report numbers
4. Check discount calculations

### Counts
1. Count bookings manually for a date range
2. Generate report for same range
3. Verify total bookings matches
4. Verify status breakdown adds up to total

### Client Stats
1. Count unique clients in date range
2. Count new clients (created in range)
3. Verify "returning clients" = total - new
4. Check top clients order (highest spent first)

## Edge Cases

### Special Scenarios to Test:
1. **Booking with no client** - Should show "No Client"
2. **Booking with no venue** - Should show "No Venue"
3. **Booking with no payments** - Balance = Total Amount
4. **Fully paid booking** - Balance = 0
5. **Overpaid booking** - Balance should be negative
6. **Cancelled booking** - Included in cancellation rate
7. **Multiple payments on one booking** - Sum correctly
8. **Bookings spanning month boundaries** - Count in correct month

## Common Issues & Solutions

### Issue: Report shows no data
**Check:**
- Date range includes existing bookings
- Filters not too restrictive
- Database has bookings for the criteria

### Issue: Export not downloading
**Check:**
- Browser popup blocker
- Browser download settings
- Console for errors

### Issue: Slow performance
**Check:**
- Database indexes on Booking.startAt, Booking.status
- Large dataset (optimize query if needed)
- Network speed

### Issue: Print looks broken
**Check:**
- Browser print preview
- Print styles in globals.css loaded
- Page breaks working

## Automated Testing Checklist

Create automated tests for:
- [ ] Report parameter validation
- [ ] Date range calculation
- [ ] Currency formatting
- [ ] Report title generation
- [ ] Export filename generation
- [ ] Percentage calculations
- [ ] Revenue aggregation
- [ ] Client stats calculation

## Sign-Off Checklist

Before deploying:
- [ ] All 8 report types work
- [ ] Validation catches errors
- [ ] Export functions work
- [ ] Print layout clean
- [ ] Mobile responsive
- [ ] Loading states appear
- [ ] Error messages clear
- [ ] No console errors
- [ ] Data accuracy verified
- [ ] Performance acceptable
- [ ] Documentation complete

## Sample Test Data SQL

```sql
-- Create test bookings across different scenarios
-- (Adjust based on your schema)

-- Booking with payments
INSERT INTO Booking (eventName, clientId, pavilionId, eventType, startAt, status, totalPax)
VALUES ('Test Wedding', 1, 1, 1, '2025-01-15', 1, 100);

-- Cancelled booking
INSERT INTO Booking (eventName, clientId, pavilionId, eventType, startAt, status, totalPax)
VALUES ('Cancelled Event', 2, 2, 2, '2025-02-10', 3, 50);

-- Completed booking
INSERT INTO Booking (eventName, clientId, pavilionId, eventType, startAt, status, totalPax)
VALUES ('Birthday Party', 3, 1, 3, '2025-01-20', 2, 75);
```

## Report Generation Performance Benchmarks

**Expected Times:**
- Small dataset (< 100 bookings): < 1 second
- Medium dataset (100-500 bookings): 1-3 seconds
- Large dataset (500-1000 bookings): 3-5 seconds
- Very large dataset (> 1000 bookings): 5-10 seconds

If slower, consider:
- Database indexing
- Query optimization
- Caching layer
- Pagination for detailed bookings

## Browser Compatibility

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

All features should work identically.
