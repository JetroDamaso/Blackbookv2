# Employee Records Deletion Guide

## ⚠️ **IMPORTANT WARNING**

Deleting Employee records is a **DESTRUCTIVE** operation that cannot be undone. Always create a backup before proceeding.

## 🎯 **Available Methods**

### Method 1: Using Prisma Scripts (Recommended)

#### Option A: Safe Script with Confirmation
```bash
npm run delete-employees-safe
```

**Features:**
- Shows current record count
- Displays related records that will be affected
- Requires double confirmation
- Interactive prompts
- Safer for production use

#### Option B: Direct Script (Dangerous)
```bash
npm run delete-employees
```

**Features:**
- Immediate deletion without prompts
- Faster for development
- **USE WITH EXTREME CAUTION**

### Method 2: Using Prisma Studio

1. **Open Prisma Studio:**
   ```bash
   npx prisma studio
   ```

2. **Navigate to Employee table**
3. **Select all records** (Ctrl+A)
4. **Click Delete button**
5. **Confirm deletion**

### Method 3: Using Database Console (SQLite)

```bash
# Access SQLite database
sqlite3 prisma/dev.db

# Delete related records first
DELETE FROM HistoryLog WHERE employeeId IS NOT NULL;

# Delete all employees
DELETE FROM Employee;

# Verify deletion
SELECT COUNT(*) FROM Employee;

# Exit
.quit
```

### Method 4: Using Raw SQL with Prisma

```typescript
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

async function deleteAllEmployees() {
  // Delete related records first
  await prisma.$executeRaw`DELETE FROM HistoryLog WHERE employeeId IS NOT NULL`;

  // Delete all employees
  await prisma.$executeRaw`DELETE FROM Employee`;

  console.log("All employees deleted");
}
```

## 🛡️ **Safety Measures**

### 1. Create Backup Before Deletion

```bash
# For SQLite
cp prisma/dev.db prisma/dev.db.backup-$(date +%Y%m%d-%H%M%S)

# For PostgreSQL
pg_dump your_database > backup-$(date +%Y%m%d-%H%M%S).sql

# For MySQL
mysqldump your_database > backup-$(date +%Y%m%d-%H%M%S).sql
```

### 2. Check Related Records

Before deleting, check what will be affected:

```typescript
// Count related records
const historyLogsCount = await prisma.historyLog.count({
  where: { employeeId: { not: null } }
});

console.log(`${historyLogsCount} HistoryLog records will be deleted`);
```

### 3. Export Data First (Optional)

```typescript
// Export all employee data to JSON
const employees = await prisma.employee.findMany({
  include: { role: true, historyLogs: true }
});

const fs = require('fs');
fs.writeFileSync(
  `employees-export-${new Date().toISOString().split('T')[0]}.json`,
  JSON.stringify(employees, null, 2)
);
```

## 📋 **Step-by-Step Process**

### Using the Safe Script (Recommended)

1. **Backup Database:**
   ```bash
   cp prisma/dev.db prisma/dev.db.backup
   ```

2. **Run Safe Deletion Script:**
   ```bash
   npm run delete-employees-safe
   ```

3. **Follow Prompts:**
   - Review record counts
   - Type "yes" for first confirmation
   - Type "DELETE ALL EMPLOYEES" for final confirmation

4. **Verify Deletion:**
   ```bash
   npx prisma studio
   # Check Employee table is empty
   ```

### Quick Deletion (Development Only)

```bash
# Backup first
cp prisma/dev.db prisma/dev.db.backup

# Quick delete
npm run delete-employees

# Verify
npx prisma studio
```

## 🔍 **Verification Methods**

### Check Employee Count
```typescript
const count = await prisma.employee.count();
console.log(`Employee records remaining: ${count}`);
```

### Using Prisma Studio
1. Open: `npx prisma studio`
2. Navigate to Employee table
3. Verify table is empty

### Using Database Console
```sql
SELECT COUNT(*) FROM Employee;
-- Should return 0
```

## 🚨 **Emergency Recovery**

### Restore from Backup
```bash
# For SQLite
cp prisma/dev.db.backup prisma/dev.db

# For PostgreSQL
psql your_database < backup.sql

# For MySQL
mysql your_database < backup.sql
```

### Reset Database Completely
```bash
# Delete database file
rm prisma/dev.db

# Recreate database
npx prisma migrate reset
npx prisma db push
```

## 🧪 **Testing Scenarios**

### Test Script on Sample Data

1. **Create Test Employees:**
   ```typescript
   await prisma.employee.createMany({
     data: [
       { firstName: "Test", lastName: "User1", password: "test123" },
       { firstName: "Test", lastName: "User2", password: "test123" }
     ]
   });
   ```

2. **Run Deletion Script**
3. **Verify Results**

## 🔒 **Security Considerations**

### Production Environment
- **Never run deletion scripts in production without approval**
- **Always backup production data**
- **Test scripts in staging environment first**
- **Use safe script with confirmations**
- **Audit trail: Log who deleted records and when**

### Development Environment
- **Still backup before deletion**
- **Inform team members before deleting**
- **Document reason for deletion**

## 📝 **Post-Deletion Checklist**

- [ ] Verify Employee table is empty
- [ ] Check related tables (HistoryLog) are cleaned
- [ ] Test authentication (should fail gracefully)
- [ ] Verify application handles empty user state
- [ ] Update any seed data if needed
- [ ] Document deletion in project logs

## 🛠️ **Troubleshooting**

### Script Fails with Foreign Key Error
```typescript
// Delete in correct order
await prisma.historyLog.deleteMany({
  where: { employeeId: { not: null } }
});
await prisma.employee.deleteMany({});
```

### Permission Denied
```bash
# Check file permissions
ls -la prisma/dev.db

# Fix permissions if needed
chmod 644 prisma/dev.db
```

### Database Locked
```bash
# Check for running processes
ps aux | grep prisma

# Kill any running Prisma processes
killall -9 node
```

## 🎯 **Common Use Cases**

### Development Reset
```bash
npm run delete-employees-safe
# Then create new test employees
```

### Data Migration Cleanup
```bash
# After migrating to new schema
npm run delete-employees
```

### Testing Environment Reset
```bash
# Automated test cleanup
npm run delete-employees && npm run seed-test-data
```

## 📞 **Support**

If you encounter issues:

1. **Check database connection**
2. **Verify Prisma schema is up to date**
3. **Review error logs in console**
4. **Ensure no other processes are using database**
5. **Contact team lead for production deletions**

---

**⚠️ Remember: Employee deletion affects authentication and user sessions. Test thoroughly after deletion!**
