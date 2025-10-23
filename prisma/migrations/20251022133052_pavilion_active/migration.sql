-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Pavilion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "maxPax" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "color" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO "new_Pavilion" ("color", "description", "id", "maxPax", "name", "price") SELECT "color", "description", "id", "maxPax", "name", "price" FROM "Pavilion";
DROP TABLE "Pavilion";
ALTER TABLE "new_Pavilion" RENAME TO "Pavilion";
CREATE UNIQUE INDEX "Pavilion_name_key" ON "Pavilion"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
