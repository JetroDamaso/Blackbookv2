# File Upload System Implementation

## Overview
This document describes the complete implementation of the file upload system for the Blackbook v2 application. The system allows uploading and managing documents (receipts, contracts, IDs, etc.) across different modules.

## Architecture

### 1. **Storage Strategy**
- **Files**: Stored in the filesystem at `public/DocumentFiles/`
- **Database**: Only file paths are stored in the SQLite database via the `ScannedDocument` table

### 2. **Database Schema**

#### ScannedDocument Table
```prisma
model ScannedDocument {
  id         Int                      @id @default(autoincrement())
  bookingId  Int?                     // Link to booking (for contracts)
  clientId   Int?                     // Link to client (for IDs)
  paymentId  Int?                     // Link to payment (for receipts)
  name       String                   // Original filename
  categoryId Int?                     // Category (Contract, ID, Receipt, etc.)
  date       DateTime                 @default(now())
  file       String                   // File path: /DocumentFiles/timestamp-filename.ext
  category   ScannedDocumentCategory? @relation(...)
  booking    Booking?                 @relation(...)
  client     Client?                  @relation(...)
  payment    Payment?                 @relation(...)
}
```

#### Document Categories
Pre-seeded categories:
- Contract
- ID / Identification
- Receipt
- Permit
- Agreement
- Other

### 3. **File Upload Flow**

```
User selects file(s)
     ↓
FileUpload component handles selection
     ↓
Auto-upload triggered immediately
     ↓
POST /api/upload → Saves to public/DocumentFiles/
     ↓
Returns file path (/DocumentFiles/timestamp-filename.ext)
     ↓
createScannedDocument → Saves metadata to database
     ↓
React Query invalidates & refetches document list
     ↓
File appears in UI with delete option
```

## Components

### FileUpload Component
**Location**: `components/(Manage)/FileUpload.tsx`

**Props**:
```typescript
{
  bookingId?: number;      // For contract uploads
  clientId?: number;       // For ID uploads
  paymentId?: number;      // For receipt uploads
  title?: string;          // Custom title (default: "Documents")
  categoryId?: number;     // Pre-selected category
  onUploadComplete?: (documentId: number) => void;
}
```

**Features**:
- Multi-file upload support
- Auto-upload on file selection
- Real-time progress tracking
- File type icons (image, PDF, video, audio)
- File size display
- Category selection dropdown
- Delete uploaded files
- Scroll area for multiple files

**Usage Examples**:

```tsx
// Payment receipts
<FileUpload paymentId={paymentId} title="Receipt Attachments" />

// Client IDs
<FileUpload clientId={clientId} title="Client Documents (ID, etc.)" />

// Booking contracts
<FileUpload bookingId={bookingId} title="Contract and Other Documents" />
```

## API Routes

### POST /api/upload
**Location**: `app/api/upload/route.ts`

**Request**:
- Method: POST
- Content-Type: multipart/form-data
- Body: FormData with "file" field

**Response**:
```json
{
  "success": true,
  "path": "/DocumentFiles/1729879234567-contract.pdf",
  "filename": "contract.pdf"
}
```

**Error Response**:
```json
{
  "error": "Failed to upload file"
}
```

## Server Actions

### Document Management
**Location**: `server/Documents/`

#### pushActions.ts
```typescript
// Create document record
createScannedDocument(data: {
  name: string;
  file: string;
  categoryId?: number;
  bookingId?: number;
  clientId?: number;
  paymentId?: number;
})

// Delete document
deleteScannedDocument(id: number)
```

#### pullActions.ts
```typescript
// Get documents by booking
getDocumentsByBooking(bookingId: number)

// Get documents by client
getDocumentsByClient(clientId: number)

// Get documents by payment
getDocumentsByPayment(paymentId: number)

// Get all document categories
getDocumentCategories()
```

## Integration Points

### 1. **Add Payment Dialog**
**File**: `components/(Payments)/AddPaymentDialog.tsx`

- Automatically captures created payment ID
- FileUpload only appears after payment is submitted
- Uploads linked to payment record

**State Management**:
```tsx
const [createdPaymentId, setCreatedPaymentId] = useState<number | undefined>(undefined);

// In mutation onSuccess:
if (data && typeof data === "object" && "id" in data) {
  setCreatedPaymentId((data as { id: number }).id);
}
```

### 2. **Add Booking Form**
**File**: `components/(Bookings)/(AddBookings)/page.tsx`

#### Client Documents Section
- Shows when existing client is selected
- Uploads linked to client record
- Located in "Client Details" block

#### Contract Documents Section
- New dedicated "Documents" block
- Shows after booking creation
- Uploads linked to booking record
- Located before "Notes" section

**State Management**:
```tsx
const [createdBookingId, setCreatedBookingId] = useState<number | null>(null);

// After booking creation:
const bookingId = (booking as any)?.id ? Number((booking as any).id) : 0;
if (bookingId) {
  setCreatedBookingId(bookingId);
}
```

## File Naming Convention

Files are stored with timestamp-prefixed names to prevent conflicts:
```
{timestamp}-{sanitized-original-name}.{extension}
```

Example:
```
Original: "Client ID - Juan Dela Cruz.jpg"
Stored as: "1729879234567-Client_ID_-_Juan_Dela_Cruz.jpg"
```

## Security Considerations

1. **File Sanitization**: Special characters removed from filenames
2. **Public Access**: Files stored in `public/` are accessible via URL
3. **Database Relations**: Cascading deletes with `onDelete: SetNull`
4. **File Type Validation**: Currently accepts all file types (can be restricted)

## Future Enhancements

1. **File Type Restrictions**:
   - Add accept prop: `accept="image/*,.pdf"`
   - Server-side MIME type validation

2. **File Size Limits**:
   - Client-side: Check before upload
   - Server-side: Enforce maximum size

3. **Image Optimization**:
   - Auto-compress large images
   - Generate thumbnails

4. **Secure Storage**:
   - Move files outside `public/`
   - Implement access control
   - Serve via authenticated route

5. **Cloud Storage**:
   - Integrate with AWS S3/Azure Blob
   - CDN for faster delivery

## Testing Checklist

- [ ] Upload single file
- [ ] Upload multiple files simultaneously
- [ ] Delete uploaded file
- [ ] Category selection works
- [ ] Progress indicator shows correctly
- [ ] File icons display properly
- [ ] Files persist in database
- [ ] Files accessible via browser
- [ ] Payment → Receipt upload
- [ ] Client → ID upload
- [ ] Booking → Contract upload
- [ ] Documents show in correct sections

## Troubleshooting

### Files not uploading
1. Check `public/DocumentFiles/` directory exists
2. Verify API route is accessible: `/api/upload`
3. Check browser console for errors
4. Verify server has write permissions

### Database errors
1. Run migration: `npx prisma migrate dev`
2. Regenerate client: `npx prisma generate`
3. Check schema relations

### Files not appearing
1. Clear React Query cache
2. Check query invalidation
3. Verify correct ID passed to FileUpload

## Migration Commands

```bash
# Apply schema changes
npx prisma migrate dev --name add_document_upload_fields

# Seed document categories
npx tsx prisma/seed-document-categories.ts

# Regenerate Prisma client
npx prisma generate
```

## Query Keys for React Query

```typescript
["documentsByBooking", bookingId]
["documentsByClient", clientId]
["documentsByPayment", paymentId]
["documentCategories"]
```

## Conclusion

The file upload system is now fully integrated and reusable across multiple modules. It provides a consistent UX for document management while maintaining clear data relationships through the database schema.
