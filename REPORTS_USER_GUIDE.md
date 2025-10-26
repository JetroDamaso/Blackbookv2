# Reports System - Quick Reference Guide

## 📊 Available Reports

### 1. Monthly Report
**What it shows:** All bookings and revenue for a specific month
**Required fields:** Month, Year
**Use when:** You need monthly performance analysis

**Example:** "Show me all January 2025 bookings"

---

### 2. Yearly Report
**What it shows:** Annual summary with month-by-month breakdown
**Required fields:** Year
**Use when:** You need annual performance with monthly trends

**Example:** "Show me 2025 annual performance"

---

### 3. Date Range Report
**What it shows:** Custom period analysis
**Required fields:** Start Date, End Date
**Use when:** You need data for a specific period

**Example:** "Show me bookings from Jan 1 to Feb 28, 2025"

---

### 4. Booking Status Report
**What it shows:** Bookings filtered by status
**Required fields:** At least one status
**Optional fields:** Date Range
**Use when:** You need to see pending, confirmed, cancelled, or completed bookings

**Example:** "Show me all confirmed and completed bookings from last month"

---

### 5. Selected Bookings Report
**What it shows:** Detailed report for specific bookings you choose
**Required fields:** At least one booking selected
**Use when:** You need a report for specific events

**Example:** "Create a report for these 5 bookings only"

---

### 6. Venue Performance Report
**What it shows:** Performance metrics for specific venues
**Required fields:** At least one venue, Date Range
**Use when:** You need venue utilization and revenue analysis

**Example:** "Show me Grand Pavilion performance for Q1 2025"

---

### 7. Event Type Analysis
**What it shows:** Breakdown by event types (Wedding, Birthday, Corporate, etc.)
**Required fields:** At least one event type, Date Range
**Use when:** You need to analyze specific event categories

**Example:** "Show me all wedding and corporate events from January to March"

---

### 8. Client Report
**What it shows:** All bookings and spending for specific clients
**Required fields:** At least one client
**Optional fields:** Date Range
**Use when:** You need client history or lifetime value

**Example:** "Show me all bookings from John Doe in 2025"

---

## 📈 What Every Report Includes

### Summary Cards (Top of Report)
- **Total Bookings** - Count of all bookings in the report
- **Total Revenue** - Sum of all booking values
- **Average Booking Value** - Total revenue ÷ Total bookings
- **Cancellation Rate** - Percentage of cancelled bookings

### Breakdowns
- **By Status** - Pending, Confirmed, Completed, Cancelled counts
- **By Venue** - Grand Pavilion, Mini Pavilion, etc.
- **By Event Type** - Wedding, Birthday, Corporate, etc.

### Financial Summary
- **Total Revenue** - Original prices of all bookings
- **Payments Collected** - Actual money received
- **Outstanding Balance** - Money still owed
- **Overdue Payments** - Past events with unpaid balance
- **Discounts Given** - Total discounts and breakdown by type
- **Revenue by Venue** - How much each venue earned

### Client Statistics
- **Total Clients** - Unique clients in the report
- **New Clients** - Clients created during the date range
- **Returning Clients** - Existing clients
- **Top 5 Clients** - Highest spenders with booking counts

### Detailed Bookings Table
Complete list showing:
- Booking ID
- Event Date
- Client Name
- Venue
- Event Type
- Status
- Total Amount
- Paid Amount
- Balance

---

## 🎯 Common Use Cases

### Monthly Business Review
**Report Type:** Monthly Report
**Purpose:** Review last month's performance
**Steps:**
1. Select "Monthly Report"
2. Choose last month
3. Enter current year
4. Generate

### Year-End Summary
**Report Type:** Yearly Report
**Purpose:** Annual performance analysis
**Steps:**
1. Select "Yearly Report"
2. Enter the year
3. Generate
4. Review monthly breakdown

### Outstanding Payments
**Report Type:** Booking Status Report
**Purpose:** Find bookings with unpaid balances
**Steps:**
1. Select "Booking Status Report"
2. Check "Confirmed" and "Completed"
3. Generate
4. Look at "Outstanding Balance" and "Overdue Payments"

