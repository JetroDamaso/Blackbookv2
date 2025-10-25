# FileUpload Component - Visual Integration Guide

## 📍 Location Map

### 1. Payment Dialog - Receipt Uploads
```
┌─────────────────────────────────────┐
│  Add Payment Dialog                 │
├─────────────────────────────────────┤
│  Mode of Payment: [Cash ▼]          │
│  Amount: [₱ 5000.00]                │
│  OR Number: [12345]                 │
│  Notes: [Payment for deposit]       │
│                                     │
│  ╔═══════════════════════════════╗ │
│  ║ Receipt Attachments           ║ │
│  ║ ─────────────────────────────║ │
│  ║ [+ Add attachments]           ║ │
│  ║                               ║ │
│  ║ Files:                        ║ │
│  ║ 📄 receipt.jpg    Completed  ║ │
│  ║ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 100%    ║ │
│  ╚═══════════════════════════════╝ │
│                                     │
│  [Cancel]  [Add Payment]            │
└─────────────────────────────────────┘

TRIGGER: After payment is successfully created
LINKS TO: Payment record via paymentId
PURPOSE: Upload receipt images/PDFs
```

### 2. Add Booking - Client Documents
```
┌──────────────────────────────────────┐
│  Client Details                      │
├──────────────────────────────────────┤
│  ○ New Client    ● Existing Client   │
│                                      │
│  ┌────────────────────────────────┐ │
│  │ Juan Dela Cruz (09123456789)   │ │
│  │ Manila, NCR                     │ │
│  └────────────────────────────────┘ │
│                                      │
│  ╔════════════════════════════════╗ │
│  ║ Client Documents (ID, etc.)    ║ │
│  ║ Category: [ID / Identification▼]║│
│  ║ ──────────────────────────────║ │
│  ║ [+ Add attachments]            ║ │
│  ║                                ║ │
│  ║ Files:                         ║ │
│  ║ 🖼️ client-id.jpg    Completed ║ │
│  ║ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 100%       ║ │
│  ╚════════════════════════════════╝ │
└──────────────────────────────────────┘

TRIGGER: When existing client is selected
LINKS TO: Client record via clientId
PURPOSE: Upload ID photos, documents
```

### 3. Add Booking - Contract Documents
```
┌──────────────────────────────────────┐
│  [Previous sections: Event, Dates...] │
│                                      │
│  ╔════════════════════════════════╗ │
│  ║ Documents                      ║ │
│  ║ ══════════════════════════════ ║ │
│  ║ Contract and Other Documents   ║ │
│  ║                                ║ │
│  ║ Category: [Contract ▼]         ║ │
│  ║ [+ Add attachments]            ║ │
│  ║                                ║ │
│  ║ Files:                         ║ │
│  ║ 📄 signed-contract.pdf         ║ │
│  ║ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 100%     ║ │
│  ║                                ║ │
│  ║ 🖼️ venue-photo.jpg             ║ │
│  ║ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 100%     ║ │
│  ║                                ║ │
│  ║ ℹ️ Upload scanned contracts,   ║ │
│  ║   agreements, and documents    ║ │
│  ╚════════════════════════════════╝ │
│                                      │
│  ┌────────────────────────────────┐ │
│  │ Notes                          │ │
│  │ [Additional booking notes...]  │ │
│  └────────────────────────────────┘ │
│                                      │
│  [Create Booking]                    │
└──────────────────────────────────────┘

TRIGGER: After booking is created
LINKS TO: Booking record via bookingId
PURPOSE: Upload contracts, agreements, photos
```

## 🎨 Component Features Visual

### File Upload Component Anatomy
```
┌─────────────────────────────────────────┐
│  📋 Documents              [Category ▼] │ ← Title & Category Selector
├─────────────────────────────────────────┤
│  [+ Add attachments]                    │ ← Upload Button
├─────────────────────────────────────────┤
│  Files:                                 │ ← Files List Header
│  ┌─────────────────────────────────┐   │
│  │ 📄 Icon  filename.pdf      [×]  │   │ ← File Item
│  │         1.2 MB • PDF            │   │
│  │         Completed               │   │ ← Status
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 100%     │   │ ← Progress Bar
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ 🖼️ Icon  photo.jpg         [×]  │   │
│  │         500 KB • JPEG           │   │
│  │         Uploading...            │   │
│  │  ▓▓▓▓▓▓▓▓░░░░░░░░░░░ 45%      │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ 🎥 Icon  video.mp4         [×]  │   │
│  │         15.3 MB • MP4           │   │
│  │         12%                     │   │
│  │  ▓▓░░░░░░░░░░░░░░░░░░░ 12%    │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
      ↑ Scroll Area (max 200px height)
```

