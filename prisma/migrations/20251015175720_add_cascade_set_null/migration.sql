-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Dish" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "categoryId" INTEGER,
    "allergens" TEXT,
    "description" TEXT,
    CONSTRAINT "Dish_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "DishCategory" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Dish" ("allergens", "categoryId", "description", "id", "name") SELECT "allergens", "categoryId", "description", "id", "name" FROM "Dish";
DROP TABLE "Dish";
ALTER TABLE "new_Dish" RENAME TO "Dish";
CREATE TABLE "new_Employee" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "roleId" INTEGER,
    "dateOfEmployment" DATETIME NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Employee_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Employee" ("dateOfEmployment", "firstName", "id", "isActive", "lastName", "password", "roleId") SELECT "dateOfEmployment", "firstName", "id", "isActive", "lastName", "password", "roleId" FROM "Employee";
DROP TABLE "Employee";
ALTER TABLE "new_Employee" RENAME TO "Employee";
CREATE TABLE "new_HistoryLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bookingId" INTEGER,
    "employeeId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HistoryLog_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "HistoryLog_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_HistoryLog" ("bookingId", "createdAt", "employeeId", "id") SELECT "bookingId", "createdAt", "employeeId", "id" FROM "HistoryLog";
DROP TABLE "HistoryLog";
ALTER TABLE "new_HistoryLog" RENAME TO "HistoryLog";
CREATE TABLE "new_InventoryItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "categoryId" INTEGER,
    "quantity" INTEGER NOT NULL,
    "out" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "InventoryItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "InventoryCategory" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_InventoryItem" ("categoryId", "id", "name", "out", "quantity") SELECT "categoryId", "id", "name", "out", "quantity" FROM "InventoryItem";
DROP TABLE "InventoryItem";
ALTER TABLE "new_InventoryItem" RENAME TO "InventoryItem";
CREATE TABLE "new_Menu" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bookingId" INTEGER,
    CONSTRAINT "Menu_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Menu" ("bookingId", "id") SELECT "bookingId", "id" FROM "Menu";
DROP TABLE "Menu";
ALTER TABLE "new_Menu" RENAME TO "Menu";
CREATE TABLE "new_MenuDish" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "menuId" INTEGER,
    "dishId" INTEGER,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "MenuDish_dishId_fkey" FOREIGN KEY ("dishId") REFERENCES "Dish" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "MenuDish_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "Menu" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_MenuDish" ("dishId", "id", "menuId", "quantity") SELECT "dishId", "id", "menuId", "quantity" FROM "MenuDish";
DROP TABLE "MenuDish";
ALTER TABLE "new_MenuDish" RENAME TO "MenuDish";
CREATE UNIQUE INDEX "MenuDish_menuId_dishId_key" ON "MenuDish"("menuId", "dishId");
CREATE TABLE "new_OtherService" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "categoryId" INTEGER,
    "amount" REAL,
    "description" TEXT,
    "packageId" INTEGER,
    CONSTRAINT "OtherService_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "OtherServiceCategory" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_OtherService" ("amount", "categoryId", "description", "id", "name", "packageId") SELECT "amount", "categoryId", "description", "id", "name", "packageId" FROM "OtherService";
DROP TABLE "OtherService";
ALTER TABLE "new_OtherService" RENAME TO "OtherService";
CREATE TABLE "new_Package" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "pavilionId" INTEGER,
    "price" REAL NOT NULL,
    "description" TEXT NOT NULL,
    "includePool" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Package_pavilionId_fkey" FOREIGN KEY ("pavilionId") REFERENCES "Pavilion" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Package" ("description", "id", "includePool", "name", "pavilionId", "price") SELECT "description", "id", "includePool", "name", "pavilionId", "price" FROM "Package";
DROP TABLE "Package";
ALTER TABLE "new_Package" RENAME TO "Package";
CREATE TABLE "new_Payment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "billingId" INTEGER,
    "clientId" INTEGER,
    "name" TEXT,
    "amount" REAL NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,
    CONSTRAINT "Payment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Payment_billingId_fkey" FOREIGN KEY ("billingId") REFERENCES "Billing" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Payment" ("amount", "billingId", "clientId", "date", "id", "name", "status") SELECT "amount", "billingId", "clientId", "date", "id", "name", "status" FROM "Payment";
DROP TABLE "Payment";
ALTER TABLE "new_Payment" RENAME TO "Payment";
CREATE TABLE "new_ScannedDocument" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bookingId" INTEGER,
    "name" TEXT NOT NULL,
    "categoryId" INTEGER,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "file" TEXT NOT NULL,
    CONSTRAINT "ScannedDocument_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ScannedDocumentCategory" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ScannedDocument_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ScannedDocument" ("bookingId", "categoryId", "date", "file", "id", "name") SELECT "bookingId", "categoryId", "date", "file", "id", "name" FROM "ScannedDocument";
DROP TABLE "ScannedDocument";
ALTER TABLE "new_ScannedDocument" RENAME TO "ScannedDocument";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
