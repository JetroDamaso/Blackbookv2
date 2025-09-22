/*
  Warnings:

  - You are about to drop the `AdditionalCharges` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AdditionalCharges_MasterList` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BookingTable` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ClientTable` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Discounts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Dishes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EmployeeRole` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EmployeeTable` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `HistoryLogs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `InventoryStatusTable` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Inventory_MasterList` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Inventory_MasterList_Category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ModeOfPayments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OtherServices` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OtherServices_Category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OtherServices_MasterList` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PavillionTable` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Payments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_DishesToMenu` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_OtherServicesToOtherServices_MasterList` table. If the table is not empty, all the data it contains will be lost.
  - The primary key for the `Billing` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `YVE` on the `Billing` table. All the data in the column will be lost.
  - You are about to drop the column `billing_id` on the `Billing` table. All the data in the column will be lost.
  - You are about to drop the column `booking_id` on the `Billing` table. All the data in the column will be lost.
  - You are about to drop the column `date_completed` on the `Billing` table. All the data in the column will be lost.
  - You are about to drop the column `mode_of_payment` on the `Billing` table. All the data in the column will be lost.
  - You are about to drop the column `total_package` on the `Billing` table. All the data in the column will be lost.
  - The primary key for the `DishCategory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `dish_category_id` on the `DishCategory` table. All the data in the column will be lost.
  - You are about to drop the column `booking_id` on the `Menu` table. All the data in the column will be lost.
  - You are about to drop the column `ref_allergens` on the `Menu` table. All the data in the column will be lost.
  - You are about to drop the column `ref_category` on the `Menu` table. All the data in the column will be lost.
  - You are about to drop the column `ref_description` on the `Menu` table. All the data in the column will be lost.
  - You are about to drop the column `ref_dish_name` on the `Menu` table. All the data in the column will be lost.
  - The primary key for the `ScannedDocument` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `booking_id` on the `ScannedDocument` table. All the data in the column will be lost.
  - You are about to drop the column `document_id` on the `ScannedDocument` table. All the data in the column will be lost.
  - You are about to drop the column `ref_category` on the `ScannedDocument` table. All the data in the column will be lost.
  - You are about to drop the column `sc_id` on the `ScannedDocument` table. All the data in the column will be lost.
  - The primary key for the `ScannedDocumentCategory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `sc_id` on the `ScannedDocumentCategory` table. All the data in the column will be lost.
  - Added the required column `bookingId` to the `Billing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `Billing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalPackage` to the `Billing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `DishCategory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bookingId` to the `Menu` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bookingId` to the `ScannedDocument` table without a default value. This is not possible if the table is not empty.
  - Added the required column `categoryId` to the `ScannedDocument` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `ScannedDocument` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `ScannedDocumentCategory` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "PavillionTable_pavillion_id_name_key";

-- DropIndex
DROP INDEX "PavillionTable_pavillion_id_name_price_key";

-- DropIndex
DROP INDEX "_DishesToMenu_B_index";

-- DropIndex
DROP INDEX "_DishesToMenu_AB_unique";

-- DropIndex
DROP INDEX "_OtherServicesToOtherServices_MasterList_B_index";

-- DropIndex
DROP INDEX "_OtherServicesToOtherServices_MasterList_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "AdditionalCharges";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "AdditionalCharges_MasterList";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "BookingTable";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ClientTable";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Discounts";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Dishes";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "EmployeeRole";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "EmployeeTable";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "HistoryLogs";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "InventoryStatusTable";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Inventory_MasterList";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Inventory_MasterList_Category";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ModeOfPayments";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "OtherServices";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "OtherServices_Category";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "OtherServices_MasterList";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "PavillionTable";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Payments";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_DishesToMenu";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_OtherServicesToOtherServices_MasterList";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Client" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Role" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "roleId" INTEGER NOT NULL,
    "dateOfEmployment" DATETIME NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Employee_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Pavilion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "maxPax" INTEGER NOT NULL,
    "description" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "InventoryCategory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "InventoryItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "out" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "InventoryItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "InventoryCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "eventName" TEXT NOT NULL,
    "clientId" INTEGER,
    "pavilionId" INTEGER,
    "eventCategory" TEXT NOT NULL,
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

-- CreateTable
CREATE TABLE "Dish" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "allergens" TEXT,
    "description" TEXT,
    CONSTRAINT "Dish_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "DishCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AdditionalCharge" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bookingId" INTEGER,
    "name" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "description" TEXT,
    "note" TEXT,
    CONSTRAINT "AdditionalCharge_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OtherServiceCategory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "OtherServiceMaster" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "amount" REAL NOT NULL,
    "description" TEXT,
    CONSTRAINT "OtherServiceMaster_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "OtherServiceCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OtherService" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bookingId" INTEGER,
    "masterId" INTEGER NOT NULL,
    "amount" REAL,
    "note" TEXT,
    CONSTRAINT "OtherService_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "OtherService_masterId_fkey" FOREIGN KEY ("masterId") REFERENCES "OtherServiceMaster" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InventoryStatus" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "inventoryId" INTEGER,
    "pavilionId" INTEGER,
    "bookingId" INTEGER,
    "quantity" INTEGER,
    "status" INTEGER,
    CONSTRAINT "InventoryStatus_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "InventoryItem" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "InventoryStatus_pavilionId_fkey" FOREIGN KEY ("pavilionId") REFERENCES "Pavilion" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "InventoryStatus_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HistoryLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bookingId" INTEGER NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HistoryLog_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "HistoryLog_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ModeOfPayment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "billingId" INTEGER NOT NULL,
    "clientId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,
    CONSTRAINT "Payment_billingId_fkey" FOREIGN KEY ("billingId") REFERENCES "Billing" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Payment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Discount" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "percent" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "_DishToMenu" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_DishToMenu_A_fkey" FOREIGN KEY ("A") REFERENCES "Dish" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_DishToMenu_B_fkey" FOREIGN KEY ("B") REFERENCES "Menu" ("id") ON DELETE CASCADE ON UPDATE CASCADE
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
    "status" TEXT NOT NULL,
    "dateCompleted" DATETIME,
    CONSTRAINT "Billing_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Billing_modeOfPaymentId_fkey" FOREIGN KEY ("modeOfPaymentId") REFERENCES "ModeOfPayment" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Billing" ("balance", "deposit", "status") SELECT "balance", "deposit", "status" FROM "Billing";
DROP TABLE "Billing";
ALTER TABLE "new_Billing" RENAME TO "Billing";
CREATE UNIQUE INDEX "Billing_bookingId_key" ON "Billing"("bookingId");
CREATE TABLE "new_DishCategory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);
INSERT INTO "new_DishCategory" ("name") SELECT "name" FROM "DishCategory";
DROP TABLE "DishCategory";
ALTER TABLE "new_DishCategory" RENAME TO "DishCategory";
CREATE UNIQUE INDEX "DishCategory_name_key" ON "DishCategory"("name");
CREATE TABLE "new_Menu" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bookingId" INTEGER NOT NULL,
    CONSTRAINT "Menu_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Menu" ("id") SELECT "id" FROM "Menu";
DROP TABLE "Menu";
ALTER TABLE "new_Menu" RENAME TO "Menu";
CREATE TABLE "new_ScannedDocument" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bookingId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "file" TEXT NOT NULL,
    CONSTRAINT "ScannedDocument_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ScannedDocument_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ScannedDocumentCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ScannedDocument" ("date", "file", "name") SELECT "date", "file", "name" FROM "ScannedDocument";
DROP TABLE "ScannedDocument";
ALTER TABLE "new_ScannedDocument" RENAME TO "ScannedDocument";
CREATE TABLE "new_ScannedDocumentCategory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);
INSERT INTO "new_ScannedDocumentCategory" ("name") SELECT "name" FROM "ScannedDocumentCategory";
DROP TABLE "ScannedDocumentCategory";
ALTER TABLE "new_ScannedDocumentCategory" RENAME TO "ScannedDocumentCategory";
CREATE UNIQUE INDEX "ScannedDocumentCategory_name_key" ON "ScannedDocumentCategory"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Pavilion_name_key" ON "Pavilion"("name");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryCategory_name_key" ON "InventoryCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ModeOfPayment_name_key" ON "ModeOfPayment"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Discount_name_key" ON "Discount"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_DishToMenu_AB_unique" ON "_DishToMenu"("A", "B");

-- CreateIndex
CREATE INDEX "_DishToMenu_B_index" ON "_DishToMenu"("B");