### File Icons by Type
```
🖼️  Images    → .jpg, .png, .gif, .webp
📄  PDFs      → .pdf
🎥  Videos    → .mp4, .mov, .avi
🎵  Audio     → .mp3, .wav, .ogg
📋  Generic   → Other file types
```

### Upload States
```
State 1: Initial
┌────────────────────┐
│ [+ Add attachments]│
└────────────────────┘

State 2: Uploading
┌────────────────────┐
│ 📄 filename.pdf    │
│ Uploading... 45%   │
│ ▓▓▓▓▓░░░░░░ 45%   │
└────────────────────┘

State 3: Completed
┌────────────────────┐
│ 📄 filename.pdf [×]│
│ Completed          │
│ ▓▓▓▓▓▓▓▓▓▓ 100%   │
└────────────────────┘
```

## 🔄 Upload Flow Diagram

```
┌─────────┐
│  User   │
└────┬────┘
     │ 1. Clicks "Add attachments"
     ↓
┌─────────────────┐
│ File Selection  │
│ Dialog (OS)     │
└────┬────────────┘
     │ 2. Selects file(s)
     ↓
┌──────────────────┐
│ FileUpload       │
│ Component        │
└────┬─────────────┘
     │ 3. Auto-upload starts
     ├──→ Shows progress (0-90%)
     │
     ↓
┌──────────────────┐
│ POST /api/upload │
│ Upload to        │
│ filesystem       │
└────┬─────────────┘
     │ 4. Returns file path
     ├──→ Updates progress (100%)
     │
     ↓
┌──────────────────┐
│ createScanned    │
│ Document()       │
│ Save to DB       │
└────┬─────────────┘
     │ 5. Returns document ID
     │
     ↓
┌──────────────────┐
│ React Query      │
│ Invalidate       │
│ Queries          │
└────┬─────────────┘
     │ 6. Refetch documents
     │
     ↓
┌──────────────────┐
│ UI Updates       │
│ ✓ Completed      │
└──────────────────┘
```

## 📊 Data Flow

### Payment Context
```
User uploads receipt.jpg
         ↓
POST /api/upload
         ↓
Saves to: /public/DocumentFiles/1729879234567-receipt.jpg
         ↓
Database: ScannedDocument {
  id: 1
  paymentId: 42
  clientId: null
  bookingId: null
  name: "receipt.jpg"
  file: "/DocumentFiles/1729879234567-receipt.jpg"
  categoryId: 3 (Receipt)
  date: 2024-10-25T12:34:56Z
}
         ↓
React Query invalidates: ["documentsByPayment", 42]
         ↓
Component shows uploaded file with [×] delete button
```

### Client Context
```
User uploads id-front.jpg, id-back.jpg
         ↓
POST /api/upload (× 2)
         ↓
Saves to:
  - /DocumentFiles/1729879234567-id-front.jpg
  - /DocumentFiles/1729879234568-id-back.jpg
         ↓
Database: ScannedDocument {
  id: 2, 3
  clientId: 15
  paymentId: null
  bookingId: null
  ...
}
         ↓
React Query invalidates: ["documentsByClient", 15]
```

### Booking Context
```
User uploads contract.pdf
         ↓
POST /api/upload
         ↓
Saves to: /DocumentFiles/1729879234569-contract.pdf
         ↓
Database: ScannedDocument {
  id: 4
  bookingId: 88
  clientId: null
  paymentId: null
  ...
}
         ↓
React Query invalidates: ["documentsByBooking", 88]
```

## 🎯 User Journey

