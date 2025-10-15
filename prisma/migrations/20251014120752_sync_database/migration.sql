/*
  Warnings:

  - You are about to drop the `BillingStatus` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BookingStatus` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PaymentStatus` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_DishToMenu` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "BillingStatus_name_key";

-- DropIndex
DROP INDEX "BookingStatus_name_key";

-- DropIndex
DROP INDEX "PaymentStatus_name_key";

-- DropIndex
DROP INDEX "_DishToMenu_B_index";

-- DropIndex
DROP INDEX "_DishToMenu_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "BillingStatus";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "BookingStatus";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "PaymentStatus";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_DishToMenu";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "MenuDish" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "menuId" INTEGER NOT NULL,
    "dishId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "MenuDish_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "Menu" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MenuDish_dishId_fkey" FOREIGN KEY ("dishId") REFERENCES "Dish" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Billing" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bookingId" INTEGER NOT NULL,
    "originalPrice" REAL NOT NULL,
    "discountedPrice" REAL NOT NULL,
    "discountType" TEXT NOT NULL,
    "discountPercentage" REAL NOT NULL,
    "balance" REAL NOT NULL,
    "modeOfPayment" TEXT NOT NULL,
    "yve" REAL NOT NULL DEFAULT 0,
    "deposit" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL,
    "dateCompleted" DATETIME,
    CONSTRAINT "Billing_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Billing" ("balance", "bookingId", "dateCompleted", "deposit", "discountPercentage", "discountType", "discountedPrice", "id", "modeOfPayment", "originalPrice", "status", "yve") SELECT "balance", "bookingId", "dateCompleted", "deposit", "discountPercentage", "discountType", "discountedPrice", "id", "modeOfPayment", "originalPrice", "status", "yve" FROM "Billing";
DROP TABLE "Billing";
ALTER TABLE "new_Billing" RENAME TO "Billing";
CREATE UNIQUE INDEX "Billing_bookingId_key" ON "Billing"("bookingId");
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
    "notes" TEXT,
    "ref_pavilionName" TEXT,
    "ref_clientFullName" TEXT,
    CONSTRAINT "Booking_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Booking_eventType_fkey" FOREIGN KEY ("eventType") REFERENCES "EventTypes" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Booking_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Booking_pavilionId_fkey" FOREIGN KEY ("pavilionId") REFERENCES "Pavilion" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Booking" ("calendarColor", "catering", "clientId", "endAt", "eventName", "eventType", "foodTastingAt", "id", "notes", "packageId", "pavilionId", "startAt", "status", "themeMotif", "totalPax") SELECT "calendarColor", "catering", "clientId", "endAt", "eventName", "eventType", "foodTastingAt", "id", "notes", "packageId", "pavilionId", "startAt", "status", "themeMotif", "totalPax" FROM "Booking";
DROP TABLE "Booking";
ALTER TABLE "new_Booking" RENAME TO "Booking";
CREATE TABLE "new_Client" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "municipality" TEXT NOT NULL,
    "barangay" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "dateCreated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Client" ("barangay", "email", "firstName", "id", "lastName", "municipality", "phoneNumber", "province", "region") SELECT "barangay", "email", "firstName", "id", "lastName", "municipality", "phoneNumber", "province", "region" FROM "Client";
DROP TABLE "Client";
ALTER TABLE "new_Client" RENAME TO "Client";
CREATE UNIQUE INDEX "Client_email_key" ON "Client"("email");
CREATE TABLE "new_Payment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "billingId" INTEGER NOT NULL,
    "clientId" INTEGER NOT NULL,
    "name" TEXT,
    "amount" REAL NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,
    CONSTRAINT "Payment_billingId_fkey" FOREIGN KEY ("billingId") REFERENCES "Billing" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Payment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Payment" ("amount", "billingId", "clientId", "date", "id", "name", "status") SELECT "amount", "billingId", "clientId", "date", "id", "name", "status" FROM "Payment";
DROP TABLE "Payment";
ALTER TABLE "new_Payment" RENAME TO "Payment";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "MenuDish_menuId_dishId_key" ON "MenuDish"("menuId", "dishId");
