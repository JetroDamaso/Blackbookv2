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
    "isDeleted" BOOLEAN DEFAULT false
);
INSERT INTO "new_Client" ("barangay", "dateCreated", "email", "firstName", "id", "isDeleted", "lastName", "municipality", "phoneNumber", "province", "region") SELECT "barangay", "dateCreated", "email", "firstName", "id", "isDeleted", "lastName", "municipality", "phoneNumber", "province", "region" FROM "Client";
DROP TABLE "Client";
ALTER TABLE "new_Client" RENAME TO "Client";
CREATE UNIQUE INDEX "Client_email_key" ON "Client"("email");
CREATE TABLE "new_Discount" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "percent" REAL,
    "amount" REAL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN DEFAULT false,
    "description" TEXT
);
INSERT INTO "new_Discount" ("amount", "description", "id", "isActive", "isDeleted", "name", "percent") SELECT "amount", "description", "id", "isActive", "isDeleted", "name", "percent" FROM "Discount";
DROP TABLE "Discount";
ALTER TABLE "new_Discount" RENAME TO "Discount";
CREATE TABLE "new_Dish" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "categoryId" INTEGER,
    "allergens" TEXT,
    "description" TEXT,
    "isDeleted" BOOLEAN DEFAULT false,
    CONSTRAINT "Dish_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "DishCategory" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Dish" ("allergens", "categoryId", "description", "id", "isDeleted", "name") SELECT "allergens", "categoryId", "description", "id", "isDeleted", "name" FROM "Dish";
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
    "isDeleted" BOOLEAN DEFAULT false,
    "lastLogin" DATETIME,
    CONSTRAINT "Employee_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Employee" ("dateOfEmployment", "firstName", "id", "isActive", "isDeleted", "lastLogin", "lastName", "password", "roleId") SELECT "dateOfEmployment", "firstName", "id", "isActive", "isDeleted", "lastLogin", "lastName", "password", "roleId" FROM "Employee";
DROP TABLE "Employee";
ALTER TABLE "new_Employee" RENAME TO "Employee";
CREATE TABLE "new_EventTypes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "isDeleted" BOOLEAN DEFAULT false
);
INSERT INTO "new_EventTypes" ("id", "isDeleted", "name") SELECT "id", "isDeleted", "name" FROM "EventTypes";
DROP TABLE "EventTypes";
ALTER TABLE "new_EventTypes" RENAME TO "EventTypes";
CREATE UNIQUE INDEX "EventTypes_name_key" ON "EventTypes"("name");
CREATE TABLE "new_InventoryItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "categoryId" INTEGER,
    "quantity" INTEGER NOT NULL,
    "out" INTEGER NOT NULL DEFAULT 0,
    "isDeleted" BOOLEAN DEFAULT false,
    CONSTRAINT "InventoryItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "InventoryCategory" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_InventoryItem" ("categoryId", "id", "isDeleted", "name", "out", "quantity") SELECT "categoryId", "id", "isDeleted", "name", "out", "quantity" FROM "InventoryItem";
DROP TABLE "InventoryItem";
ALTER TABLE "new_InventoryItem" RENAME TO "InventoryItem";
CREATE TABLE "new_ModeOfPayment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "isDeleted" BOOLEAN DEFAULT false
);
INSERT INTO "new_ModeOfPayment" ("id", "isDeleted", "name") SELECT "id", "isDeleted", "name" FROM "ModeOfPayment";
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
    "isDeleted" BOOLEAN DEFAULT false,
    CONSTRAINT "Package_pavilionId_fkey" FOREIGN KEY ("pavilionId") REFERENCES "Pavilion" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Package" ("description", "id", "includePool", "isDeleted", "name", "pavilionId", "price") SELECT "description", "id", "includePool", "isDeleted", "name", "pavilionId", "price" FROM "Package";
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
    "isDeleted" BOOLEAN DEFAULT false
);
INSERT INTO "new_Pavilion" ("color", "description", "id", "isActive", "isDeleted", "maxPax", "name", "price") SELECT "color", "description", "id", "isActive", "isDeleted", "maxPax", "name", "price" FROM "Pavilion";
DROP TABLE "Pavilion";
ALTER TABLE "new_Pavilion" RENAME TO "Pavilion";
CREATE UNIQUE INDEX "Pavilion_name_key" ON "Pavilion"("name");
CREATE TABLE "new_Role" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "isDeleted" BOOLEAN DEFAULT false
);
INSERT INTO "new_Role" ("id", "isDeleted", "name") SELECT "id", "isDeleted", "name" FROM "Role";
DROP TABLE "Role";
ALTER TABLE "new_Role" RENAME TO "Role";
CREATE TABLE "new_Rooms" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "isDeleted" BOOLEAN DEFAULT false
);
INSERT INTO "new_Rooms" ("capacity", "id", "isDeleted", "name") SELECT "capacity", "id", "isDeleted", "name" FROM "Rooms";
DROP TABLE "Rooms";
ALTER TABLE "new_Rooms" RENAME TO "Rooms";
CREATE UNIQUE INDEX "Rooms_name_key" ON "Rooms"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
