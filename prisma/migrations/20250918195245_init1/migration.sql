-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Booking" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "eventName" TEXT NOT NULL,
    "clientId" INTEGER,
    "pavilionId" INTEGER,
    "eventCategory" TEXT,
    "calendarColor" TEXT,
    "startAt" DATETIME NOT NULL,
    "endAt" DATETIME NOT NULL,
    "foodTastingAt" DATETIME,
    "totalPax" INTEGER NOT NULL,
    "themeMotif" TEXT,
    "status" TEXT NOT NULL,
    "notes" TEXT,
    CONSTRAINT "Booking_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Booking_pavilionId_fkey" FOREIGN KEY ("pavilionId") REFERENCES "Pavilion" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Booking" ("calendarColor", "clientId", "endAt", "eventCategory", "eventName", "foodTastingAt", "id", "notes", "pavilionId", "startAt", "status", "themeMotif", "totalPax") SELECT "calendarColor", "clientId", "endAt", "eventCategory", "eventName", "foodTastingAt", "id", "notes", "pavilionId", "startAt", "status", "themeMotif", "totalPax" FROM "Booking";
DROP TABLE "Booking";
ALTER TABLE "new_Booking" RENAME TO "Booking";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
