/*
  Warnings:

  - You are about to drop the `eventTypes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "eventTypes_name_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "eventTypes";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "EventTypes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Booking" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "eventName" TEXT NOT NULL,
    "clientId" INTEGER,
    "pavilionId" INTEGER,
    "eventType" TEXT,
    "calendarColor" TEXT,
    "startAt" DATETIME NOT NULL,
    "endAt" DATETIME NOT NULL,
    "foodTastingAt" DATETIME,
    "totalPax" INTEGER NOT NULL,
    "themeMotif" TEXT,
    "status" INTEGER NOT NULL,
    "notes" TEXT,
    CONSTRAINT "Booking_eventType_fkey" FOREIGN KEY ("eventType") REFERENCES "EventTypes" ("name") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Booking_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Booking_pavilionId_fkey" FOREIGN KEY ("pavilionId") REFERENCES "Pavilion" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Booking_status_fkey" FOREIGN KEY ("status") REFERENCES "BookingStatus" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Booking" ("calendarColor", "clientId", "endAt", "eventName", "eventType", "foodTastingAt", "id", "notes", "pavilionId", "startAt", "status", "themeMotif", "totalPax") SELECT "calendarColor", "clientId", "endAt", "eventName", "eventType", "foodTastingAt", "id", "notes", "pavilionId", "startAt", "status", "themeMotif", "totalPax" FROM "Booking";
DROP TABLE "Booking";
ALTER TABLE "new_Booking" RENAME TO "Booking";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "EventTypes_name_key" ON "EventTypes"("name");
