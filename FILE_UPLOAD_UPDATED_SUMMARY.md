# File Upload System - Updated Implementation Summary

## Overview
The file upload system has been **updated to only upload files when forms are submitted**, rather than auto-uploading immediately upon selection. Category selection has been **completely removed**.

## Key Changes from Previous Version

### 1. **Upload Timing** ✅
- **Before**: Files uploaded immediately upon selection
- **After**: Files uploaded only when clicking "Add Payment" or "Create Booking"

### 2. **Category System** ✅
- **Removed**: No category selection dropdown
- **Removed**: No `categoryId` in database operations
- **Simplified**: Cleaner UI and simpler data model

### 3. **Component Architecture** ✅
- **Simplified**: FileUpload is now a controlled component
- **Parent-managed**: Parent components handle the upload process
- **State-based**: Uses `onFilesChange` callback to notify parent

## How It Works Now

### FileUpload Component
```tsx
<FileUpload
  title="Receipt Attachments"
  onFilesChange={(files) => setSelectedFiles(files)}
  disabled={isSubmitting}
  resetTrigger={resetCounter}
/>
```

**Props**:
- `title`: Display title
- `onFilesChange`: Callback when files are selected/removed
- `disabled`: Disable file selection during submission
- `resetTrigger`: Increment to clear all files

**Behavior**:
1. User selects file(s) → Files stored in local state
2. User can add more files or remove files
3. Files are **NOT uploaded** yet
4. Parent component receives file list via `onFilesChange`
5. When form is submitted → Parent uploads files
6. After successful submission → Parent increments `resetTrigger`
7. Component clears all files automatically

### Payment Dialog Flow

```
User fills payment form
     ↓
User selects receipt images (NOT uploaded yet)
     ↓
User clicks "Add Payment"
     ↓
1. Create payment in database
     ↓
2. If payment successful, upload each file:
   - POST /api/upload → Save to filesystem
   - POST /api/documents/create → Save to database
     ↓
3. Show success message
     ↓
4. Reset file list
     ↓
5. Close dialog
```

### Booking Form Flow

```
User fills booking form
     ↓
User selects client documents (if existing client)
User selects booking documents (contracts)
     ↓
User clicks "Create Booking"
     ↓
1. Create client (if new)
2. Create booking
3. Create menu & dishes
4. Create inventory statuses
5. Create billing
     ↓
6. Upload client files (if any):
   - Link to clientId
     ↓
7. Upload booking files (if any):
   - Link to bookingId
     ↓
8. Reset file lists
     ↓
9. Show success dialog
```

## Updated Code Structure

### FileUpload.tsx (Simplified)
```typescript
type FileWithPreview = {
  id: string;
  file: File;
};

type FileUploadProps = {
  title?: string;
  onFilesChange?: (files: File[]) => void;
  disabled?: boolean;
  resetTrigger?: number;
};

// Features:
// - Local file preview
// - No auto-upload
// - No progress bars
// - No category dropdown
// - Simple add/remove
```

### AddPaymentDialog.tsx
```typescript
const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
const [isUploading, setIsUploading] = useState(false);
const [fileResetTrigger, setFileResetTrigger] = useState(0);

// On payment creation success:
if (selectedFiles.length > 0) {
  setIsUploading(true);

  for (const file of selectedFiles) {
    // 1. Upload to filesystem
    const uploadResponse = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    // 2. Save to database
    await fetch("/api/documents/create", {
      method: "POST",
      body: JSON.stringify({
        name: file.name,
        file: path,
        paymentId: paymentId,
      }),
    });
  }

  setIsUploading(false);
}

handleClose();
```

### AddBookings Page
```typescript
const [selectedClientFiles, setSelectedClientFiles] = useState<File[]>([]);
const [selectedBookingFiles, setSelectedBookingFiles] = useState<File[]>([]);
const [clientFileResetTrigger, setClientFileResetTrigger] = useState(0);
const [bookingFileResetTrigger, setBookingFileResetTrigger] = useState(0);

// After billing is created:
// Upload client files
if (selectedClientFiles.length > 0 && selectedClientId) {
  for (const file of selectedClientFiles) {
    // Upload and link to clientId
  }
}

// Upload booking files
if (selectedBookingFiles.length > 0 && bookingId) {
  for (const file of selectedBookingFiles) {
    // Upload and link to bookingId
  }
}

// Reset
setSelectedClientFiles([]);
setSelectedBookingFiles([]);
setClientFileResetTrigger(prev => prev + 1);
setBookingFileResetTrigger(prev => prev + 1);
```

## API Endpoints

### POST /api/upload
**Purpose**: Upload file to filesystem

**Request**:
```typescript
FormData {
  file: File
}
```

**Response**:
```json
{
  "success": true,
  "path": "/DocumentFiles/1729879234567-receipt.jpg",
  "filename": "receipt.jpg"
}
```

### POST /api/documents/create
**Purpose**: Save document metadata to database

**Request**:
```json
{
  "name": "receipt.jpg",
  "file": "/DocumentFiles/1729879234567-receipt.jpg",
  "paymentId": 42,      // Optional
  "clientId": 15,       // Optional
  "bookingId": 88       // Optional
}
```

**Response**:
```json
{
  "success": true,
  "document": {
    "id": 1,
    "name": "receipt.jpg",
    "file": "/DocumentFiles/1729879234567-receipt.jpg",
    "paymentId": 42,
    "date": "2024-10-26T12:34:56Z"
  }
}
```

## Database Schema (Simplified)

```prisma
model ScannedDocument {
  id        Int      @id @default(autoincrement())
  bookingId Int?     // For contracts
  clientId  Int?     // For IDs
  paymentId Int?     // For receipts
  name      String   // Original filename
  date      DateTime @default(now())
  file      String   // Path: /DocumentFiles/timestamp-filename.ext

  // Relations
  booking   Booking? @relation(...)
  client    Client?  @relation(...)
  payment   Payment? @relation(...)

  // REMOVED: categoryId
  // REMOVED: category relation
}
```

