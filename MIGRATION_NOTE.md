# Database Migration Note: Employee ID to UUID

## Overview

This migration changes the Employee model's `id` field from `Int` (auto-increment) to `String` (UUID). This is a **breaking change** that requires careful migration planning.

## Schema Changes

### Before
```prisma
model Employee {
  id               Int          @id @default(autoincrement())
  // ... other fields
}
```

### After
```prisma
model Employee {
  id               String       @id @default(uuid())
  // ... other fields
}
```

## Migration Steps

### 1. Backup Database
```bash
# For SQLite
cp prisma/dev.db prisma/dev.db.backup

# For PostgreSQL
pg_dump your_database > backup.sql

# For MySQL
mysqldump your_database > backup.sql
```

### 2. Create Migration
```bash
npx prisma migrate dev --name employee_id_to_uuid
```

### 3. Data Migration Script

⚠️ **IMPORTANT**: This change will require existing Employee records to be migrated. Here's a sample migration script:

```sql
-- Step 1: Add temporary UUID column
ALTER TABLE Employee ADD COLUMN temp_id TEXT;

-- Step 2: Generate UUIDs for existing records
UPDATE Employee SET temp_id = (
  SELECT lower(hex(randomblob(4))) || '-' ||
         lower(hex(randomblob(2))) || '-' ||
         '4' || substr(lower(hex(randomblob(2))), 2) || '-' ||
         substr('89ab', abs(random()) % 4 + 1, 1) ||
         substr(lower(hex(randomblob(2))), 2) || '-' ||
         lower(hex(randomblob(6)))
);

-- Step 3: Update related tables with foreign keys
-- (This depends on your specific foreign key relationships)

-- Step 4: Drop old id column and rename temp_id
-- Note: SQLite doesn't support dropping columns directly
-- You'll need to recreate the table

-- For other databases:
ALTER TABLE Employee DROP COLUMN id;
ALTER TABLE Employee RENAME COLUMN temp_id TO id;
```

### 4. Authentication Impact

The authentication system now works with UUID prefixes:

- **Before**: Login with full integer ID (e.g., `123`)
- **After**: Login with first 8 characters of UUID (e.g., `a1b2c3d4`)

### 5. Application Updates

#### Login Components
- Updated placeholder text to show UUID format
- Added `maxLength={8}` to input fields
- Updated validation messages

#### Database Queries
- `authenticateEmployee()` now searches by UUID prefix
- `getEmployeeById()` expects string UUID parameter
- All related foreign key queries updated

#### User Interface
- Employee ID display shows only first 8 characters
- Full UUID stored in session but only prefix shown to users

## Testing Checklist

- [ ] Backup created successfully
- [ ] Migration runs without errors
- [ ] Existing employees can login with UUID prefix
- [ ] New employee creation works with UUID
- [ ] All employee-related queries function properly
- [ ] Foreign key relationships maintained
- [ ] Session management works with UUID
- [ ] User info displays correctly

## Rollback Plan

If issues occur, restore from backup:

```bash
# For SQLite
cp prisma/dev.db.backup prisma/dev.db

# For other databases
# Restore from your backup files
```

## Production Deployment

1. **Schedule maintenance window**
2. **Create production backup**
3. **Test migration on staging environment**
4. **Run migration during low-traffic period**
5. **Monitor for issues post-deployment**
6. **Verify all authentication flows work**

## Security Considerations

- UUID provides better security than sequential integers
- First 8 characters still provide sufficient uniqueness for login
- Full UUID stored securely in database and session
- Consider rate limiting on login attempts

## Support

If you encounter issues during migration:

1. Check migration logs for specific errors
2. Verify backup integrity before proceeding
3. Test on development environment first
4. Have rollback plan ready

## Example UUID Format

Generated UUIDs will look like: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`
Login will use: `a1b2c3d4` (first 8 characters)
