/*
  Warnings:

  - You are about to alter the column `status` on the `Billing` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to drop the column `eventCategory` on the `Booking` table. All the data in the column will be lost.
  - You are about to alter the column `status` on the `Booking` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to drop the column `status` on the `InventoryStatus` table. All the data in the column will be lost.
  - You are about to alter the column `status` on the `Payment` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- CreateTable
CREATE TABLE "eventTypes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "BookingStatus" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "BillingStatus" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "PaymentStatus" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Billing" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bookingId" INTEGER NOT NULL,
    "totalPackage" REAL NOT NULL,
    "modeOfPaymentId" INTEGER,
    "balance" REAL NOT NULL,
    "yve" REAL NOT NULL DEFAULT 0,
    "deposit" REAL NOT NULL DEFAULT 0,
    "status" INTEGER NOT NULL,
    "dateCompleted" DATETIME,
    CONSTRAINT "Billing_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Billing_modeOfPaymentId_fkey" FOREIGN KEY ("modeOfPaymentId") REFERENCES "ModeOfPayment" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Billing_status_fkey" FOREIGN KEY ("status") REFERENCES "BillingStatus" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Billing" ("balance", "bookingId", "dateCompleted", "deposit", "id", "modeOfPaymentId", "status", "totalPackage", "yve") SELECT "balance", "bookingId", "dateCompleted", "deposit", "id", "modeOfPaymentId", "status", "totalPackage", "yve" FROM "Billing";
DROP TABLE "Billing";
ALTER TABLE "new_Billing" RENAME TO "Billing";
CREATE UNIQUE INDEX "Billing_bookingId_key" ON "Billing"("bookingId");
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
    CONSTRAINT "Booking_eventType_fkey" FOREIGN KEY ("eventType") REFERENCES "eventTypes" ("name") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Booking_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Booking_pavilionId_fkey" FOREIGN KEY ("pavilionId") REFERENCES "Pavilion" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Booking_status_fkey" FOREIGN KEY ("status") REFERENCES "BookingStatus" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Booking" ("calendarColor", "clientId", "endAt", "eventName", "foodTastingAt", "id", "notes", "pavilionId", "startAt", "status", "themeMotif", "totalPax") SELECT "calendarColor", "clientId", "endAt", "eventName", "foodTastingAt", "id", "notes", "pavilionId", "startAt", "status", "themeMotif", "totalPax" FROM "Booking";
DROP TABLE "Booking";
ALTER TABLE "new_Booking" RENAME TO "Booking";
CREATE TABLE "new_InventoryStatus" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "inventoryId" INTEGER,
    "pavilionId" INTEGER,
    "bookingId" INTEGER,
    "quantity" INTEGER,
    CONSTRAINT "InventoryStatus_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "InventoryItem" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "InventoryStatus_pavilionId_fkey" FOREIGN KEY ("pavilionId") REFERENCES "Pavilion" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "InventoryStatus_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_InventoryStatus" ("bookingId", "id", "inventoryId", "pavilionId", "quantity") SELECT "bookingId", "id", "inventoryId", "pavilionId", "quantity" FROM "InventoryStatus";
DROP TABLE "InventoryStatus";
ALTER TABLE "new_InventoryStatus" RENAME TO "InventoryStatus";
CREATE TABLE "new_Payment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "billingId" INTEGER NOT NULL,
    "clientId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" INTEGER NOT NULL,
    CONSTRAINT "Payment_billingId_fkey" FOREIGN KEY ("billingId") REFERENCES "Billing" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Payment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Payment_status_fkey" FOREIGN KEY ("status") REFERENCES "PaymentStatus" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Payment" ("amount", "billingId", "clientId", "date", "id", "name", "status") SELECT "amount", "billingId", "clientId", "date", "id", "name", "status" FROM "Payment";
DROP TABLE "Payment";
ALTER TABLE "new_Payment" RENAME TO "Payment";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "eventTypes_name_key" ON "eventTypes"("name");

-- CreateIndex
CREATE UNIQUE INDEX "BookingStatus_name_key" ON "BookingStatus"("name");

-- CreateIndex
CREATE UNIQUE INDEX "BillingStatus_name_key" ON "BillingStatus"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentStatus_name_key" ON "PaymentStatus"("name");
