/*
  Warnings:

  - You are about to drop the `UserActivityLog` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "UserActivityLog_createdAt_idx";

-- DropIndex
DROP INDEX "UserActivityLog_resource_idx";

-- DropIndex
DROP INDEX "UserActivityLog_action_idx";

-- DropIndex
DROP INDEX "UserActivityLog_userId_idx";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "UserActivityLog";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Booking" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "eventName" TEXT NOT NULL,
    "clientId" INTEGER,
    "pavilionId" INTEGER,
    "packageId" INTEGER,
    "eventType" INTEGER,
    "calendarColor" TEXT,
    "catering" INTEGER,
    "startAt" DATETIME,
    "endAt" DATETIME,
    "foodTastingAt" DATETIME,
    "totalPax" INTEGER NOT NULL,
    "themeMotif" TEXT,
    "status" INTEGER NOT NULL,
    "customDiscount" INTEGER,
    "notes" TEXT,
    "ref_pavilionName" TEXT,
    "ref_clientFullName" TEXT,
    "createdById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Booking_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Employee" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Booking_pavilionId_fkey" FOREIGN KEY ("pavilionId") REFERENCES "Pavilion" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Booking_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Booking_eventType_fkey" FOREIGN KEY ("eventType") REFERENCES "EventTypes" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Booking_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Booking" ("calendarColor", "catering", "clientId", "customDiscount", "endAt", "eventName", "eventType", "foodTastingAt", "id", "notes", "packageId", "pavilionId", "ref_clientFullName", "ref_pavilionName", "startAt", "status", "themeMotif", "totalPax") SELECT "calendarColor", "catering", "clientId", "customDiscount", "endAt", "eventName", "eventType", "foodTastingAt", "id", "notes", "packageId", "pavilionId", "ref_clientFullName", "ref_pavilionName", "startAt", "status", "themeMotif", "totalPax" FROM "Booking";
DROP TABLE "Booking";
ALTER TABLE "new_Booking" RENAME TO "Booking";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