### Journey 1: Adding Payment Receipt
```
1. User creates payment
   → Form: Amount, OR Number, etc.

2. Payment saved successfully
   → Payment ID captured: 42

3. FileUpload component appears
   → Shows "Receipt Attachments"

4. User clicks "Add attachments"
   → OS file dialog opens

5. User selects receipt.jpg
   → Auto-upload starts immediately

6. Progress bar shows 0% → 100%
   → File appears in list

7. User can:
   → Upload more files
   → Delete uploaded files
   → Close dialog
```

### Journey 2: Adding Client Documents
```
1. User selects existing client
   → Client ID: 15

2. FileUpload component appears
   → Shows "Client Documents (ID, etc.)"

3. User selects category
   → "ID / Identification"

4. User uploads ID photos
   → id-front.jpg, id-back.jpg

5. Both files upload simultaneously
   → Shows progress for each

6. Files linked to client
   → Available for all bookings of this client
```

### Journey 3: Adding Booking Contract
```
1. User fills booking form
   → Event details, dates, etc.

2. User submits booking
   → Booking created, ID: 88

3. FileUpload component active
   → Shows "Contract and Other Documents"

4. User uploads contract
   → signed-contract.pdf

5. Optional: Upload more docs
   → venue-photos.jpg, permit.pdf

6. All docs linked to booking
   → Available in booking details
```

## 🎭 Component Variations

### Minimal (Payment)
```tsx
<FileUpload
  paymentId={42}
/>
```

### With Title (Client)
```tsx
<FileUpload
  clientId={15}
  title="Client ID Photos"
/>
```

### With Category (Booking)
```tsx
<FileUpload
  bookingId={88}
  categoryId={1}
  title="Signed Contract"
/>
```

### With Callback (Advanced)
```tsx
<FileUpload
  bookingId={88}
  onUploadComplete={(docId) => {
    console.log(`Document ${docId} uploaded`);
    // Trigger other actions
  }}
/>
```

## 🎨 Styling & Theme

### Colors
- Primary: Blue accent for icons
- Success: Green progress bar when complete
- Muted: Gray text for file metadata
- Background: Light gray container

### Animations
- Progress bar fills smoothly
- Files fade in when added
- Hover effects on delete button
- Smooth scrolling in file list

### Responsive
- Full width by default
- Scrollable file list (max 200px height)
- Mobile-friendly touch targets
- Adaptive file name truncation

## ✅ Integration Checklist

### Payment Dialog ✅
- [x] Component imported
- [x] State for createdPaymentId
- [x] Mutation captures payment ID
- [x] FileUpload rendered with paymentId
- [x] Title: "Receipt Attachments"

### Client Documents ✅
- [x] Component imported in AddBookings
- [x] Conditional render when client selected
- [x] FileUpload with clientId
- [x] Title: "Client Documents (ID, etc.)"
- [x] Positioned in Client Details block

### Booking Documents ✅
- [x] State for createdBookingId
- [x] Booking ID captured after creation
- [x] New "Documents" block created
- [x] FileUpload with bookingId
- [x] Title: "Contract and Other Documents"
- [x] Positioned before Notes section

## 🔍 Testing Scenarios

### Test 1: Single File Upload
```
1. Open payment dialog
2. Click "Add attachments"
3. Select single image
4. Verify progress bar
5. Verify "Completed" status
6. Verify file appears in list
```

### Test 2: Multiple Files
```
1. Open booking documents
2. Select 3 files at once
3. Verify all upload simultaneously
4. Verify individual progress bars
5. Verify all complete successfully
```

### Test 3: File Deletion
```
1. Upload a file
2. Click [×] delete button
3. Verify file removed from UI
4. Verify database record deleted
5. Verify filesystem file remains
   (can be cleaned up separately)
```

### Test 4: Category Selection
```
1. Open client documents
2. Select "ID / Identification" category
3. Upload file
4. Verify category saved correctly
5. Change category
6. Upload another file
7. Verify different category saved
```

## 📱 Mobile Considerations

- Touch-friendly buttons (min 44x44px)
- Scrollable file list
- Responsive file name truncation
- Mobile file picker support
- Progress bars visible on small screens

## 🚀 Ready to Use!

The FileUpload component is now fully integrated and ready for testing. Test each of the three contexts to ensure proper functionality.