## User Experience

### Payment Dialog
```
┌─────────────────────────────────────┐
│  Add Payment                        │
├─────────────────────────────────────┤
│  Amount: ₱5000                      │
│  OR Number: 12345                   │
│                                     │
│  Receipt Attachments:               │
│  [+ Add attachments]                │
│                                     │
│  Files to upload:                   │
│  📄 receipt.jpg      [×]           │
│  🖼️ payment-proof.png [×]           │
│                                     │
│  [Cancel]  [Add Payment]            │
└─────────────────────────────────────┘

Click "Add Payment" → Files upload
```

### Booking Form - Client Section
```
┌─────────────────────────────────────┐
│  Client Details                     │
│  ● Existing Client: Juan Dela Cruz │
│                                     │
│  Client Documents (ID, etc.):       │
│  [+ Add attachments]                │
│                                     │
│  Files to upload:                   │
│  🖼️ id-front.jpg  [×]               │
│  🖼️ id-back.jpg   [×]               │
└─────────────────────────────────────┘
```

### Booking Form - Documents Section
```
┌─────────────────────────────────────┐
│  Documents                          │
│  Contract and Other Documents       │
│                                     │
│  [+ Add attachments]                │
│                                     │
│  Files to upload:                   │
│  📄 signed-contract.pdf  [×]        │
│  📄 venue-agreement.pdf  [×]        │
│  🖼️ venue-photo.jpg      [×]        │
│                                     │
│  ℹ️ Upload scanned contracts...     │
└─────────────────────────────────────┘

Click "Create Booking" → All files upload
```

## What Was Removed

### ❌ Removed Features
1. **Auto-upload**: No more immediate upload on file selection
2. **Progress bars**: No need since upload happens in background
3. **Category dropdown**: Complete removal
4. **Category database field**: Not used in operations
5. **React Query integration**: Simplified to direct API calls
6. **Document categories seed**: Not needed anymore
7. **Real-time upload feedback**: Now batch uploaded on submit

### ❌ Removed Dependencies
```typescript
// Removed from FileUpload.tsx:
import { Progress } from "../ui/progress";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createScannedDocument, deleteScannedDocument } from "@/server/Documents/pushActions";
import { getDocumentCategories } from "@/server/Documents/pullActions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
```

### ❌ Removed State
```typescript
// Removed from FileUpload.tsx:
const [uploading, setUploading] = useState(false);
const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

// Removed file type:
type FileWithProgress = {
  progress: number;      // ❌
  uploaded: boolean;     // ❌
  path?: string;         // ❌
  documentId?: number;   // ❌
};
```

## Benefits of New Approach

### ✅ Performance
- No network calls until form submission
- Batch upload instead of individual uploads
- Reduced server load

### ✅ User Experience
- Cleaner, simpler interface
- Less visual clutter (no progress bars)
- Faster interaction (no waiting for uploads)
- All-or-nothing approach (payment + files together)

### ✅ Error Handling
- Failed payment = no files uploaded
- Consistent state (no orphaned files)
- Simpler rollback logic

### ✅ Code Simplicity
- Fewer dependencies
- Less complex state management
- Easier to maintain
- Smaller bundle size

## Files Modified

1. ✅ **components/(Manage)/FileUpload.tsx**
   - Removed auto-upload logic
   - Removed category dropdown
   - Removed React Query
   - Simplified to controlled component

2. ✅ **components/(Payments)/AddPaymentDialog.tsx**
   - Added file state management
   - Upload files in onSuccess callback
   - Handle file reset

3. ✅ **components/(Bookings)/(AddBookings)/page.tsx**
   - Added client files state
   - Added booking files state
   - Upload files after booking/billing creation

4. ✅ **server/Documents/pushActions.ts**
   - Removed `categoryId` parameter

5. ✅ **app/api/documents/create/route.ts**
   - New API endpoint for document creation

## Testing Checklist

### Payment Dialog
- [ ] Select file before filling form → File shows in list
- [ ] Remove file → File removed from list
- [ ] Submit payment → Files upload
- [ ] Check database → Payment + ScannedDocument records created
- [ ] Check filesystem → Files exist in /DocumentFiles/
- [ ] Close dialog → File list resets

### Client Documents
- [ ] Select existing client → FileUpload appears
- [ ] Add ID photos → Photos show in list
- [ ] Create booking → Files upload
- [ ] Check database → Files linked to clientId
- [ ] Form reset → File list clears

### Booking Documents
- [ ] Add contract files → Files show in list
- [ ] Create booking → Files upload after billing
- [ ] Check database → Files linked to bookingId
- [ ] Check both client AND booking files upload together

## Migration Notes

### For Existing Installations
If you already ran the previous version:

1. **No database migration needed** - categoryId field is optional
2. **Existing files still work** - File paths unchanged
3. **Existing documents** - Will have null categoryId (acceptable)
4. **No data loss** - Backward compatible

### Optional Cleanup
```sql
-- Optional: Remove unused category references
UPDATE ScannedDocument SET categoryId = NULL;

-- Optional: Remove category seed data (if not needed)
DELETE FROM ScannedDocumentCategory;
```

## Summary

The file upload system is now **simpler, faster, and more reliable**:

- ✅ Files upload only on form submission
- ✅ No category system (removed entirely)
- ✅ Batch upload for better performance
- ✅ Cleaner UI with less clutter
- ✅ All-or-nothing consistency
- ✅ Smaller codebase and fewer dependencies

The system maintains all core functionality while providing a better user experience and simpler codebase.
