-- AlterTable
ALTER TABLE "Employee" ADD COLUMN "empId" TEXT;

-- CreateTable
CREATE TABLE "MenuPackages" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "HowManyDishes" INTEGER,
    "ChoicesDescription" TEXT NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DishCategory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "menuPackagesId" INTEGER,
    CONSTRAINT "DishCategory_menuPackagesId_fkey" FOREIGN KEY ("menuPackagesId") REFERENCES "MenuPackages" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_DishCategory" ("id", "name") SELECT "id", "name" FROM "DishCategory";
DROP TABLE "DishCategory";
ALTER TABLE "new_DishCategory" RENAME TO "DishCategory";
CREATE UNIQUE INDEX "DishCategory_name_key" ON "DishCategory"("name");
CREATE TABLE "new_Menu" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bookingId" INTEGER,
    "menuPackagesId" INTEGER,
    CONSTRAINT "Menu_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Menu_menuPackagesId_fkey" FOREIGN KEY ("menuPackagesId") REFERENCES "MenuPackages" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Menu" ("bookingId", "id") SELECT "bookingId", "id" FROM "Menu";
DROP TABLE "Menu";
ALTER TABLE "new_Menu" RENAME TO "Menu";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