### Venue Utilization
**Report Type:** Venue Performance Report
**Purpose:** See which venues are most popular
**Steps:**
1. Select "Venue Performance Report"
2. Check all venues
3. Select last quarter date range
4. Generate
5. Compare revenue and booking counts

### Client History
**Report Type:** Client Report
**Purpose:** See a client's complete booking history
**Steps:**
1. Select "Client Report"
2. Find and select the client
3. Don't select date range (for all-time)
4. Generate

### Event Type Trends
**Report Type:** Event Type Analysis
**Purpose:** Identify popular event types
**Steps:**
1. Select "Event Type Analysis"
2. Check all event types
3. Select last 6 months date range
4. Generate
5. Compare counts and revenue

---

## 💾 Exporting Reports

### Print
- Opens browser print dialog
- Optimized for A4 paper
- Clean layout without sidebar
- **Best for:** Quick physical copies, PDF creation via print-to-PDF

### Export CSV
- Downloads .csv file
- Contains detailed bookings table
- Opens in Excel, Google Sheets, etc.
- **Best for:** Further analysis in spreadsheets

### Export Excel
- Downloads .csv with multiple sections
- Includes summary, breakdowns, and details
- **Best for:** Comprehensive data export

---

## ⚡ Quick Tips

### Faster Report Generation
- Be specific with filters (smaller dataset = faster)
- Use date ranges to limit data
- Select only needed venues/types/clients

### Better Insights
- Compare monthly reports across multiple months
- Use yearly report to identify seasonal trends
- Cross-reference venue and event type reports

### Finding Specific Data
- Use "Selected Bookings Report" for ad-hoc queries
- Search in booking selector to find specific events
- Filter by status to focus on actionable items

### Print Tips
- Landscape orientation for wide tables
- Adjust print zoom if content doesn't fit
- Use Chrome/Edge for best print results

---

## ❓ Troubleshooting

### "Please select a report type"
**Solution:** Choose a report type from the dropdown first

### "At least one [field] must be selected"
**Solution:** The report type requires that field - check at least one option

### "End date must be after start date"
**Solution:** Make sure end date is same or later than start date

### "No bookings found"
**Solution:**
- Check if bookings exist for your criteria
- Widen date range
- Remove some filters

### Report shows unexpected data
**Solution:**
- Verify your date range selection
- Check which filters are active
- Ensure correct report type selected

---

## 🔐 Status Codes Reference

- **Pending (0)** - Booking created but not confirmed
- **Confirmed (1)** - Booking confirmed by customer
- **Completed (2)** - Event has occurred
- **Cancelled (3)** - Booking was cancelled

---

## 💰 Financial Terms

- **Total Amount** - Original price before payments
- **Paid Amount** - Sum of all payments received
- **Balance** - Total Amount - Paid Amount (what's still owed)
- **Original Price** - Price before any discounts
- **Discounted Price** - Price after discounts applied
- **Outstanding Balance** - Total unpaid across all bookings

---

## 📅 Date Range Tips

### Common Ranges
- **This Month:** 1st of current month to today
- **Last Month:** 1st to last day of previous month
- **This Quarter:** 1st day of quarter to today
- **Last Year:** Jan 1 to Dec 31 of previous year
- **Year to Date:** Jan 1 to today

### Accounting Periods
- **Q1:** Jan 1 - Mar 31
- **Q2:** Apr 1 - Jun 30
- **Q3:** Jul 1 - Sep 30
- **Q4:** Oct 1 - Dec 31

---

## 🎨 Reading the Report

### Colors in Status Badges
- 🟢 **Green** - Completed
- 🔵 **Blue** - Confirmed
- 🟡 **Yellow** - Pending
- 🔴 **Red** - Cancelled

### Financial Color Coding
- 🟢 **Green** - Paid amounts (money received)
- 🟠 **Orange** - Balance/Outstanding (money owed)
- ⚫ **Black** - Totals and general amounts

---

## 📞 Support

If you encounter issues:
1. Check this guide for common solutions
2. Verify your data filters
3. Try a simpler report first
4. Check browser console for errors
5. Contact system administrator

---

**Last Updated:** October 2025
**Version:** 1.0
