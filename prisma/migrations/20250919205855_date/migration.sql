/*
  Warnings:

  - You are about to drop the column `endAt` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `startAt` on the `Booking` table. All the data in the column will be lost.
  - Added the required column `endDate` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endTime` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
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
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
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
INSERT INTO "new_Booking" ("calendarColor", "clientId", "eventName", "eventType", "foodTastingAt", "id", "notes", "pavilionId", "status", "themeMotif", "totalPax") SELECT "calendarColor", "clientId", "eventName", "eventType", "foodTastingAt", "id", "notes", "pavilionId", "status", "themeMotif", "totalPax" FROM "Booking";
DROP TABLE "Booking";
ALTER TABLE "new_Booking" RENAME TO "Booking";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
