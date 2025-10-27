/*
  Warnings:

  - You are about to drop the `MultiDayBooking` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MultiDayBookingFee` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MultiDayBookingMenu` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MultiDayBookingMenuDish` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MultiDayBookingSchedule` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MultiDayDiscountRequest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MultiDayInventoryStatus` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MultiDayNotification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MultiDayScannedDocument` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_MultiDayBookingToRooms` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "MultiDayBookingFee_multiDayBookingId_idx";

-- DropIndex
DROP INDEX "MultiDayBookingMenu_multiDayBookingId_idx";

-- DropIndex
DROP INDEX "MultiDayBookingMenuDish_multiDayBookingMenuId_dishId_key";

-- DropIndex
DROP INDEX "MultiDayBookingMenuDish_multiDayBookingMenuId_idx";

-- DropIndex
DROP INDEX "MultiDayBookingSchedule_date_idx";

-- DropIndex
DROP INDEX "MultiDayBookingSchedule_multiDayBookingId_idx";

-- DropIndex
DROP INDEX "MultiDayDiscountRequest_reviewedById_idx";

-- DropIndex
DROP INDEX "MultiDayDiscountRequest_status_idx";

-- DropIndex
DROP INDEX "MultiDayDiscountRequest_requestedById_idx";

-- DropIndex
DROP INDEX "MultiDayDiscountRequest_multiDayBookingId_idx";

-- DropIndex
DROP INDEX "MultiDayInventoryStatus_multiDayBookingId_idx";

-- DropIndex
DROP INDEX "MultiDayNotification_multiDayBookingId_idx";

-- DropIndex
DROP INDEX "MultiDayNotification_createdAt_idx";

-- DropIndex
DROP INDEX "MultiDayNotification_read_idx";

-- DropIndex
DROP INDEX "MultiDayNotification_userId_idx";

-- DropIndex
DROP INDEX "MultiDayScannedDocument_multiDayBookingId_idx";

-- DropIndex
DROP INDEX "_MultiDayBookingToRooms_B_index";

-- DropIndex
DROP INDEX "_MultiDayBookingToRooms_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "MultiDayBooking";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "MultiDayBookingFee";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "MultiDayBookingMenu";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "MultiDayBookingMenuDish";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "MultiDayBookingSchedule";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "MultiDayDiscountRequest";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "MultiDayInventoryStatus";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "MultiDayNotification";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "MultiDayScannedDocument";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_MultiDayBookingToRooms";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "dateCreated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Client" ("barangay", "dateCreated", "email", "firstName", "id", "lastName", "municipality", "phoneNumber", "province", "region") SELECT "barangay", "dateCreated", "email", "firstName", "id", "lastName", "municipality", "phoneNumber", "province", "region" FROM "Client";
DROP TABLE "Client";
ALTER TABLE "new_Client" RENAME TO "Client";
CREATE UNIQUE INDEX "Client_email_key" ON "Client"("email");
CREATE TABLE "new_Discount" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "percent" REAL,
    "amount" REAL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT
);
INSERT INTO "new_Discount" ("amount", "description", "id", "isActive", "name", "percent") SELECT "amount", "description", "id", "isActive", "name", "percent" FROM "Discount";
DROP TABLE "Discount";
ALTER TABLE "new_Discount" RENAME TO "Discount";
CREATE TABLE "new_Dish" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "categoryId" INTEGER,
    "allergens" TEXT,
    "description" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Dish_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "DishCategory" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Dish" ("allergens", "categoryId", "description", "id", "name") SELECT "allergens", "categoryId", "description", "id", "name" FROM "Dish";
DROP TABLE "Dish";
ALTER TABLE "new_Dish" RENAME TO "Dish";
CREATE TABLE "new_Employee" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "roleId" INTEGER,
    "dateOfEmployment" DATETIME NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "lastLogin" DATETIME,
    CONSTRAINT "Employee_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Employee" ("dateOfEmployment", "firstName", "id", "isActive", "lastLogin", "lastName", "password", "roleId") SELECT "dateOfEmployment", "firstName", "id", "isActive", "lastLogin", "lastName", "password", "roleId" FROM "Employee";
DROP TABLE "Employee";
ALTER TABLE "new_Employee" RENAME TO "Employee";
CREATE TABLE "new_EventTypes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_EventTypes" ("id", "name") SELECT "id", "name" FROM "EventTypes";
DROP TABLE "EventTypes";
ALTER TABLE "new_EventTypes" RENAME TO "EventTypes";
CREATE UNIQUE INDEX "EventTypes_name_key" ON "EventTypes"("name");
CREATE TABLE "new_InventoryItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "categoryId" INTEGER,
    "quantity" INTEGER NOT NULL,
    "out" INTEGER NOT NULL DEFAULT 0,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "InventoryItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "InventoryCategory" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_InventoryItem" ("categoryId", "id", "name", "out", "quantity") SELECT "categoryId", "id", "name", "out", "quantity" FROM "InventoryItem";
DROP TABLE "InventoryItem";
ALTER TABLE "new_InventoryItem" RENAME TO "InventoryItem";
CREATE TABLE "new_ModeOfPayment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_ModeOfPayment" ("id", "name") SELECT "id", "name" FROM "ModeOfPayment";
DROP TABLE "ModeOfPayment";
ALTER TABLE "new_ModeOfPayment" RENAME TO "ModeOfPayment";
CREATE UNIQUE INDEX "ModeOfPayment_name_key" ON "ModeOfPayment"("name");
CREATE TABLE "new_Package" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "pavilionId" INTEGER,
    "price" REAL NOT NULL,
    "description" TEXT NOT NULL,
    "includePool" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Package_pavilionId_fkey" FOREIGN KEY ("pavilionId") REFERENCES "Pavilion" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Package" ("description", "id", "includePool", "name", "pavilionId", "price") SELECT "description", "id", "includePool", "name", "pavilionId", "price" FROM "Package";
DROP TABLE "Package";
ALTER TABLE "new_Package" RENAME TO "Package";
CREATE TABLE "new_Pavilion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "maxPax" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "color" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Pavilion" ("color", "description", "id", "isActive", "maxPax", "name", "price") SELECT "color", "description", "id", "isActive", "maxPax", "name", "price" FROM "Pavilion";
DROP TABLE "Pavilion";
ALTER TABLE "new_Pavilion" RENAME TO "Pavilion";
CREATE UNIQUE INDEX "Pavilion_name_key" ON "Pavilion"("name");
CREATE TABLE "new_Role" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Role" ("id", "name") SELECT "id", "name" FROM "Role";
DROP TABLE "Role";
ALTER TABLE "new_Role" RENAME TO "Role";
CREATE TABLE "new_Rooms" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Rooms" ("capacity", "id", "name") SELECT "capacity", "id", "name" FROM "Rooms";
DROP TABLE "Rooms";
ALTER TABLE "new_Rooms" RENAME TO "Rooms";
CREATE UNIQUE INDEX "Rooms_name_key" ON "Rooms"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
